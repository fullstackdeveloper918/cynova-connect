import { motion } from "framer-motion";
import { Download, FileVideo } from "lucide-react";
import { Button } from "./ui/button";

// This would typically come from your backend
const mockExports = [
  {
    id: 1,
    title: "Final Cut - Summer Vlog",
    thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    date: "2024-02-20",
    size: "250MB",
  },
  {
    id: 2,
    title: "Product Review v2",
    thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    date: "2024-02-19",
    size: "180MB",
  },
  {
    id: 3,
    title: "Tutorial Final",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
    date: "2024-02-18",
    size: "320MB",
  },
];

export const ExportsGrid = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">My Exports</h2>
        <span className="text-muted-foreground">{mockExports.length} exports</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockExports.map((exportItem) => (
          <motion.div
            key={exportItem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden rounded-lg border border-accent bg-card"
          >
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={exportItem.thumbnail}
                alt={exportItem.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg">{exportItem.title}</h3>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {exportItem.size}
                </span>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Exported on {new Date(exportItem.date).toLocaleDateString()}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};