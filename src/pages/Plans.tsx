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
      monthly: "price_1QeDzGG8TTdTbu7dz9ApCJQM",
      yearly: "price_1OgbZeG8TTdTbu7dKpFGWqL9",
    },
    limits: {
      max_duration_minutes: 40,
      max_videos_per_month: 50,
      max_voiceover_minutes: 30,
      max_ai_images: 100,
      max_exports_per_month: 30,
    }
  },
  {
    name: "Pro",
    price: {
      monthly: 39,
      yearly: 374,
    },
    priceId: {
      monthly: "price_1QeDzcG8TTdTbu7d6fJJNFFQ",
      yearly: "price_1OgbZeG8TTdTbu7dKpFGWqL9",
    },
    popular: true,
    limits: {
      max_duration_minutes: 120,
      max_videos_per_month: 150,
      max_voiceover_minutes: 120,
      max_ai_images: 300,
      max_exports_per_month: 50,
    }
  },
  {
    name: "Premium",
    price: {
      monthly: 79,
      yearly: 758,
    },
    priceId: {
      monthly: "price_1QeDzuG8TTdTbu7dosC1Ry4k",
      yearly: "price_1OgbZeG8TTdTbu7dKpFGWqL9",
    },
    limits: {
      max_duration_minutes: 180,
      max_videos_per_month: 250,
      max_voiceover_minutes: 180,
      max_ai_images: 500,
      max_exports_per_month: 80,
    }
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
      setIsLoading(plan.name);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please log in to subscribe");
        navigate("/login");
        return;
      }

      if (subscription?.plan_name === plan.name && subscription?.status === 'active') {
        toast.error("You are already subscribed to this plan");
        return;
      }

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
      } else {
        throw new Error('No checkout URL returned');
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
            className="flex items-center gap-2 hover:bg-accent md:inline-flex"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Select the perfect plan for your content creation needs
          </p>
          <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
            <Button
              variant={isYearly ? "outline" : "default"}
              onClick={() => setIsYearly(false)}
              className="w-full sm:w-auto"
            >
              Monthly
            </Button>
            <Button
              variant={isYearly ? "default" : "outline"}
              onClick={() => setIsYearly(true)}
              className="w-full sm:w-auto"
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
