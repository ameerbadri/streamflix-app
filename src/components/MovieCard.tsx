import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, Play, Plus, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TrailerModal from './TrailerModal';

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

interface MovieCardProps {
  movie: Movie;
  isInWatchlist?: boolean;
  userRating?: number;
  onWatchlistUpdate?: () => void;
  onRatingUpdate?: () => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ 
  movie, 
  isInWatchlist, 
  userRating, 
  onWatchlistUpdate,
  onRatingUpdate 
}) => {
  const { user, subscribed, subscriptionTier } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  const hasAccess = () => {
    if (!subscribed) return false;
    if (movie.subscription_tier === 'Basic') return true;
    return subscriptionTier === 'Premium';
  };

  const toggleWatchlist = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (isInWatchlist) {
        const { error } = await supabase
          .from('watchlist')
          .delete()
          .eq('user_id', user.id)
          .eq('movie_id', movie.id);
        
        if (error) throw error;
        
        toast({
          title: "Removed from watchlist",
          description: `${movie.title} removed from your watchlist`,
        });
      } else {
        const { error } = await supabase
          .from('watchlist')
          .insert({ user_id: user.id, movie_id: movie.id });
        
        if (error) throw error;
        
        toast({
          title: "Added to watchlist",
          description: `${movie.title} added to your watchlist`,
        });
      }
      
      onWatchlistUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const rateMovie = async (rating: number) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_ratings')
        .upsert({
          user_id: user.id,
          movie_id: movie.id,
          rating
        });
      
      if (error) throw error;
      
      toast({
        title: "Rating saved",
        description: `You rated ${movie.title} ${rating} stars`,
      });
      
      onRatingUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addToHistory = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('viewing_history')
        .insert({
          user_id: user.id,
          movie_id: movie.id,
          progress_seconds: 0,
          completed: false
        });
    } catch (error) {
      console.error('Error adding to history:', error);
    }
  };

  const handlePlay = () => {
    if (!hasAccess()) {
      toast({
        title: "Subscription required",
        description: `You need a ${movie.subscription_tier} subscription to watch this movie`,
        variant: "destructive",
      });
      return;
    }
    
    // Show trailer modal instead of playing immediately
    setShowTrailer(true);
    addToHistory();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  };

  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <Link to={`/movie/${movie.id}`} className="block" onClick={handleCardClick}>
      <Card className="group overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
        <div className="relative">
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-full h-64 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={(e) => handleButtonClick(e, handlePlay)}
                className="bg-white text-black hover:bg-white/90"
              >
                <Play className="h-4 w-4 mr-1" />
                Play
              </Button>
              {user && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => handleButtonClick(e, toggleWatchlist)}
                  disabled={loading}
                >
                  {isInWatchlist ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
          <Badge className="absolute top-2 right-2" variant={movie.subscription_tier === 'Premium' ? 'default' : 'secondary'}>
            {movie.subscription_tier}
          </Badge>
        </div>
        
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-sm line-clamp-1">{movie.title}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {movie.rating}
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {movie.description}
          </p>
          
          <div className="flex flex-wrap gap-1 mb-2">
            {movie.genre.slice(0, 2).map((g) => (
              <Badge key={g} variant="outline" className="text-xs">
                {g}
              </Badge>
            ))}
          </div>
          
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{movie.release_year}</span>
            <span>{Math.floor(movie.duration_minutes / 60)}h {movie.duration_minutes % 60}m</span>
          </div>
          
          {user && (
            <div className="flex gap-1 mt-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={(e) => handleButtonClick(e, () => rateMovie(star))}
                  className="transition-colors"
                >
                  <Star
                    className={`h-4 w-4 ${
                      userRating && star <= userRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground hover:text-yellow-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <TrailerModal
        movie={movie}
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
      />
    </Link>
  );
};

export default MovieCard;