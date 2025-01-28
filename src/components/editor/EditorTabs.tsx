import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UploadSection } from "./sections/UploadSection";
import { BackgroundSection } from "./sections/BackgroundSection";
import { CaptionsSection } from "./sections/CaptionsSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";

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

  const handleBack = () => {
    if (activeTab === "captions") {
      setActiveTab("background");
    } else if (activeTab === "background") {
      setActiveTab("upload");
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
        <TabsList className="grid w-full grid-cols-3 tabs-title">
          <TabsTrigger value="upload" className="justify-center text-base">Upload</TabsTrigger>
          <TabsTrigger value="background" className="justify-center text-base">Background</TabsTrigger>
          <TabsTrigger value="captions" className="justify-center text-base">Captions</TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="mt-6">
          <UploadSection onVideoUpload={handleVideoUpload} />
          {uploadedVideo && (
            <div className="flex justify-end mt-4">
              <Button onClick={handleNext}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="background" className="mt-6">
          <BackgroundSection 
            onBackgroundSelect={handleBackgroundSelect}
            selectedBackground={selectedBackground}
          />
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {selectedBackground && (
              <Button onClick={handleNext}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </TabsContent>
        <TabsContent value="captions" className="mt-6">
          <CaptionsSection 
            onCaptionSelect={handleCaptionSelect}
            selectedStyle={selectedCaptionStyle}
          />
          <div className="flex justify-start mt-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};