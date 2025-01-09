import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import { motion } from "framer-motion";

interface PricingCardProps {
  plan: {
    name: string;
    price: {
      monthly: number;
      yearly: number;
    };
    priceId: {
      monthly: string;
      yearly: string;
    };
    limits: {
      max_duration_minutes: number;
      max_videos_per_month: number;
      max_voiceover_minutes: number;
      max_ai_images: number;
      max_exports_per_month: number;
    };
    popular?: boolean;
  };
  isYearly: boolean;
  isLoading: boolean;
  onSubscribe: () => void;
  isCurrentPlan?: boolean;
}

export const PricingCard = ({ plan, isYearly, isLoading, onSubscribe, isCurrentPlan }: PricingCardProps) => {
  const usageLimits = [
    `${plan.limits.max_videos_per_month} AI videos per month`,
    `${plan.limits.max_duration_minutes} minutes of export`,
    `${plan.limits.max_voiceover_minutes} minutes of voiceover`,
    `${plan.limits.max_ai_images} AI Images`,
  ];

  return (
    <motion.div
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
        {usageLimits.map((limit) => (
          <li key={limit} className="flex items-center gap-2">
            <Check className="w-5 h-5 text-primary" />
            <span>{limit}</span>
          </li>
        ))}
      </ul>
      <Button 
        className="w-full" 
        variant={plan.popular ? "default" : "outline"}
        onClick={onSubscribe}
        disabled={isLoading || isCurrentPlan}
      >
        {isLoading ? "Loading..." : isCurrentPlan ? "Current Plan" : "Get Started"}
      </Button>
    </motion.div>
  );
};