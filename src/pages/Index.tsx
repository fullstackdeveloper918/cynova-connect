import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Quote, Sparkles, Code, Laptop, Video, Zap, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Plans } from "@/components/pricing/Plans";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Content Creator",
    quote: "This platform has revolutionized how I create videos. The AI features are incredible!",
    rating: 5,
    avatar: "/lovable-uploads/ccea9cb0-6878-4c15-9768-dffd9b382752.png"
  },
  {
    name: "Michael Chen",
    role: "YouTuber",
    quote: "The automated video generation saves me hours of work. Absolutely worth it!",
    rating: 5,
    avatar: "/lovable-uploads/09b3cb08-a80b-4ad0-b134-43e5a39ced9d.png"
  },
  {
    name: "Emma Davis",
    role: "Marketing Manager",
    quote: "Perfect for creating engaging social media content quickly and efficiently.",
    rating: 5,
    avatar: "/lovable-uploads/491d056f-055f-47bb-b4b4-e8e29b51a8bb.png"
  },
];

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        navigate('/dashboard/projects');
      }
    });

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session) {
          navigate('/dashboard/projects');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    checkSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="relative max-w-[1920px] mx-auto">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-zinc-900">
                Create Engaging Videos with AI
              </h1>
              <p className="text-xl text-zinc-600">
                Transform your content into captivating videos using our AI-powered platform. No experience needed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
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
                  className="px-8 py-6 text-lg border-primary/20 text-primary hover:bg-primary/5"
                >
                  View Pricing
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="aspect-video bg-accent rounded-lg overflow-hidden shadow-xl">
                <img 
                  src="/lovable-uploads/491d056f-055f-47bb-b4b4-e8e29b51a8bb.png" 
                  alt="Platform Preview" 
                  className="w-full h-full object-contain"
                />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute -bottom-5 right-5 transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                <div className="bg-white shadow-lg rounded-full px-4 py-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-sm text-primary">AI-Powered Video Creation</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <Features />

      {/* Split Section 1 */}
      <section className="py-20 bg-accent/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="aspect-video bg-white rounded-lg shadow-lg overflow-hidden">
                <Video className="w-full h-full p-12 text-primary" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6 order-1 lg:order-2"
            >
              <h2 className="text-3xl font-bold text-zinc-900">
                AI-Powered Video Creation
              </h2>
              <p className="text-lg text-zinc-600">
                Transform your content into engaging videos with our advanced AI technology. Create professional-quality content in minutes, not hours.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Split Section 2 */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-zinc-900">
                Professional Results
              </h2>
              <p className="text-lg text-zinc-600">
                Get professional-quality videos without the need for expensive equipment or editing skills. Perfect for content creators, marketers, and businesses.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="aspect-video bg-white rounded-lg shadow-lg overflow-hidden">
                <Laptop className="w-full h-full p-12 text-primary" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* New AI Enhancement Section */}
      <section className="py-20 bg-accent/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-zinc-900">
                AI-Enhanced Video Creation
              </h2>
              <p className="text-lg text-zinc-600">
                Leverage cutting-edge AI technology to enhance your videos with professional effects, transitions, and automated improvements. Create stunning content that stands out.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="aspect-video bg-white rounded-lg shadow-lg overflow-hidden">
                <Wand2 className="w-full h-full p-12 text-primary" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <Plans />

      {/* Testimonials Section */}
      <section className="py-20 bg-accent/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-primary font-medium mb-4 block"
            >
              Testimonials
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900"
            >
              What Our Users Say
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl shadow-sm border border-primary/10 relative"
              >
                <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-zinc-900">{testimonial.name}</p>
                    <p className="text-sm text-primary">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-zinc-600">{testimonial.quote}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4 text-white"
          >
            Ready to get started?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl text-white/90 mb-8"
          >
            Join thousands of satisfied users today
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate("/signup")}
              className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg"
            >
              Get Started Now
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
