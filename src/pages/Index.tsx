import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, FileVideo, Scissors, Mic, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Navigation } from "@/components/Navigation";

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

  return (
    <div className="relative">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-accent to-background min-h-screen pt-20">
        <div className="container mx-auto px-4 pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Create AI Videos in Minutes
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform your content into captivating videos using our AI-powered platform.
              Perfect for creators, marketers, and storytellers.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/signup")}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white px-8"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/login")}
                className="px-8"
              >
                Sign In
              </Button>
            </div>
          </motion.div>

          {/* Feature Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20"
          >
            {[
              {
                icon: MessageSquare,
                title: "ChatGPT Videos",
                description: "Create engaging videos with AI-generated content",
              },
              {
                icon: FileVideo,
                title: "Reddit Videos",
                description: "Transform Reddit content into video stories",
              },
              {
                icon: Scissors,
                title: "Split Videos",
                description: "Split and trim your videos with precision",
              },
              {
                icon: Mic,
                title: "Voiceover Videos",
                description: "Add professional AI voiceovers to your content",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                className="bg-card border border-accent rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="rounded-lg bg-primary/10 p-3 w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <Features />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Plans Section */}
      <section id="pricing-section" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary font-medium mb-4 block">Pricing</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-muted-foreground text-lg">
              Select the perfect plan for your content creation needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative rounded-xl border ${
                  plan.popular ? "border-primary shadow-lg" : "border-accent"
                } bg-card p-8`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold mb-2">
                    ${plan.price}
                    <span className="text-lg text-muted-foreground">/month</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-accent hover:bg-accent/90"
                  }`}
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
      <section className="py-20 bg-gradient-to-b from-background to-accent">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Ready to Create Amazing Videos?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of creators who are already using Cynova to create engaging content.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/signup")}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white px-8"
            >
              Get Started Now
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
