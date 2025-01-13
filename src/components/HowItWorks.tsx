import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Create Your Script",
    description: "Draft your content or use our ready-made templates",
  },
  {
    number: "02",
    title: "Customize Your Video",
    description: "Add voiceovers, subtitles, and visuals to match your style",
  },
  {
    number: "03",
    title: "Generate and Share",
    description: "Produce your video in minutes and share it anywhere",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 bg-zinc-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-zinc-600 font-medium mb-4 block"
          >
            How It Works
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900"
          >
            Get Started in Minutes
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-zinc-600 text-lg max-w-2xl mx-auto"
          >
            Begin your AI journey with three simple steps
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <span className="inline-block text-5xl font-bold text-zinc-900 mb-4 group-hover:scale-110 transition-transform">
                {step.number}
              </span>
              <h3 className="text-xl font-semibold mb-2 text-zinc-900">{step.title}</h3>
              <p className="text-zinc-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};