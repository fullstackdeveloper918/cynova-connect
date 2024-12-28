import { motion } from "framer-motion";
import { Cpu, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "Advanced AI",
    description: "Powered by cutting-edge machine learning algorithms",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Get results in milliseconds, not minutes",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is encrypted and protected",
  },
];

export const Features = () => {
  return (
    <section className="py-20 bg-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose Cynova
          </h2>
          <p className="text-secondary text-lg max-w-2xl mx-auto">
            Experience the power of next-generation AI technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <feature.icon className="w-12 h-12 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-secondary">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};