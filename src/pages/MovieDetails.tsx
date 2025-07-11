import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Play, 
  Plus, 
  Check, 
  Star, 
  Clock, 
  Calendar,
  Crown,
  Heart,
  Share2,
  Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  trailer_url?: string;
  video_url?: string;
  created_at?: string;
}

interface CastMember {
  id: string;
  name: string;
  character_name: string;
  profile_picture_url: string;
  order_position: number;
}

interface CrewMember {
  id: string;
  name: string;
  job: string;
  department: string;
  profile_picture_url: string;
}

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, subscribed, subscriptionTier } = useAuth();
  const { toast } = useToast();
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [castLoading, setCastLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchMovieDetails();
      fetchCastAndCrew();
      if (user) {
        fetchUserData();
      }
    }
  }, [id, user]);

  const fetchMovieDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setMovie(data);
    } catch (error) {
      console.error('Error fetching movie:', error);
      toast({
        title: "Error",
        description: "Failed to load movie details",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchCastAndCrew = async () => {
    if (!id) return;
    
    setCastLoading(true);
    try {
      // Fetch cast members
      const { data: castData, error: castError } = await supabase
        .from('cast_members')
        .select('*')
        .eq('movie_id', id)
        .order('order_position', { ascending: true });
      
      if (!castError && castData) {
        setCast(castData);
      }

      // Fetch crew members
      const { data: crewData, error: crewError } = await supabase
        .from('crew_members')
        .select('*')
        .eq('movie_id', id)
        .order('job', { ascending: true });
      
      if (!crewError && crewData) {
        setCrew(crewData);
      }
    } catch (error) {
      console.error('Error fetching cast and crew:', error);
    } finally {
      setCastLoading(false);
    }
  };

  const fetchUserData = async () => {
    if (!user || !id) return;

    try {
      // Check watchlist
      const { data: watchlistData } = await supabase
        .from('watchlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('movie_id', id)
        .single();
      
      setIsInWatchlist(!!watchlistData);

      // Check user rating
      const { data: ratingData } = await supabase
        .from('user_ratings')
        .select('rating')
        .eq('user_id', user.id)
        .eq('movie_id', id)
        .single();
      
      setUserRating(ratingData?.rating || null);
    } catch (error) {
      // Ignore errors for missing data
    }
  };

  const hasAccess = () => {
    if (!subscribed) return false;
    if (movie?.subscription_tier === 'Basic') return true;
    return subscriptionTier === 'Premium';
  };

  const toggleWatchlist = async () => {
    if (!user || !movie) return;
    
    setActionLoading(true);
    try {
      if (isInWatchlist) {
        const { error } = await supabase
          .from('watchlist')
          .delete()
          .eq('user_id', user.id)
          .eq('movie_id', movie.id);
        
        if (error) throw error;
        setIsInWatchlist(false);
        
        toast({
          title: "Removed from watchlist",
          description: `${movie.title} removed from your watchlist`,
        });
      } else {
        const { error } = await supabase
          .from('watchlist')
          .insert({ user_id: user.id, movie_id: movie.id });
        
        if (error) throw error;
        setIsInWatchlist(true);
        
        toast({
          title: "Added to watchlist",
          description: `${movie.title} added to your watchlist`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const rateMovie = async (rating: number) => {
    if (!user || !movie) return;
    
    try {
      const { error } = await supabase
        .from('user_ratings')
        .upsert({
          user_id: user.id,
          movie_id: movie.id,
          rating
        });
      
      if (error) throw error;
      setUserRating(rating);
      
      toast({
        title: "Rating saved",
        description: `You rated ${movie.title} ${rating} stars`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePlay = () => {
    if (!movie) return;
    
    if (!hasAccess()) {
      toast({
        title: "Subscription required",
        description: `You need a ${movie.subscription_tier} subscription to watch this movie`,
        variant: "destructive",
      });
      return;
    }
    
    // Add to viewing history
    if (user) {
      supabase
        .from('viewing_history')
        .insert({
          user_id: user.id,
          movie_id: movie.id,
          progress_seconds: 0,
          completed: false
        })
        .then(() => {
          toast({
            title: "Now playing",
            description: `Playing ${movie.title}`,
          });
        });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie?.title,
        text: movie?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Movie link copied to clipboard",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-muted-foreground">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Movie not found</h2>
          <Link to="/">
            <Button>Back to Movies</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              StreamFlix
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Movie Poster */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-full h-auto object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </Card>
          </div>

          {/* Movie Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Actions */}
            <div className="space-y-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
                    <div className="flex items-center gap-4 text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {movie.release_year}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {Math.floor(movie.duration_minutes / 60)}h {movie.duration_minutes % 60}m
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {movie.rating}/10
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={movie.subscription_tier === 'Premium' ? 'default' : 'secondary'}
                    className="flex items-center gap-1"
                  >
                    <Crown className="h-3 w-3" />
                    {movie.subscription_tier}
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button 
                    size="lg" 
                    onClick={handlePlay}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    {hasAccess() ? 'Play Movie' : 'Subscribe to Watch'}
                  </Button>
                  
                  {user && (
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={toggleWatchlist}
                      disabled={actionLoading}
                    >
                      {isInWatchlist ? (
                        <>
                          <Check className="h-5 w-5 mr-2" />
                          In Watchlist
                        </>
                      ) : (
                        <>
                          <Plus className="h-5 w-5 mr-2" />
                          Add to Watchlist
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button variant="outline" size="lg" onClick={handleShare}>
                    <Share2 className="h-5 w-5 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>

            {/* Genres */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {movie.genre.map((genre) => (
                  <Badge key={genre} variant="outline" className="text-sm">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Synopsis */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Synopsis</h3>
              <p className="text-muted-foreground leading-relaxed">
                {movie.description}
              </p>
            </div>

            {/* User Rating */}
            {user && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Your Rating</h3>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => rateMovie(star)}
                      className="transition-colors p-1"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          userRating && star <= userRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground hover:text-yellow-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {userRating && (
                  <p className="text-sm text-muted-foreground mt-2">
                    You rated this movie {userRating} out of 5 stars
                  </p>
                )}
              </div>
            )}

            <Separator />

            {/* Movie Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">Movie Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Release Year:</span>
                      <span>{movie.release_year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{Math.floor(movie.duration_minutes / 60)}h {movie.duration_minutes % 60}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rating:</span>
                      <span>{movie.rating}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subscription:</span>
                      <span>{movie.subscription_tier}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">Cast & Crew</h4>
                  {castLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="h-6 w-6 animate-spin border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Top Cast */}
                      {cast.length > 0 && (
                        <div>
                          <h5 className="font-medium text-sm mb-2">Main Cast</h5>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {cast.slice(0, 6).map((member) => (
                              <div key={member.id} className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                                  {member.profile_picture_url ? (
                                    <img
                                      src={member.profile_picture_url}
                                      alt={member.name}
                                      className="h-full w-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                                      }}
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-muted">
                                      <span className="text-xs text-muted-foreground">
                                        {member.name.charAt(0)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-xs truncate">{member.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {member.character_name}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Key Crew */}
                      {crew.length > 0 && (
                        <div>
                          <h5 className="font-medium text-sm mb-2">Key Crew</h5>
                          <div className="space-y-1 text-sm">
                            {crew.slice(0, 4).map((member) => (
                              <div key={member.id} className="flex justify-between">
                                <span className="text-muted-foreground">{member.job}:</span>
                                <span className="font-medium">{member.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {cast.length === 0 && crew.length === 0 && (
                        <div className="text-sm text-muted-foreground text-center py-2">
                          No cast and crew information available
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;