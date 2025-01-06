import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PricingCard } from "@/components/pricing/PricingCard";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { useSubscription } from "@/hooks/useSubscription";

const plans = [
  {
    name: "Starter",
    price: {
      monthly: 24,
      yearly: 230,
    },
    priceId: {
      monthly: "price_1OgbZeG8TTdTbu7dxMxqxgK3",
      yearly: "price_1OgbZeG8TTdTbu7dKpFGWqL9",
    },
    features: [
      "50 AI videos per month",
      "40 minutes of exporting",
      "30 minutes of voiceover",
      "100 AI Images",
    ],
  },
  {
    name: "Pro",
    price: {
      monthly: 39,
      yearly: 374,
    },
    priceId: {
      monthly: "price_1OgbZeG8TTdTbu7dxMxqxgK3",
      yearly: "price_1OgbZeG8TTdTbu7dKpFGWqL9",
    },
    popular: true,
    features: [
      "100 AI videos per month",
      "2 hours of export",
      "150 voiceover minutes",
      "300 AI Images",
    ],
  },
  {
    name: "Premium",
    price: {
      monthly: 79,
      yearly: 758,
    },
    priceId: {
      monthly: "price_1OgbZeG8TTdTbu7dxMxqxgK3",
      yearly: "price_1OgbZeG8TTdTbu7dKpFGWqL9",
    },
    features: [
      "200 AI videos per month",
      "3 hours of export",
      "200 voiceover minutes",
      "500 AI Images",
    ],
  },
];

const faqs = [
  {
    question: "Can I cancel my subscription?",
    answer: "Yes, you can cancel anytime through your settings. Your plan will remain active until the current billing cycle ends.",
  },
  {
    question: "How can I check my remaining credits?",
    answer: "You can view your remaining credits by going to settings and clicking your profile picture in the top-right corner.",
  },
  {
    question: "Is it possible to change my plan after subscribing?",
    answer: "Absolutely. You can upgrade or downgrade your plan at any time in your account settings.",
  },
  {
    question: "Do you offer refunds?",
    answer: "We don't provide refunds. However, you can cancel your subscription anytime, and it will stay active until the end of your billing period.",
  },
  {
    question: "What are export minutes?",
    answer: "Export minutes represent the total duration of videos you can create. For instance, 60 export minutes allow you to create 60 one-minute videos.",
  },
  {
    question: "Can I monetize videos created with Cynova?",
    answer: "Yes, all videos are fully owned by you, and we use custom-recorded gameplay to ensure originality.",
  },
  {
    question: "Can I create videos in different languages?",
    answer: "Yes, Cynova supports all languages. Just input your text in the desired language, and you're good to go!",
  },
];

const Plans = () => {
  const [isYearly, setIsYearly] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { data: subscription } = useSubscription();

  const handleSubscribe = async (plan: typeof plans[0]) => {
    try {
      // Check if user is already subscribed to this plan
      if (subscription?.plan_name === plan.name && subscription?.status === 'active') {
        toast.error("You are already subscribed to this plan");
        return;
      }

      setIsLoading(plan.name);
      const priceId = isYearly ? plan.priceId.yearly : plan.priceId.monthly;
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceId, 
          mode: 'subscription',
          currentPlan: subscription?.plan_name
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to start checkout process. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Choose Your Plan</h1>
          {subscription?.status === 'active' && (
            <p className="text-lg text-muted-foreground mb-4">
              Current plan: {subscription.plan_name}
            </p>
          )}
          <p className="text-lg text-muted-foreground mb-8">
            Select the perfect plan for your content creation needs
          </p>
          <div className="flex items-center justify-center gap-4 mb-8">
            <Button
              variant={isYearly ? "outline" : "default"}
              onClick={() => setIsYearly(false)}
            >
              Monthly
            </Button>
            <Button
              variant={isYearly ? "default" : "outline"}
              onClick={() => setIsYearly(true)}
            >
              Yearly (20% off)
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              isYearly={isYearly}
              isLoading={isLoading === plan.name}
              onSubscribe={() => handleSubscribe(plan)}
              isCurrentPlan={subscription?.plan_name === plan.name && subscription?.status === 'active'}
            />
          ))}
        </div>

        <PricingFAQ faqs={faqs} />
      </div>
    </div>
  );
};

export default Plans;