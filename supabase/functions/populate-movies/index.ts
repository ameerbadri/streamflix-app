import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[POPULATE-MOVIES] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const tmdbApiKey = Deno.env.get("TMDB_API_KEY");
    if (!tmdbApiKey) throw new Error("TMDB_API_KEY is not set");
    logStep("TMDb API key verified");

    // Use service role key to bypass RLS for inserting movies
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Fetch top movies since 1970 using TMDb discover endpoint
    const allMovies: any[] = [];
    const targetMovieCount = 1000;
    const moviesPerPage = 20; // TMDb returns 20 movies per page
    const maxPages = Math.ceil(targetMovieCount / moviesPerPage); // 50 pages to get 1000 movies

    // Use two different sorting methods to get diverse top movies
    const sortingMethods = [
      'popularity.desc',
      'vote_average.desc'
    ];

    for (const sortBy of sortingMethods) {
      const pagesForThisSort = Math.ceil(maxPages / sortingMethods.length);
      logStep(`Fetching top movies sorted by ${sortBy}`);
      
      for (let page = 1; page <= pagesForThisSort; page++) {
        try {
          const tmdbResponse = await fetch(
            `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&language=en-US&sort_by=${sortBy}&page=${page}&primary_release_date.gte=1970-01-01&vote_count.gte=100&include_adult=false`
          );
          
          if (!tmdbResponse.ok) {
            logStep(`Error fetching page ${page} with sort ${sortBy}`, { status: tmdbResponse.status });
            continue;
          }

          const tmdbData = await tmdbResponse.json();
          if (tmdbData.results && tmdbData.results.length > 0) {
            allMovies.push(...tmdbData.results);
            logStep(`Fetched ${tmdbData.results.length} movies from page ${page} (${sortBy})`);
          }
          
          // Add delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 150));
          
          // Stop if we've reached our target
          if (allMovies.length >= targetMovieCount) {
            logStep(`Reached target of ${targetMovieCount} movies`);
            break;
          }
        } catch (error) {
          logStep(`Error fetching page ${page} with sort ${sortBy}`, { error: error.message });
          continue;
        }
      }
      
      if (allMovies.length >= targetMovieCount) break;
    }

    // Remove duplicates based on TMDb ID and limit to 1000
    const uniqueMovies = allMovies
      .filter((movie, index, self) => 
        index === self.findIndex(m => m.id === movie.id)
      )
      .slice(0, targetMovieCount);

    logStep("Fetched top movies since 1970", { 
      total: allMovies.length, 
      unique: uniqueMovies.length,
      target: targetMovieCount
    });

    // Transform TMDb data to our schema and fetch trailer URLs
    const moviesToInsert = [];
    
    for (let i = 0; i < uniqueMovies.length; i++) {
      const movie = uniqueMovies[i];
      
      // Fetch trailer for this movie
      let trailerUrl = null;
      try {
        const videosResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${tmdbApiKey}&language=en-US`
        );
        
        if (videosResponse.ok) {
          const videosData = await videosResponse.json();
          const trailer = videosData.results?.find((video: any) => 
            video.type === 'Trailer' && video.site === 'YouTube'
          );
          
          if (trailer) {
            trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
          }
        }
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        logStep(`Error fetching trailer for movie ${movie.title}`, { error: error.message });
      }
      
      // Randomly assign subscription tier for demo purposes
      const subscriptionTier = Math.random() > 0.7 ? 'Premium' : 'Basic';
      
      moviesToInsert.push({
        title: movie.title,
        description: movie.overview,
        genre: movie.genre_ids ? [getGenreName(movie.genre_ids[0] || 28)] : ['Action'], // Default to Action if no genre
        rating: movie.vote_average ? Math.round(movie.vote_average * 10) / 10 : null,
        release_year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
        duration_minutes: Math.floor(Math.random() * 60) + 90, // Random duration between 90-150 minutes
        poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        subscription_tier: subscriptionTier,
        video_url: null, // We don't have actual video URLs
        trailer_url: trailerUrl,
      });
      
      // Log progress every 50 movies
      if ((i + 1) % 50 === 0) {
        logStep(`Processed ${i + 1}/${uniqueMovies.length} movies`);
      }
    }

    logStep("Transformed movies data", { count: moviesToInsert.length });

    // Clear all existing data first (including related tables)
    logStep("Clearing existing data from all movie-related tables");
    
    // Delete from tables that reference movies (due to foreign key constraints)
    await supabaseClient.from('cast_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseClient.from('crew_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseClient.from('user_ratings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseClient.from('viewing_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseClient.from('watchlist').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Delete all movies
    await supabaseClient.from('movies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    logStep("Cleared all existing data, inserting fresh movie data");

    // Insert movies into database
    const { data, error } = await supabaseClient
      .from('movies')
      .insert(moviesToInsert)
      .select();

    if (error) {
      logStep("Database insert error", { error: error.message });
      throw new Error(`Database error: ${error.message}`);
    }

    logStep("Successfully inserted movies", { count: data?.length });

    // Now fetch and insert cast/crew data for each movie
    logStep("Fetching cast and crew data for movies");
    let castCount = 0;
    let crewCount = 0;

    for (let i = 0; i < uniqueMovies.length && i < data.length; i++) {
      const tmdbMovie = uniqueMovies[i];
      const insertedMovie = data[i];
      
      try {
        // Fetch credits (cast and crew) for this movie
        const creditsResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${tmdbMovie.id}/credits?api_key=${tmdbApiKey}`
        );
        
        if (creditsResponse.ok) {
          const creditsData = await creditsResponse.json();
          
          // Insert cast members (limit to top 10)
          if (creditsData.cast && creditsData.cast.length > 0) {
            const castToInsert = creditsData.cast.slice(0, 10).map((castMember: any, index: number) => ({
              movie_id: insertedMovie.id,
              tmdb_person_id: castMember.id,
              name: castMember.name,
              character_name: castMember.character,
              profile_picture_url: castMember.profile_path ? `https://image.tmdb.org/t/p/w500${castMember.profile_path}` : null,
              order_position: index
            }));
            
            const { error: castError } = await supabaseClient
              .from('cast_members')
              .insert(castToInsert);
            
            if (!castError) {
              castCount += castToInsert.length;
            }
          }
          
          // Insert key crew members (director, writer, producer)
          if (creditsData.crew && creditsData.crew.length > 0) {
            const keyJobs = ['Director', 'Writer', 'Producer', 'Executive Producer', 'Screenplay', 'Story'];
            const crewToInsert = creditsData.crew
              .filter((crewMember: any) => keyJobs.includes(crewMember.job))
              .slice(0, 15) // Limit to 15 key crew members
              .map((crewMember: any) => ({
                movie_id: insertedMovie.id,
                tmdb_person_id: crewMember.id,
                name: crewMember.name,
                job: crewMember.job,
                department: crewMember.department,
                profile_picture_url: crewMember.profile_path ? `https://image.tmdb.org/t/p/w500${crewMember.profile_path}` : null
              }));
            
            if (crewToInsert.length > 0) {
              const { error: crewError } = await supabaseClient
                .from('crew_members')
                .insert(crewToInsert);
              
              if (!crewError) {
                crewCount += crewToInsert.length;
              }
            }
          }
        }
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Log progress every 25 movies
        if ((i + 1) % 25 === 0) {
          logStep(`Processed cast/crew for ${i + 1}/${data.length} movies`);
        }
      } catch (error) {
        logStep(`Error fetching credits for movie ${tmdbMovie.title}`, { error: error.message });
      }
    }

    logStep("Successfully inserted cast and crew data", { castCount, crewCount });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully added ${data?.length} movies with ${castCount} cast members and ${crewCount} crew members`,
        movies: data?.length,
        cast: castCount,
        crew: crewCount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in populate-movies", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Helper function to map genre IDs to names
function getGenreName(genreId: number): string {
  const genreMap: { [key: number]: string } = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Science Fiction',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western',
  };
  
  return genreMap[genreId] || 'Drama';
}