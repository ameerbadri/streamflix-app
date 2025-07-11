import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Crown, User, Calendar, CreditCard, Film, Star, Download, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Account = () => {
  const { user, subscribed, subscriptionTier, subscriptionEnd, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [populatingMovies, setPopulatingMovies] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [stats, setStats] = useState({
    watchlistCount: 0,
    ratingsCount: 0,
    viewingHistoryCount: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchUserStats();
    checkSubscription();
    checkAdminStatus();
  }, [user, navigate]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      const [watchlistRes, ratingsRes, historyRes] = await Promise.all([
        supabase.from('watchlist').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('user_ratings').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('viewing_history').select('id', { count: 'exact' }).eq('user_id', user.id)
      ]);

      setStats({
        watchlistCount: watchlistRes.count || 0,
        ratingsCount: ratingsRes.count || 0,
        viewingHistoryCount: historyRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to open customer portal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const populateMovies = async () => {
    if (populatingMovies) return;
    
    setPopulatingMovies(true);
    try {
      const { data, error } = await supabase.functions.invoke('populate-movies');
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: `${data.message}`,
      });
    } catch (error) {
      console.error('Error populating movies:', error);
      toast({
        title: "Error",
        description: "Failed to populate movies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPopulatingMovies(false);
    }
  };

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('check-admin-status');
      
      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdminUser(false);
        return;
      }
      
      setIsAdminUser(data?.isAdmin || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdminUser(false);
    }
  };

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
          <h1 className="text-3xl font-bold">My Account</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Admin Controls - Only show for approved emails */}
          {isAdminUser && (
            <Card className="lg:col-span-3 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Database className="h-5 w-5" />
                  Admin Controls
                </CardTitle>
                <CardDescription>
                  Manage movie database content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={populateMovies}
                  disabled={populatingMovies}
                  className="w-full sm:w-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {populatingMovies ? 'Populating Database...' : 'Populate Top 1000 Movies Since 1970'}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  This will clear all existing movie data and populate with fresh content from TMDB.
                </p>
              </CardContent>
            </Card>
          )}
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member since</p>
                <p className="font-medium">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscribed ? (
                <>
                  <div className="flex items-center gap-2">
                    <Badge variant={subscriptionTier === 'Premium' ? 'default' : 'secondary'} className="flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      {subscriptionTier}
                    </Badge>
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                  
                  {subscriptionEnd && (
                    <div>
                      <p className="text-sm text-muted-foreground">Next billing date</p>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(subscriptionEnd).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleManageSubscription}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Loading..." : "Manage Subscription"}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground">No active subscription</p>
                  <Link to="/pricing" className="block">
                    <Button className="w-full">Choose a Plan</Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>

          {/* Activity Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Your Activity</CardTitle>
              <CardDescription>Your streaming statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Watchlist</span>
                </div>
                <span className="font-semibold">{stats.watchlistCount}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Movies Rated</span>
                </div>
                <span className="font-semibold">{stats.ratingsCount}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Movies Watched</span>
                </div>
                <span className="font-semibold">{stats.viewingHistoryCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Account;