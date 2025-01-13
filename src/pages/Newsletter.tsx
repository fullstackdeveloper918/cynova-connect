import { Navigation } from "@/components/Navigation";
import { Newsletter as NewsletterForm } from "@/components/Newsletter";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

const Newsletter = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="pt-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6">
              Stay Connected
            </h1>
            <p className="text-xl text-zinc-600">
              Subscribe to our newsletter and stay up to date with the latest AI video creation tips, 
              features, and updates.
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto mb-20">
            <NewsletterForm />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-zinc-200 p-8 mb-20"
          >
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">
              Why Subscribe?
            </h2>
            <div className="grid gap-6">
              <div>
                <h3 className="font-semibold text-zinc-900 mb-2">Early Access to Features</h3>
                <p className="text-zinc-600">Be the first to know about and try new AI video creation features.</p>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 mb-2">Expert Tips & Tutorials</h3>
                <p className="text-zinc-600">Get exclusive content creation tips and tutorials from our team.</p>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 mb-2">Special Offers</h3>
                <p className="text-zinc-600">Receive special offers and discounts available only to our subscribers.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Newsletter;