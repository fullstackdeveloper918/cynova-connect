import { motion } from "framer-motion";
import { Sparkles, Palette, Coins } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Effortless Creativity",
    description: "Cynova simplifies content creation with powerful AI tools, allowing users to produce high-quality videos and voiceovers in minutes - no technical skills required.",
  },
  {
    icon: Palette,
    title: "Versatility and Customization",
    description: "From dynamic subtitles to faceless video creation and text-to-image features, Cynova offers everything you need to craft engaging, unique content tailored to your audience.",
  },
  {
    icon: Coins,
    title: "Cost-Effective and Time-Saving",
    description: "By streamlining the entire content creation process, Cynova saves you time and resources, making it the perfect solution for creators, marketers, and businesses looking to scale their video/image output efficiently.",
  },
];

export const Features = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-primary font-medium mb-4 block"
          >
            Features
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          >
            Why Choose Cynova
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
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
              className="p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow border border-accent"
            >
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-primary">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};