import { MobileSidebar } from "@/components/MobileSidebar";
import { VideoEditor } from "@/components/VideoEditor";

const Editor = () => {
  return (
    <MobileSidebar>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Video Editor</h1>
        <VideoEditor />
      </div>
    </MobileSidebar>
  );
};

export default Editor;