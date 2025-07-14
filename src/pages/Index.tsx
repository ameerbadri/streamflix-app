import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, User, LogOut, Crown, Film, Download, Filter, SlidersHorizontal, ArrowUpDown, X, Clock, TrendingUp, Star, Calendar } from 'lucide-react';
import Fuse from 'fuse.js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  created_at?: string;
}

const Index = () => {
  const { user, signOut, subscribed, subscriptionTier, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState({ min: 1970, max: new Date().getFullYear() });
  const [ratingRange, setRatingRange] = useState({ min: 0, max: 10 });
  const [durationRange, setDurationRange] = useState({ min: 0, max: 300 });
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('release_year');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Enhanced search state
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [quickFilter, setQuickFilter] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const MOVIES_PER_PAGE = 15;
  
  // Extract all unique genres for filtering
  const allGenres = useMemo(() => Array.from(new Set(movies.flatMap(movie => movie.genre))), [movies]);

  const fetchMovies = async (page = 0, reset = false) => {
    if (reset) {
      setCurrentPage(0);
      setMovies([]);
      setHasMore(true);
    }
    
    try {
      const from = page * MOVIES_PER_PAGE;
      const to = from + MOVIES_PER_PAGE - 1;
      
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(from, to);
      
      if (error) throw error;
      
      const newMovies = data || [];
      
      if (reset || page === 0) {
        setMovies(newMovies);
      } else {
        // Prevent duplicates when appending new movies
        setMovies(prev => {
          const existingIds = new Set(prev.map(movie => movie.id));
          const uniqueNewMovies = newMovies.filter(movie => !existingIds.has(movie.id));
          return [...prev, ...uniqueNewMovies];
        });
      }
      
      // Check if we have more movies to load
      setHasMore(newMovies.length === MOVIES_PER_PAGE);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const loadMoreMovies = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    await fetchMovies(currentPage + 1);
    setLoadingMore(false);
  };

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch watchlist
      const { data: watchlistData } = await supabase
        .from('watchlist')
        .select('movie_id')
        .eq('user_id', user.id);

      if (watchlistData) {
        setWatchlist(new Set(watchlistData.map(item => item.movie_id)));
      }

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
      console.error('Error fetching user data:', error);
    }
  };


  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchMovies(0, true);
      if (user) {
        await fetchUserData();
        await checkSubscription();
      }
      setLoading(false);
    };

    loadData();
  }, [user]);

  // Handle sort/filter changes
  useEffect(() => {
    if (!loading) {
      fetchMovies(0, true);
    }
  }, [sortBy, sortOrder]);

  // Infinite scroll functionality
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000 // Load more when 1000px from bottom
      ) {
        loadMoreMovies();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, currentPage]);

  const handleSearch = () => {
    setSearchTerm(searchInput);
  };

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(movies, {
      keys: ['title', 'description', 'genre'],
      threshold: 0.3, // Lower = more strict, Higher = more fuzzy
      includeScore: true,
    });
  }, [movies]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Generate search suggestions
  useEffect(() => {
    if (searchInput.length > 1) {
      const suggestions = movies
        .filter(movie => 
          movie.title.toLowerCase().includes(searchInput.toLowerCase()) ||
          movie.genre.some(g => g.toLowerCase().includes(searchInput.toLowerCase()))
        )
        .slice(0, 5)
        .map(movie => movie.title);
      
      // Add genre suggestions
      const genreSuggestions = allGenres
        .filter(genre => genre.toLowerCase().includes(searchInput.toLowerCase()))
        .slice(0, 3);
      
      setSearchSuggestions([...new Set([...suggestions, ...genreSuggestions])]);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchInput, movies, allGenres]);

  // Enhanced search function with fuzzy search and recent searches
  const handleEnhancedSearch = (term: string = searchInput) => {
    if (term.trim()) {
      setSearchTerm(term);
      
      // Add to recent searches
      const newRecentSearches = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
    }
    setShowSuggestions(false);
  };

  // Quick filter handlers
  const handleQuickFilter = (filter: string) => {
    setQuickFilter(filter);
    const currentYear = new Date().getFullYear();
    
    switch (filter) {
      case 'new-releases':
        setYearRange({ min: currentYear - 1, max: currentYear });
        setSortBy('created_at');
        setSortOrder('desc');
        break;
      case 'top-rated':
        setRatingRange({ min: 8, max: 10 });
        setSortBy('rating');
        setSortOrder('desc');
        break;
      case 'trending':
        setSortBy('rating');
        setSortOrder('desc');
        setYearRange({ min: currentYear - 3, max: currentYear });
        break;
      case 'classics':
        setYearRange({ min: 1970, max: 2000 });
        setRatingRange({ min: 7, max: 10 });
        setSortBy('rating');
        setSortOrder('desc');
        break;
      default:
        break;
    }
  };

  // Clear quick filter
  const clearQuickFilter = () => {
    setQuickFilter('');
    setYearRange({ min: 1970, max: new Date().getFullYear() });
    setRatingRange({ min: 0, max: 10 });
    setSortBy('release_year');
    setSortOrder('desc');
  };

  // Remove individual filter tags
  const removeFilterTag = (type: string, value?: string) => {
    switch (type) {
      case 'search':
        setSearchTerm('');
        setSearchInput('');
        break;
      case 'genre':
        if (value) {
          setSelectedGenres(prev => prev.filter(g => g !== value));
        }
        break;
      case 'subscription':
        setSubscriptionFilter('all');
        break;
      case 'year':
        setYearRange({ min: 1970, max: new Date().getFullYear() });
        break;
      case 'rating':
        setRatingRange({ min: 0, max: 10 });
        break;
      case 'quick':
        clearQuickFilter();
        break;
    }
  };

  // Enhanced filtering with fuzzy search
  const filteredAndSortedMovies = useMemo(() => {
    let filtered = movies;
    
    // Apply fuzzy search if search term exists
    if (searchTerm.trim()) {
      const fuseResults = fuse.search(searchTerm);
      filtered = fuseResults.map(result => result.item);
    }
    
    // Apply other filters
    filtered = filtered.filter(movie => {
      const matchesGenre = selectedGenres.length === 0 || selectedGenres.some(genre => movie.genre.includes(genre));
      const matchesYear = movie.release_year >= yearRange.min && movie.release_year <= yearRange.max;
      const matchesRating = movie.rating >= ratingRange.min && movie.rating <= ratingRange.max;
      const matchesDuration = movie.duration_minutes >= durationRange.min && movie.duration_minutes <= durationRange.max;
      const matchesSubscription = subscriptionFilter === 'all' || movie.subscription_tier === subscriptionFilter;
      
      return matchesGenre && matchesYear && matchesRating && matchesDuration && matchesSubscription;
    });

    // Apply sorting
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'release_year':
          comparison = a.release_year - b.release_year;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'duration_minutes':
          comparison = a.duration_minutes - b.duration_minutes;
          break;
        case 'created_at':
        default:
          comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [movies, searchTerm, selectedGenres, yearRange, ratingRange, durationRange, subscriptionFilter, sortBy, sortOrder, fuse]);

  // Active filters for display
  const activeFilters = useMemo(() => {
    const filters = [];
    
    if (searchTerm) {
      filters.push({ type: 'search', label: `Search: "${searchTerm}"`, value: searchTerm });
    }
    
    selectedGenres.forEach(genre => {
      filters.push({ type: 'genre', label: genre, value: genre });
    });
    
    if (subscriptionFilter !== 'all') {
      filters.push({ type: 'subscription', label: `${subscriptionFilter} Tier`, value: subscriptionFilter });
    }
    
    if (yearRange.min !== 1970 || yearRange.max !== new Date().getFullYear()) {
      filters.push({ type: 'year', label: `${yearRange.min}-${yearRange.max}`, value: 'year' });
    }
    
    if (ratingRange.min !== 0 || ratingRange.max !== 10) {
      filters.push({ type: 'rating', label: `Rating: ${ratingRange.min}-${ratingRange.max}`, value: 'rating' });
    }
    
    if (quickFilter) {
      const quickLabels = {
        'new-releases': 'New Releases',
        'top-rated': 'Top Rated',
        'trending': 'Trending',
        'classics': 'Classics'
      };
      filters.push({ type: 'quick', label: quickLabels[quickFilter as keyof typeof quickLabels], value: quickFilter });
    }
    
    return filters;
  }, [searchTerm, selectedGenres, subscriptionFilter, yearRange, ratingRange, quickFilter]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Film className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your movies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                StreamFlix
              </h1>
              {subscribed && (
                <Badge variant={subscriptionTier === 'Premium' ? 'default' : 'secondary'} className="flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  {subscriptionTier}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-2">
                  <Link to="/watchlist">
                    <Button variant="ghost" size="sm">My Watchlist</Button>
                  </Link>
                  <Link to="/account">
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4 mr-1" />
                      Account
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-1" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link to="/auth">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link to="/pricing">
                    <Button>Subscribe</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">
            Unlimited movies, TV shows and more
          </h2>
          <p className="text-xl text-muted-foreground mb-6">
            Watch anywhere. Cancel anytime.
          </p>
          
          {!subscribed && (
            <Link to="/pricing">
              <Button size="lg" className="mb-8">
                Start Your Free Trial
              </Button>
            </Link>
          )}
        </div>

        {/* Enhanced Search and Filter */}
        <div className="space-y-4 mb-8">
          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={quickFilter === 'new-releases' ? 'default' : 'outline'}
              size="sm"
              onClick={() => quickFilter === 'new-releases' ? clearQuickFilter() : handleQuickFilter('new-releases')}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              New Releases
            </Button>
            <Button
              variant={quickFilter === 'top-rated' ? 'default' : 'outline'}
              size="sm"
              onClick={() => quickFilter === 'top-rated' ? clearQuickFilter() : handleQuickFilter('top-rated')}
              className="flex items-center gap-2"
            >
              <Star className="h-4 w-4" />
              Top Rated
            </Button>
            <Button
              variant={quickFilter === 'trending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => quickFilter === 'trending' ? clearQuickFilter() : handleQuickFilter('trending')}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Trending
            </Button>
            <Button
              variant={quickFilter === 'classics' ? 'default' : 'outline'}
              size="sm"
              onClick={() => quickFilter === 'classics' ? clearQuickFilter() : handleQuickFilter('classics')}
              className="flex items-center gap-2"
            >
              <Film className="h-4 w-4" />
              Classics
            </Button>
          </div>

          {/* Primary Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search movies..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleEnhancedSearch()}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="pl-10"
                />
                
                {/* Search Suggestions and Recent Searches */}
                {showSuggestions && (searchSuggestions.length > 0 || recentSearches.length > 0) && (
                  <Card className="absolute top-full mt-1 w-full z-50 max-h-60 overflow-y-auto">
                    <CardContent className="p-2">
                      {/* Recent Searches */}
                      {recentSearches.length > 0 && (
                        <div className="mb-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Clock className="h-3 w-3" />
                            Recent searches
                          </div>
                          {recentSearches.map((search, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-left h-8 px-2"
                              onClick={() => {
                                setSearchInput(search);
                                handleEnhancedSearch(search);
                              }}
                            >
                              {search}
                            </Button>
                          ))}
                        </div>
                      )}
                      
                      {/* Suggestions */}
                      {searchSuggestions.length > 0 && (
                        <div>
                          {recentSearches.length > 0 && <div className="border-t my-2" />}
                          <div className="text-xs text-muted-foreground mb-1">Suggestions</div>
                          {searchSuggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-left h-8 px-2"
                              onClick={() => {
                                setSearchInput(suggestion);
                                handleEnhancedSearch(suggestion);
                              }}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
              <Button onClick={() => handleEnhancedSearch()} size="sm" className="px-4">
                Search
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Newest</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="release_year">Year</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="duration_minutes">Duration</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {showAdvancedFilters && <Filter className="h-3 w-3" />}
              </Button>
            </div>
          </div>
          
          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <Card className="p-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Multi-Genre Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Genres</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        {selectedGenres.length === 0 
                          ? "Select genres..." 
                          : `${selectedGenres.length} genre${selectedGenres.length > 1 ? 's' : ''} selected`
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                        {allGenres.map(genre => (
                          <div key={genre} className="flex items-center space-x-2">
                            <Checkbox
                              id={genre}
                              checked={selectedGenres.includes(genre)}
                              onCheckedChange={() => handleGenreToggle(genre)}
                            />
                            <label htmlFor={genre} className="text-sm cursor-pointer">
                              {genre}
                            </label>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-4 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedGenres([])}
                        >
                          Clear All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedGenres([...allGenres])}
                        >
                          Select All
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                
                {/* Subscription Tier */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subscription</label>
                  <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Tiers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Year Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Release Year</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="From"
                      value={yearRange.min}
                      onChange={(e) => setYearRange({...yearRange, min: parseInt(e.target.value) || 1970})}
                      min="1970"
                      max={new Date().getFullYear()}
                      className="text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="To"
                      value={yearRange.max}
                      onChange={(e) => setYearRange({...yearRange, max: parseInt(e.target.value) || new Date().getFullYear()})}
                      min="1970"
                      max={new Date().getFullYear()}
                      className="text-sm"
                    />
                  </div>
                </div>
                
                {/* Rating Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rating</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={ratingRange.min}
                      onChange={(e) => setRatingRange({...ratingRange, min: parseFloat(e.target.value) || 0})}
                      min="0"
                      max="10"
                      step="0.1"
                      className="text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={ratingRange.max}
                      onChange={(e) => setRatingRange({...ratingRange, max: parseFloat(e.target.value) || 10})}
                      min="0"
                      max="10"
                      step="0.1"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {/* Reset Filters */}
              <div className="flex justify-end mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedGenres([]);
                    setSubscriptionFilter('all');
                    setYearRange({ min: 1970, max: new Date().getFullYear() });
                    setRatingRange({ min: 0, max: 10 });
                    setDurationRange({ min: 0, max: 300 });
                    setSearchTerm('');
                    setSearchInput('');
                    setSortBy('release_year');
                    setSortOrder('desc');
                  }}
                >
                  Reset All Filters
                </Button>
              </div>
            </Card>
          )}
          
          {/* Active Filter Tags */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg">
              <span className="text-sm font-medium text-muted-foreground mr-2">Active filters:</span>
              {activeFilters.map((filter, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="flex items-center gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={() => removeFilterTag(filter.type, filter.value)}
                >
                  {filter.label}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedGenres([]);
                  setSubscriptionFilter('all');
                  setYearRange({ min: 1970, max: new Date().getFullYear() });
                  setRatingRange({ min: 0, max: 10 });
                  setDurationRange({ min: 0, max: 300 });
                  setSearchTerm('');
                  setSearchInput('');
                  setSortBy('release_year');
                  setSortOrder('desc');
                  clearQuickFilter();
                }}
                className="h-6 px-2 text-xs"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Movies Grid */}
        {filteredAndSortedMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredAndSortedMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isInWatchlist={watchlist.has(movie.id)}
                userRating={userRatings[movie.id]}
                onWatchlistUpdate={fetchUserData}
                onRatingUpdate={fetchUserData}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Film className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No movies found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or genre filter
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Loading More Indicator */}
        {loadingMore && (
          <div className="flex justify-center items-center py-8">
            <Film className="h-6 w-6 animate-spin mr-2 text-primary" />
            <span className="text-muted-foreground">Loading more movies...</span>
          </div>
        )}
        
        {/* End of Results Indicator */}
        {!hasMore && movies.length > 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">You've reached the end of the catalog!</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;
