import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Link to="/">
            <img
              src="/logo.svg"
              alt="Cynova"
              className="w-28 mx-auto mb-8"
            />
          </Link>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6 text-zinc-900"
          >
            Create Engaging Videos with AI
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-zinc-600 mb-8"
          >
            Transform your content into captivating videos using our AI-powered platform. No experience needed.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              size="lg" 
              onClick={() => navigate("/signup")}
              className="bg-zinc-900 hover:bg-zinc-800 text-white px-8 py-6 text-lg rounded-lg"
            >
              Get Started Free
              <ArrowRight className="ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/plans")}
              className="px-8 py-6 text-lg text-zinc-900 border-zinc-200 hover:bg-zinc-50 rounded-lg"
            >
              View Pricing
            </Button>
          </motion.div>
        </div>

        {/* Floating AI Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <div className="bg-white shadow-lg rounded-full px-4 py-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-zinc-900" />
            <span className="text-sm text-zinc-900">AI-Powered Video Creation</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};