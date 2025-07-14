import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Pricing = () => {
  const { user, subscribed, subscriptionTier } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      name: 'Basic',
      price: '£10',
      description: 'Perfect for casual viewers',
      features: [
        'Access to Basic movie library',
        'HD streaming quality',
        'Watch on 1 device',
        'Standard support'
      ]
    },
    {
      name: 'Premium',
      price: '£15',
      description: 'Best for movie enthusiasts',
      features: [
        'Access to ALL movies including Premium content',
        '4K Ultra HD streaming',
        'Watch on up to 4 devices',
        'Priority support',
        'Early access to new releases'
      ],
      popular: true
    }
  ];

  const handleSubscribe = async (tier: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(tier);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier }
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const isCurrentPlan = (planName: string) => {
    return subscribed && subscriptionTier === planName;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock unlimited streaming with our flexible subscription plans
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="text-3xl font-bold text-primary">
                  {plan.price}<span className="text-sm text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full mt-6" 
                  onClick={() => handleSubscribe(plan.name)}
                  disabled={loading === plan.name || isCurrentPlan(plan.name)}
                  variant={isCurrentPlan(plan.name) ? "secondary" : "default"}
                >
                  {loading === plan.name ? "Processing..." : 
                   isCurrentPlan(plan.name) ? "Current Plan" : `Subscribe to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Cancel anytime. No hidden fees.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;