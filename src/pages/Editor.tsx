import { MobileSidebar } from "@/components/MobileSidebar";
import { EditorTabs } from "@/components/editor/EditorTabs";

const Editor = () => {
  return (
    <MobileSidebar>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Video Editor</h1>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <EditorTabs />
          </div>
          <div className="bg-muted aspect-[9/16] rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Video Preview</p>
          </div>
        </div>
      </div>
    </MobileSidebar>
  );
};

export default Editor;