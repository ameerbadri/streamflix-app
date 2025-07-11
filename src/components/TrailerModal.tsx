import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Play, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Movie {
  id: string;
  title: string;
  release_year: number;
  trailer_url?: string | null;
  subscription_tier: string;
}

interface TrailerModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

const TrailerModal: React.FC<TrailerModalProps> = ({ movie, isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState(false);

  // Sample trailer URLs for demo (in production, you'd use YouTube Data API)
  const sampleTrailers: Record<string, string> = {
    'F1': 'vqBmyAj0Xm9',
    'Muromachi Burai': '6U0i0HsSCvh',
    'KPop Demon Hunters': '43c1efKzA1k',
    'Dora and the Search for Sol Dorado': 'r3d6u2n7iPo',
    'The Old Guard 2': 'wqfu3bPLJae',
    'Ballerina': '2VUmvqsHb6c',
    'Heads of State': 'lVgE5oLzf7A',
    'Thunderbolts*': 'hqcexYHbiTB',
    'How to Train Your Dragon': '3lwlJL8aW6W',
    'Jurassic World Rebirth': 'q0fGCmjLu42',
    'Karate Kid: Legends': 'AEgggzRr1vZ'
  };

  // Extract video ID from YouTube URL
  const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Get trailer video ID
  const getTrailerVideoId = (movie: Movie): string | null => {
    // Check if movie has trailer URL in database
    if (movie.trailer_url) {
      return extractVideoId(movie.trailer_url);
    }
    
    // Check our sample trailers
    return sampleTrailers[movie.title] || null;
  };

  // Generate YouTube search URL for the movie trailer
  const getYouTubeSearchUrl = (title: string, year: number): string => {
    const searchQuery = `${title} ${year} official trailer`;
    const encodedQuery = encodeURIComponent(searchQuery);
    return `https://www.youtube.com/results?search_query=${encodedQuery}`;
  };

  useEffect(() => {
    if (movie && isOpen) {
      setLoading(true);
      setError(false);
      
      // Simulate loading time and get video ID
      setTimeout(() => {
        const id = getTrailerVideoId(movie);
        setVideoId(id);
        setError(!id);
        setLoading(false);
      }, 500);
    }
  }, [movie, isOpen]);

  const openYouTubeSearch = () => {
    if (movie) {
      const searchUrl = getYouTubeSearchUrl(movie.title, movie.release_year);
      window.open(searchUrl, '_blank');
      onClose();
    }
  };

  if (!movie) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 border-0 bg-transparent shadow-none overflow-hidden">
        <div className="relative w-full h-full bg-black/95 backdrop-blur-xl rounded-2xl overflow-hidden animate-scale-in">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full w-10 h-10"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-6 pb-20">
            <div className="flex items-center gap-3 max-w-4xl">
              <Play className="h-6 w-6 text-primary" />
              <h2 className="text-white text-xl font-bold">
                {movie.title} ({movie.release_year})
              </h2>
              <Badge variant={movie.subscription_tier === 'Premium' ? 'default' : 'secondary'}>
                {movie.subscription_tier}
              </Badge>
            </div>
          </div>

          {/* Video Content */}
          <div className="w-full h-full flex items-center justify-center p-8">
            {loading ? (
              <div className="flex flex-col items-center gap-4 text-white">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-lg">Loading trailer...</p>
              </div>
            ) : error || !videoId ? (
              <div className="flex flex-col items-center gap-6 text-white text-center max-w-md">
                <AlertCircle className="h-16 w-16 text-yellow-500" />
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Trailer Not Available</h3>
                  <p className="text-white/80">
                    We couldn't find a trailer for "{movie.title}". You can search for it on YouTube instead.
                  </p>
                </div>
                <Button 
                  onClick={openYouTubeSearch}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Search on YouTube
                </Button>
              </div>
            ) : (
              <div className="w-full h-full max-w-5xl max-h-[80vh] rounded-xl overflow-hidden shadow-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&fs=1&cc_load_policy=0&iv_load_policy=3&color=white`}
                  title={`${movie.title} Trailer`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{ border: 'none' }}
                />
              </div>
            )}
          </div>

          {/* Bottom Gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrailerModal;