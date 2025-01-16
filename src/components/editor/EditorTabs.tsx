import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UploadSection } from "./sections/UploadSection";
import { BackgroundSection } from "./sections/BackgroundSection";
import { CaptionsSection } from "./sections/CaptionsSection";

export const EditorTabs = () => {
  return (
    <Tabs defaultValue="upload" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="upload">Upload</TabsTrigger>
        <TabsTrigger value="background">Background</TabsTrigger>
        <TabsTrigger value="captions">Captions</TabsTrigger>
      </TabsList>
      <TabsContent value="upload" className="mt-6">
        <UploadSection />
      </TabsContent>
      <TabsContent value="background" className="mt-6">
        <BackgroundSection />
      </TabsContent>
      <TabsContent value="captions" className="mt-6">
        <CaptionsSection />
      </TabsContent>
    </Tabs>
  );
};