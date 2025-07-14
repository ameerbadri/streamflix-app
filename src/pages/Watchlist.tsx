import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Film } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import MovieCard from '@/components/MovieCard';

interface Movie {
  id: string;
  title: string;
  description: string;
  genre: string[];
  release_year: number;
  duration_minutes: number;
  rating: number;
  poster_url: string;
  subscription_tier: string;
}

const Watchlist = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchWatchlist();
  }, [user, navigate]);

  const fetchWatchlist = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch watchlist with movie data
      const { data: watchlistData, error } = await supabase
        .from('watchlist')
        .select(`
          movie_id,
          movies (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const movieList = watchlistData?.map(item => item.movies).filter(Boolean) || [];
      setMovies(movieList as Movie[]);

      // Fetch user ratings
      const { data: ratingsData } = await supabase
        .from('user_ratings')
        .select('movie_id, rating')
        .eq('user_id', user.id);

      if (ratingsData) {
        const ratingsMap = ratingsData.reduce((acc, item) => {
          acc[item.movie_id] = item.rating;
          return acc;
        }, {} as Record<string, number>);
        setUserRatings(ratingsMap);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Film className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your watchlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Movies
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">My Watchlist</h1>
        </div>

        {movies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isInWatchlist={true}
                userRating={userRatings[movie.id]}
                onWatchlistUpdate={fetchWatchlist}
                onRatingUpdate={fetchWatchlist}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Film className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Your watchlist is empty</h3>
              <p className="text-muted-foreground mb-4">
                Add movies to your watchlist to keep track of what you want to watch
              </p>
              <Link to="/">
                <Button>Browse Movies</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Watchlist;