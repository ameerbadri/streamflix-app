import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';

const SubscriptionSuccess = () => {
  const { user, checkSubscription } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Check subscription status after successful payment
    const timer = setTimeout(() => {
      checkSubscription();
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, navigate, checkSubscription]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Subscription Activated!
          </CardTitle>
          <CardDescription>
            Welcome to StreamFlix! Your subscription is now active and you can start streaming immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              You now have access to our complete movie library. Start exploring and add movies to your watchlist!
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <Link to="/" className="w-full">
              <Button className="w-full">
                Start Watching
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/account" className="w-full">
              <Button variant="outline" className="w-full">
                View Account Details
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSuccess;