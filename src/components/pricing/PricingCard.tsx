import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
    features: string[];
    popular?: boolean;
  };
  isYearly: boolean;
  isLoading: boolean;
  onSubscribe: () => void;
  isCurrentPlan?: boolean;
}

export const PricingCard = ({ plan, isYearly, isLoading, onSubscribe, isCurrentPlan }: PricingCardProps) => {
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
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <Check className="w-5 h-5 text-primary" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button 
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
        onClick={onSubscribe}
        disabled={isLoading || isCurrentPlan}
      >
        {isLoading ? "Loading..." : isCurrentPlan ? "Current Plan" : "Get Started"}
      </Button>
    </motion.div>
  );
};