import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, FileVideo, Scissors, Mic, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const plans = [
  {
    name: "Starter",
    price: 19,
    features: [
      "50 AI videos per month",
      "40 minutes of exporting",
      "30 minutes of voiceover",
      "100 AI Images",
    ],
  },
  {
    name: "Pro",
    price: 29,
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
    price: 49,
    features: [
      "200 AI videos per month",
      "3 hours of export",
      "200 voiceover minutes",
      "500 AI Images",
    ],
  },
];

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        navigate('/dashboard/projects');
      } else if (event === 'SIGNED_OUT') {
        navigate('/');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      } else if (event === 'USER_UPDATED') {
        console.log('User updated');
      }
    });

    // Check initial session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error checking session:', error);
          toast.error('Session error. Please try logging in again.');
          navigate('/login');
          return;
        }
        if (session) {
          navigate('/dashboard/projects');
        }
      } catch (error) {
        console.error('Unexpected error checking session:', error);
        toast.error('An unexpected error occurred. Please try again.');
      }
    };

    checkSession();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="relative max-w-[1920px] mx-auto">
      <Navigation />
      <Hero />
      <Features />
      <HowItWorks />
      
      {/* Plans Section */}
      <section id="pricing-section" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-primary font-medium mb-3 block">Pricing</span>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Choose Your Plan</h2>
            <p className="text-base text-muted-foreground">
              Select the perfect plan for your content creation needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative rounded-xl border ${
                  plan.popular ? "border-primary shadow-lg" : "border-accent"
                } bg-card p-6`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold mb-2">
                    ${plan.price}
                    <span className="text-base text-muted-foreground">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => navigate("/signup")}
                >
                  Get Started
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-b from-background to-accent">
        <div className="container mx-auto px-4 text-center max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Ready to Create Amazing Videos?
            </h2>
            <p className="text-base text-muted-foreground mb-6">
              Join thousands of creators who are already using Cynova to create engaging content.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/signup")}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white px-6"
            >
              Get Started Now
              <Sparkles className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;