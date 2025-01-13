import { motion } from "framer-motion";
import { Sparkles, Palette, Clock } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Effortless Creation",
    description: "Generate professional videos with AI voiceovers and dynamic subtitles—no experience needed.",
  },
  {
    icon: Palette,
    title: "Customizable Tools",
    description: "Choose from versatile templates for social media, marketing, or presentations.",
  },
  {
    icon: Clock,
    title: "Save Time & Money",
    description: "Streamline video creation with Cynova's all-in-one, cost-effective platform.",
  },
];

export const Features = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-zinc-600 font-medium mb-4 block"
          >
            Features
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900"
          >
            Why Choose Cynova
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-zinc-600 text-lg max-w-2xl mx-auto"
          >
            Experience the power of next-generation AI technology
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6"
            >
              <div className="w-12 h-12 rounded-lg bg-zinc-50 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-zinc-900" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-zinc-900">{feature.title}</h3>
              <p className="text-zinc-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};