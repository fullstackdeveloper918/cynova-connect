import { PricingCard } from "./PricingCard";
import { useState } from "react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Starter",
    price: {
      monthly: 24,
      yearly: 230,
    },
    priceId: {
      monthly: "price_1QeDzGG8TTdTbu7dz9ApCJQM",
      yearly: "price_1QeDzuG8TTdTbu7dosC1Ry4k",
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
      yearly: "price_1QeDzuG8TTdTbu7dosC1Ry4k",
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
      yearly: "price_1QeDzuG8TTdTbu7dosC1Ry4k",
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

export const Plans = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    // Subscription logic will be handled by the PricingCard component
    setIsLoading(false);
  };

  return (
    <section className="py-20 bg-zinc-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900"
          >
            Choose Your Plan
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg text-zinc-600 max-w-2xl mx-auto"
          >
            Select the perfect plan for your content creation needs
          </motion.p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={`px-4 py-2 rounded-lg ${
              !isYearly
                ? "bg-primary text-white"
                : "bg-white text-zinc-900 border border-zinc-200"
            }`}
            onClick={() => setIsYearly(false)}
          >
            Monthly
          </motion.button>
          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={`px-4 py-2 rounded-lg ${
              isYearly
                ? "bg-primary text-white"
                : "bg-white text-zinc-900 border border-zinc-200"
            }`}
            onClick={() => setIsYearly(true)}
          >
            Yearly (20% off)
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              isYearly={isYearly}
              isLoading={isLoading}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>
      </div>
    </section>
  );
};