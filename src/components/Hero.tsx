import { motion } from "framer-motion";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/10 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-accent rounded-full animate-fade-in">
            Introducing Cynova AI
          </span>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            The Future of AI
            <br />
            <span className="text-secondary">Is Here</span>
          </h1>
          
          <p className="text-lg md:text-xl text-secondary mb-8 max-w-2xl mx-auto">
            Experience the next generation of artificial intelligence. Cynova brings revolutionary AI capabilities to your fingertips.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
              Get Started
            </button>
            <button className="px-8 py-3 bg-accent text-primary rounded-lg font-medium hover:opacity-90 transition-opacity">
              Learn More
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};