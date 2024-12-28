import { useState } from "react";
import { VideoEditor } from "@/components/VideoEditor";
import { motion } from "framer-motion";

const UserDashboard = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Video Editor Dashboard
        </h1>
        <VideoEditor />
      </motion.div>
    </div>
  );
};

export default UserDashboard;