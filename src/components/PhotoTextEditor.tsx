import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Eye, Download, Type, Move, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "./ImageUpload";
import { TextCanvas } from "./TextCanvas";
import { OCRProcessor } from "./OCRProcessor";

export interface DetectedText {
  id: string;
  text: string;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
  confidence: number;
}

export const PhotoTextEditor = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [detectedTexts, setDetectedTexts] = useState<DetectedText[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTool, setCurrentTool] = useState<"select" | "text" | "move">("select");
  const canvasRef = useRef<any>(null);

  const handleImageUpload = useCallback((imageDataUrl: string) => {
    setUploadedImage(imageDataUrl);
    setDetectedTexts([]);
    toast("Image uploaded successfully!");
  }, []);

  const handleOCRComplete = useCallback((texts: DetectedText[]) => {
    setDetectedTexts(texts);
    setIsProcessing(false);
    toast(`Detected ${texts.length} text regions!`);
  }, []);

  const handleProcessOCR = useCallback(() => {
    if (!uploadedImage) {
      toast.error("Please upload an image first");
      return;
    }
    setIsProcessing(true);
    toast("Processing image with OCR...");
  }, [uploadedImage]);

  const handleExport = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.exportCanvas();
    }
  }, []);

  const handleClear = useCallback(() => {
    setUploadedImage(null);
    setDetectedTexts([]);
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
    toast("Workspace cleared!");
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Photo Text Editor
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload images, detect text with OCR, and edit text directly on the canvas
          </p>
        </div>

        {/* Toolbar */}
        <Card className="p-4 bg-gradient-glass backdrop-blur-sm border-border/50">
          <div className="flex flex-wrap gap-3 items-center justify-center">
            <Button
              variant={currentTool === "select" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentTool("select")}
            >
              <Move className="w-4 h-4 mr-2" />
              Select
            </Button>
            <Button
              variant={currentTool === "text" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentTool("text")}
            >
              <Type className="w-4 h-4 mr-2" />
              Text
            </Button>
            <div className="h-6 w-px bg-border mx-2" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleProcessOCR}
              disabled={!uploadedImage || isProcessing}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isProcessing ? "Processing..." : "Detect Text"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={!uploadedImage}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Upload Area */}
          <div className="xl:col-span-1">
            <Card className="p-6 bg-gradient-tool backdrop-blur-sm border-border/50 shadow-tool">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Upload Image</h3>
                </div>
                <ImageUpload onImageUpload={handleImageUpload} />
                {uploadedImage && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Preview:</p>
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="w-full h-32 object-cover rounded-lg border border-border"
                    />
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Canvas Area */}
          <div className="xl:col-span-3">
            <Card className="p-6 bg-gradient-glass backdrop-blur-sm border-border/50 min-h-[600px]">
              {uploadedImage ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Type className="w-5 h-5 text-accent" />
                    <h3 className="text-lg font-semibold">Canvas Editor</h3>
                    {detectedTexts.length > 0 && (
                      <span className="text-sm text-muted-foreground">
                        ({detectedTexts.length} text regions detected)
                      </span>
                    )}
                  </div>
                  <TextCanvas
                    ref={canvasRef}
                    backgroundImage={uploadedImage}
                    detectedTexts={detectedTexts}
                    currentTool={currentTool}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <div className="text-center space-y-3">
                    <Upload className="w-16 h-16 text-muted-foreground mx-auto" />
                    <p className="text-xl text-muted-foreground">
                      Upload an image to start editing
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supported formats: JPG, PNG, WebP
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* OCR Processor */}
        {uploadedImage && isProcessing && (
          <OCRProcessor
            imageDataUrl={uploadedImage}
            onComplete={handleOCRComplete}
            onError={() => setIsProcessing(false)}
          />
        )}
      </div>
    </div>
  );
};