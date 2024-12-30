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
    type: "ChatGPT Video",
  },
  {
    id: 2,
    title: "Product Review v2",
    thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    date: "2024-02-19",
    size: "180MB",
    type: "Fake Text Video",
  },
  {
    id: 3,
    title: "Tutorial Final",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
    date: "2024-02-18",
    size: "320MB",
    type: "Reddit Video",
  },
  {
    id: 4,
    title: "Gaming Highlights",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
    date: "2024-02-17",
    size: "400MB",
    type: "Split Video",
  },
  {
    id: 5,
    title: "AI Commentary",
    thumbnail: "https://images.unsplash.com/photo-1593697821028-7cc59cfd7399",
    date: "2024-02-16",
    size: "150MB",
    type: "Voiceover Video",
  },
];

export const ExportsGrid = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">My Exports</h2>
          <p className="text-muted-foreground mt-1">
            Access and download your exported videos
          </p>
        </div>
        <span className="text-muted-foreground bg-accent/50 px-3 py-1 rounded-full">
          {mockExports.length} exports
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockExports.map((exportItem, index) => (
          <motion.div
            key={exportItem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-lg border border-accent bg-card hover:shadow-lg transition-all duration-300"
          >
            <div className="aspect-video w-full overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <img
                src={exportItem.thumbnail}
                alt={exportItem.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute top-2 right-2 z-20 bg-accent/90 text-accent-foreground px-2 py-1 rounded-full text-xs font-medium">
                {exportItem.type}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{exportItem.title}</h3>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground flex items-center">
                  <FileVideo className="w-4 h-4 mr-1" />
                  {exportItem.size}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(exportItem.date).toLocaleDateString()}
                </span>
              </div>
              <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};