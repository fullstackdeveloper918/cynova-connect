import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Sign Up",
    description: "Create your account in seconds",
  },
  {
    number: "02",
    title: "Configure",
    description: "Set up your preferences and requirements",
  },
  {
    number: "03",
    title: "Launch",
    description: "Start using Cynova's powerful AI features",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-secondary text-lg max-w-2xl mx-auto">
            Get started with Cynova in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <span className="inline-block text-4xl font-bold text-accent mb-4">
                {step.number}
              </span>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-secondary">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};