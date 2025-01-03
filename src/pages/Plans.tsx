import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Star, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const plans = [
  {
    name: "Starter",
    price: {
      monthly: 19,
      yearly: 159,
    },
    priceId: {
      monthly: "YOUR_STARTER_MONTHLY_PRICE_ID",
      yearly: "YOUR_STARTER_YEARLY_PRICE_ID",
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
      monthly: 29,
      yearly: 243,
    },
    priceId: {
      monthly: "YOUR_PRO_MONTHLY_PRICE_ID",
      yearly: "YOUR_PRO_YEARLY_PRICE_ID",
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
      monthly: 49,
      yearly: 411,
    },
    priceId: {
      monthly: "YOUR_PREMIUM_MONTHLY_PRICE_ID",
      yearly: "YOUR_PREMIUM_YEARLY_PRICE_ID",
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

  const handleSubscribe = async (plan: typeof plans[0]) => {
    try {
      setIsLoading(plan.name);
      const priceId = isYearly ? plan.priceId.yearly : plan.priceId.monthly;
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId, mode: 'subscription' }
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
              Yearly (30% off)
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative rounded-xl border ${
                plan.popular
                  ? "border-primary shadow-lg"
                  : "border-accent"
              } bg-card p-6`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  Most Popular
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-2">
                  ${isYearly ? Math.round(plan.price.yearly / 12) : plan.price.monthly}
                  <span className="text-lg text-muted-foreground">
                    /month
                  </span>
                </div>
                {isYearly && (
                  <div className="text-sm text-muted-foreground">
                    ${plan.price.yearly} billed yearly
                  </div>
                )}
              </div>
              <ul className="space-y-4 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full" 
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleSubscribe(plan)}
                disabled={isLoading === plan.name}
              >
                {isLoading === plan.name ? "Loading..." : "Get Started"}
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default Plans;