import { useState, useRef, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Eye, Download, Type, Move, RotateCcw, ArrowLeft, Eraser, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ImageUpload } from "./ImageUpload";
import { TextCanvas } from "./TextCanvas";
import { OCRProcessor } from "./OCRProcessor";
import { FabricCanvas } from "fabric";
import { useEnhancedTextAnalysis } from "./enhanced-font-detection";
import { useTextRemoval } from "@/hooks/useTextRemoval";

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
  style?: {
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    fill: string;
    stroke: string;
    strokeWidth: number;
    lineHeight: number;
    letterSpacing: number;
  };
}

export const PhotoTextEditor = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [cleanedImage, setCleanedImage] = useState<string | null>(null);
  const [detectedTexts, setDetectedTexts] = useState<DetectedText[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTool, setCurrentTool] = useState<"select" | "text" | "move">("select");
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const textCanvasRef = useRef<any>(null);
  
  // Text removal functionality
  const { removeText, isRemoving, isServiceAvailable, checkServiceHealth } = useTextRemoval({
    baseUrl: 'http://localhost:5050'
  });

  // Check service health on component mount
  useEffect(() => {
    checkServiceHealth();
  }, [checkServiceHealth]);

  const handleImageUpload = useCallback((imageDataUrl: string) => {
    setUploadedImage(imageDataUrl);
    setCleanedImage(null); // Reset cleaned image when new image is uploaded
    setDetectedTexts([]);
    toast("Image uploaded successfully!");
  }, []);

  const { analyzeTextsWithStyles } = useEnhancedTextAnalysis();

  const handleOCRComplete = useCallback(async (texts: DetectedText[]) => {
    const currentImage = cleanedImage || uploadedImage;
    
    if (!currentImage) {
      toast.error("No image available for text detection!");
      setIsProcessing(false);
      return;
    }

    if (texts.length === 0) {
      toast("No text detected in the image");
      setIsProcessing(false);
      return;
    }

    try {
      // First, perform style analysis
      const canvasWidth = fabricCanvasRef.current?.width || 800;
      const canvasHeight = fabricCanvasRef.current?.height || 600;

      const analyzedTexts = await analyzeTextsWithStyles(
        texts,
        currentImage,
        canvasWidth,
        canvasHeight
      );
      
      // If text removal service is available, automatically remove text from image
      if (isServiceAvailable && analyzedTexts.length > 0) {
        toast("Text detected! Removing original text from image...");
        
        try {
          const bboxes = analyzedTexts.map(text => text.bbox);
          const cleanedImageResult = await removeText(currentImage, bboxes);
          console.log("analyzedTexts",analyzedTexts)
          if (cleanedImageResult) {
            setCleanedImage(cleanedImageResult);
            setDetectedTexts(analyzedTexts);
            toast.success(`Successfully detected ${analyzedTexts.length} text regions and removed original text! Text is now editable on canvas.`);
          } else {
            // If removal failed, still show detected text
            setDetectedTexts(analyzedTexts);
            toast(`Detected ${analyzedTexts.length} text regions, but text removal failed. Text is still editable on canvas.`);
          }
        } catch (removalError) {
          console.error('Auto text removal failed:', removalError);
          // If removal fails, still show the detected text
          setDetectedTexts(analyzedTexts);
          toast(`Detected ${analyzedTexts.length} text regions, but auto-removal failed. You can manually remove text or edit as-is.`);
        }
      } else {
        // If service not available, just show detected text
        setDetectedTexts(analyzedTexts);
        if (isServiceAvailable === false) {
          toast(`Detected ${analyzedTexts.length} text regions! Text removal service unavailable - text is editable on canvas.`);
        } else {
          toast(`Detected ${analyzedTexts.length} text regions with styles! Text is editable on canvas.`);
        }
      }
    } catch (error) {
      console.error('Text analysis failed:', error);
      setDetectedTexts(texts);
      toast.error('Text detected but style analysis failed. Basic text editing available.');
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedImage, cleanedImage, analyzeTextsWithStyles, removeText, isServiceAvailable]);

  const handleProcessOCR = useCallback(() => {
    const currentImage = cleanedImage || uploadedImage;
    if (!currentImage) {
      toast.error("Please upload an image first");
      return;
    }
    
    setIsProcessing(true);
    setDetectedTexts([]); // Clear existing detected texts
    toast("Processing image with OCR...");
  }, [uploadedImage, cleanedImage]);

  const handleManualRemoveText = useCallback(async () => {
    const currentImage = cleanedImage || uploadedImage;
    
    if (!currentImage) {
      toast.error("Please upload an image first");
      return;
    }

    if (detectedTexts.length === 0) {
      toast.error("No text detected. Run text detection first.");
      return;
    }

    try {
      console.log("detectedTexts",detectedTexts)
      const bboxes = detectedTexts.map(text => text.bbox);
      const result = await removeText(currentImage, bboxes);
      
      if (result) {
        setCleanedImage(result);
        toast.success("Text manually removed from image! Detected text remains editable on canvas.");
      }
    } catch (error) {
      console.error('Manual text removal failed:', error);
      toast.error('Failed to remove text from image');
    }
  }, [uploadedImage, cleanedImage, detectedTexts, removeText]);

  const handleExport = useCallback(() => {
    if (textCanvasRef.current) {
      textCanvasRef.current.exportCanvas();
    }
  }, []);

  const handleClear = useCallback(() => {
    setUploadedImage(null);
    setCleanedImage(null);
    setDetectedTexts([]);
    if (textCanvasRef.current) {
      textCanvasRef.current.clearCanvas();
    }
    toast("Workspace cleared!");
  }, []);

  const handleCanvasReady = useCallback((canvas: FabricCanvas) => {
    fabricCanvasRef.current = canvas;
  }, []);

  const handleReanalyzeStyles = useCallback(async () => {
    const currentImage = cleanedImage || uploadedImage;
    
    if (!currentImage || !detectedTexts.length || !fabricCanvasRef.current) {
      toast.error("Cannot reanalyze - no image or texts detected");
      return;
    }

    try {
      setIsProcessing(true);
      const canvasWidth = fabricCanvasRef.current.width || 800;
      const canvasHeight = fabricCanvasRef.current.height || 600;

      const reanalyzedTexts = await analyzeTextsWithStyles(
        detectedTexts,
        currentImage,
        canvasWidth,
        canvasHeight
      );
      
      setDetectedTexts(reanalyzedTexts);
      console.log("reanalyzedTexts",reanalyzedTexts)
      toast(`Re-analyzed ${reanalyzedTexts.length} text regions`);
    } catch (error) {
      console.error("Re-analysis failed:", error);
      toast.error("Failed to reanalyze text styles");
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedImage, cleanedImage, detectedTexts, analyzeTextsWithStyles]);

  const currentImage = cleanedImage || uploadedImage;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Photo Text Editor
              </h1>
              <p className="text-muted-foreground text-lg">
                Upload images, auto-detect and remove text, then edit text directly on the canvas
              </p>
            </div>
          </div>
        </div>

        {/* Service Status */}
        {isServiceAvailable === false && (
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-medium">Text Removal Service Unavailable</p>
                <p className="text-sm">
                  Text detection will still work, but original text won't be automatically removed from images. 
                  Make sure your Flask server is running on port 5000 for full functionality.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Service Available Status */}
        {isServiceAvailable === true && (
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center gap-2 text-green-800">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-medium">Auto Text Removal Enabled</p>
                <p className="text-sm">
                  When you detect text, it will be automatically removed from the image and made editable on the canvas.
                </p>
              </div>
            </div>
          </Card>
        )}

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
              Add Text
            </Button>
            <div className="h-6 w-px bg-border mx-2" />
            <Button
              variant="default"
              size="sm"
              onClick={handleProcessOCR}
              disabled={!currentImage || isProcessing}
              className="bg-primary hover:bg-primary/90"
            >
              <Eye className="w-4 h-4 mr-2" />
              {isProcessing ? "Processing..." : "Detect & Remove Text"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRemoveText}
              disabled={!currentImage || detectedTexts.length === 0 || isRemoving || isServiceAvailable === false}
              title="Manually remove text from image (if auto-removal didn't work)"
            >
              <Eraser className="w-4 h-4 mr-2" />
              {isRemoving ? "Removing..." : "Manual Remove"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReanalyzeStyles}
              disabled={!currentImage || !detectedTexts.length || isProcessing}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reanalyze Styles
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={!currentImage}
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
              Clear All
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
                {currentImage && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {cleanedImage ? 'Cleaned Image:' : 'Original Image:'}
                    </p>
                    <img
                      src={currentImage}
                      alt={cleanedImage ? 'Cleaned' : 'Original'}
                      className="w-full h-32 object-cover rounded-lg border border-border"
                    />
                    {cleanedImage && (
                      <p className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        ✓ Original text removed - editing on canvas
                      </p>
                    )}
                    {detectedTexts.length > 0 && (
                      <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        📝 {detectedTexts.length} text region{detectedTexts.length > 1 ? 's' : ''} detected & editable
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Canvas Area */}
          <div className="xl:col-span-3">
            <Card className="p-6 bg-gradient-glass backdrop-blur-sm border-border/50 min-h-[600px]">
              {currentImage ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Type className="w-5 h-5 text-accent" />
                    <h3 className="text-lg font-semibold">Canvas Editor</h3>
                    {detectedTexts.length > 0 && (
                      <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                        {detectedTexts.length} editable text region{detectedTexts.length > 1 ? 's' : ''}
                      </span>
                    )}
                    {cleanedImage && (
                      <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        Using cleaned image
                      </span>
                    )}
                  </div>
                  <TextCanvas
                    ref={textCanvasRef}
                    backgroundImage={currentImage}
                    detectedTexts={detectedTexts}
                    currentTool={currentTool}
                    onCanvasReady={handleCanvasReady}
                    analyzeTextsWithStyles={analyzeTextsWithStyles}
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
                      Supported: JPG, PNG, WebP | Auto text detection & removal
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* OCR Processor */}
        {currentImage && isProcessing && (
          <OCRProcessor
            imageDataUrl={currentImage}
            onComplete={handleOCRComplete}
            onError={() => setIsProcessing(false)}
          />
        )}
      </div>
    </div>
  );
};