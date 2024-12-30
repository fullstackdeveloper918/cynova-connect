import { motion } from "framer-motion";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8"
    >
      <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
        {title}
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl">
        {description}
      </p>
    </motion.div>
  );
};

export default PlaceholderPage;