import { motion } from "framer-motion";

// This would typically come from your backend
const mockUpdates = [
  {
    id: 1,
    text: "Added new Would You Rather Videos feature",
    date: "2024-02-20",
  },
  {
    id: 2,
    text: "Launched Quiz Videos creation tool",
    date: "2024-02-19",
  },
  {
    id: 3,
    text: "Improved AI voiceover quality",
    date: "2024-02-18",
  },
];

export const UpdatesSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-accent rounded-lg p-6 mb-8"
    >
      <h2 className="text-2xl font-bold text-primary mb-4">Cynova Updates</h2>
      <div className="space-y-4">
        {mockUpdates.map((update) => (
          <div
            key={update.id}
            className="flex items-center justify-between border-b border-accent pb-2 last:border-0"
          >
            <p className="text-muted-foreground">{update.text}</p>
            <span className="text-sm text-muted-foreground">
              {new Date(update.date).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};