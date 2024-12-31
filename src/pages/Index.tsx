import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Newsletter } from "@/components/Newsletter";
import { useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { scrollYProgress } = useScroll();
  const navigate = useNavigate();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="relative">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50"
        style={{ scaleX }}
      />
      <div className="bg-gradient-to-b from-accent to-background">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">
              Create Engaging Videos with AI
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Transform your content into captivating videos using our AI-powered platform.
              Perfect for creators, marketers, and storytellers.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/signup")}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
      <Hero />
      <Features />
      <HowItWorks />
      <Newsletter />
    </div>
  );
};

export default Index;