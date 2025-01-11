import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-accent/30 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Link to="/">
            <img
              src="/logo.svg"
              alt="Cynova"
              className="w-28 mx-auto mb-8"
            />
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-black">
            Create Engaging Videos with AI
          </h1>
          <p className="text-xl md:text-2xl text-black/80 mb-8">
            Transform your content into captivating videos using our AI-powered platform. No experience needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/signup")}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg"
            >
              Get Started Free
              <ArrowRight className="ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/plans")}
              className="px-8 py-6 text-lg text-primary hover:text-primary/90"
            >
              View Pricing
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};