import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const Newsletter = () => {
  return (
    <section className="py-20 bg-zinc-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900">
            Stay Updated
          </h2>
          <p className="text-lg mb-8 text-zinc-600">
            Subscribe to our newsletter for the latest updates and AI insights
          </p>
          
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-white border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 placeholder:text-zinc-500"
            />
            <button
              type="submit"
              className="group px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              Subscribe
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};