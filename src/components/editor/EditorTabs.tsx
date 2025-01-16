import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UploadSection } from "./sections/UploadSection";
import { BackgroundSection } from "./sections/BackgroundSection";
import { CaptionsSection } from "./sections/CaptionsSection";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface EditorTabsProps {
  onVideoUpload: (file: File) => void;
  onBackgroundSelect: (videoId: string) => void;
  onCaptionChange: (caption: string) => void;
}

export const EditorTabs = ({ onVideoUpload, onBackgroundSelect, onCaptionChange }: EditorTabsProps) => {
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadedVideo, setUploadedVideo] = useState<File | string | null>(null);
  const [selectedBackground, setSelectedBackground] = useState("");
  const [selectedCaptionStyle, setSelectedCaptionStyle] = useState("");

  const handleNext = () => {
    if (activeTab === "upload") {
      setActiveTab("background");
    } else if (activeTab === "background") {
      setActiveTab("captions");
    }
  };

  const handleVideoUpload = (file: File) => {
    setUploadedVideo(file);
    onVideoUpload(file);
  };

  const handleBackgroundSelect = (videoId: string) => {
    setSelectedBackground(videoId);
    onBackgroundSelect(videoId);
  };

  const handleCaptionSelect = (style: string) => {
    setSelectedCaptionStyle(style);
    onCaptionChange(style);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="background">Background</TabsTrigger>
          <TabsTrigger value="captions">Captions</TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="mt-6">
          <UploadSection onVideoUpload={handleVideoUpload} />
          {uploadedVideo && (
            <Button onClick={handleNext} className="mt-4">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </TabsContent>
        <TabsContent value="background" className="mt-6">
          <BackgroundSection 
            onBackgroundSelect={handleBackgroundSelect}
            selectedBackground={selectedBackground}
          />
          {selectedBackground && (
            <Button onClick={handleNext} className="mt-4">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </TabsContent>
        <TabsContent value="captions" className="mt-6">
          <CaptionsSection 
            onCaptionSelect={handleCaptionSelect}
            selectedStyle={selectedCaptionStyle}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};