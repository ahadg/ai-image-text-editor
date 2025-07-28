import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Canvas as FabricCanvas, FabricText, FabricImage, util } from "fabric";
import { toast } from "sonner";
import type { DetectedText } from "./PhotoTextEditor";

interface TextCanvasProps {
  backgroundImage: string;
  detectedTexts: DetectedText[];
  currentTool: "select" | "text" | "move";
}

export const TextCanvas = forwardRef<any, TextCanvasProps>(
  ({ backgroundImage, detectedTexts, currentTool }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useImperativeHandle(ref, () => ({
      exportCanvas: () => {
        if (fabricCanvas) {
          const dataURL = fabricCanvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2,
          });
          
          // Create download link
          const link = document.createElement('a');
          link.download = 'edited-image.png';
          link.href = dataURL;
          link.click();
          
          toast("Image exported successfully!");
        }
      },
      clearCanvas: () => {
        if (fabricCanvas) {
          fabricCanvas.clear();
          fabricCanvas.backgroundColor = '#ffffff';
          fabricCanvas.renderAll();
        }
      }
    }));

    // Initialize canvas
    useEffect(() => {
      if (!canvasRef.current) return;

      const canvas = new FabricCanvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: '#ffffff',
        preserveObjectStacking: true,
      });

      // Configure canvas selection
      canvas.selection = currentTool === "select";
      canvas.isDrawingMode = false;

      setFabricCanvas(canvas);

      return () => {
        canvas.dispose();
      };
    }, []);

    // Update canvas tool mode
    useEffect(() => {
      if (!fabricCanvas) return;

      fabricCanvas.selection = currentTool === "select";
      
      // Set object selection based on tool
      fabricCanvas.forEachObject((obj) => {
        obj.selectable = currentTool === "select";
        obj.evented = currentTool === "select";
      });

      fabricCanvas.renderAll();
    }, [currentTool, fabricCanvas]);

    // Load background image
    useEffect(() => {
      if (!fabricCanvas || !backgroundImage) return;

      setIsLoading(true);
      
      FabricImage.fromURL(backgroundImage, {
        crossOrigin: 'anonymous'
      }).then((img) => {
        if (!fabricCanvas) return;

        // Calculate canvas size based on image
        const maxWidth = 800;
        const maxHeight = 600;
        const imgWidth = img.width!;
        const imgHeight = img.height!;
        
        let canvasWidth = imgWidth;
        let canvasHeight = imgHeight;
        
        if (imgWidth > maxWidth || imgHeight > maxHeight) {
          const scaleX = maxWidth / imgWidth;
          const scaleY = maxHeight / imgHeight;
          const scale = Math.min(scaleX, scaleY);
          
          canvasWidth = imgWidth * scale;
          canvasHeight = imgHeight * scale;
        }

        // Set canvas dimensions
        fabricCanvas.setDimensions({
          width: canvasWidth,
          height: canvasHeight
        });

        // Scale and position the image
        img.scale(canvasWidth / imgWidth);
        img.set({
          left: 0,
          top: 0,
          selectable: false,
          evented: false,
        });

        // Clear canvas and set background
        fabricCanvas.clear();
        fabricCanvas.backgroundImage = img;
        fabricCanvas.renderAll();
        
        setIsLoading(false);
        toast("Image loaded on canvas!");
      }).catch((error) => {
        console.error('Error loading image:', error);
        toast.error("Failed to load image on canvas");
        setIsLoading(false);
      });
    }, [fabricCanvas, backgroundImage]);

    // Add detected texts to canvas
    useEffect(() => {
      if (!fabricCanvas || !detectedTexts.length) return;

      // Remove existing text objects
      const existingTexts = fabricCanvas.getObjects().filter(obj => obj.type === 'textbox');
      existingTexts.forEach(text => fabricCanvas.remove(text));

      // Add new detected texts
      detectedTexts.forEach((detectedText) => {
        const canvasWidth = fabricCanvas.width!;
        const canvasHeight = fabricCanvas.height!;
        
        // Convert normalized coordinates to canvas coordinates
        const x = (detectedText.bbox.x0 / 100) * canvasWidth;
        const y = (detectedText.bbox.y0 / 100) * canvasHeight;
        const width = ((detectedText.bbox.x1 - detectedText.bbox.x0) / 100) * canvasWidth;
        const height = ((detectedText.bbox.y1 - detectedText.bbox.y0) / 100) * canvasHeight;

        const textObj = new FabricText(detectedText.text, {
          left: x,
          top: y,
          width: Math.max(width, 100),
          fontSize: Math.max(height * 0.6, 12),
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 1,
          fontFamily: 'Arial',
          selectable: currentTool === "select",
          evented: currentTool === "select",
          backgroundColor: 'rgba(0,0,0,0.3)',
          padding: 4,
        });

        fabricCanvas.add(textObj);
      });

      fabricCanvas.renderAll();
    }, [fabricCanvas, detectedTexts, currentTool]);

    // Handle canvas clicks for text tool
    useEffect(() => {
      if (!fabricCanvas) return;

      const handleCanvasClick = (e: any) => {
        if (currentTool === "text" && e.pointer) {
          const textObj = new FabricText('Edit this text', {
            left: e.pointer.x - 50,
            top: e.pointer.y - 10,
            fontSize: 20,
            fill: '#ffffff',
            stroke: '#000000',
            strokeWidth: 1,
            fontFamily: 'Arial',
            selectable: true,
            evented: true,
            backgroundColor: 'rgba(0,0,0,0.3)',
            padding: 4,
          });

          fabricCanvas.add(textObj);
          fabricCanvas.setActiveObject(textObj);
          fabricCanvas.renderAll();
          
          toast("Click text to edit, drag to move");
        }
      };

      fabricCanvas.on('mouse:down', handleCanvasClick);

      return () => {
        fabricCanvas.off('mouse:down', handleCanvasClick);
      };
    }, [fabricCanvas, currentTool]);

    return (
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="relative border border-border rounded-lg overflow-hidden shadow-tool">
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-muted-foreground">Loading image...</p>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="max-w-full" />
          </div>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          {currentTool === "select" && "Select and edit text objects"}
          {currentTool === "text" && "Click on the canvas to add new text"}
          {currentTool === "move" && "Drag to move objects around"}
        </div>
      </div>
    );
  }
);

TextCanvas.displayName = "TextCanvas";