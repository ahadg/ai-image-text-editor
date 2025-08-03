import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Canvas as FabricCanvas, Textbox, FabricImage, IText } from "fabric";
import { toast } from "sonner";
import { DetectedText } from "./PhotoTextEditor";

interface TextCanvasProps {
  backgroundImage: string;
  detectedTexts: DetectedText[];
  currentTool: "select" | "text" | "move";
  onCanvasReady: (canvas: FabricCanvas) => void;
  analyzeTextsWithStyles?: (
    texts: DetectedText[],
    imageDataUrl: string,
    canvasWidth: number,
    canvasHeight: number
  ) => Promise<DetectedText[]>;
}

interface TextStyleInfo {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  textAlign: string;
}

export const TextCanvas = forwardRef<any, TextCanvasProps>(
  ({ backgroundImage, detectedTexts, currentTool, onCanvasReady, analyzeTextsWithStyles }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<FabricCanvas | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [imageScale, setImageScale] = useState(1);
    const [selectedObject, setSelectedObject] = useState<any>(null);
    const [fontOptions, setFontOptions] = useState<TextStyleInfo>({
      fontFamily: 'Arial',
      fontSize: 16,
      fontWeight: 'normal',
      color: '#000000',
      strokeColor: 'transparent',
      strokeWidth: 0,
      textAlign: 'left',
    });

    // Expose canvas methods to parent
    useImperativeHandle(ref, () => ({
      exportCanvas: () => {
        const canvas = fabricCanvasRef.current;
        if (canvas) {
          const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2,
          });
          
          const link = document.createElement('a');
          link.download = 'edited-image.png';
          link.href = dataURL;
          link.click();
          
          toast("Image exported successfully!");
        }
      },
      clearCanvas: () => {
        const canvas = fabricCanvasRef.current;
        if (canvas) {
          canvas.clear();
          canvas.backgroundColor = '#ffffff';
          canvas.renderAll();
        }
      },
      reanalyzeStyles: async () => {
        if (analyzeTextsWithStyles && detectedTexts.length > 0 && backgroundImage && fabricCanvasRef.current) {
          await performStyleAnalysis();
        }
      }
    }));

    // Helper function to estimate text width
    const estimateTextWidth = (text: string, fontSize: number, fontFamily: string, fontWeight: string): number => {
      // Create a temporary canvas to measure text
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return text.length * fontSize * 0.6; // fallback
      
      tempCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      const metrics = tempCtx.measureText(text);
      return metrics.width;
    };

    // Helper function to determine if text should be single line or multi-line
    const shouldUseSingleLine = (detectedText: DetectedText, canvasWidth: number, canvasHeight: number): boolean => {
      const bboxWidth = ((detectedText.bbox.x1 - detectedText.bbox.x0) / 100) * canvasWidth;
      const bboxHeight = ((detectedText.bbox.y1 - detectedText.bbox.y0) / 100) * canvasHeight;
      const aspectRatio = bboxWidth / bboxHeight;
      
      // If the bounding box is very wide relative to height, it's likely single line
      if (aspectRatio > 5) return true;
      
      // If text has no spaces or is very short, keep it single line
      if (!detectedText.text.includes(' ') || detectedText.text.length < 15) return true;
      
      // Check if estimated width for single line is reasonable
      const fontSize = detectedText.style?.fontSize || 16;
      const fontFamily = detectedText.style?.fontFamily || 'Arial';
      const fontWeight = detectedText.style?.fontWeight || 'normal';
      const estimatedWidth = estimateTextWidth(detectedText.text, fontSize, fontFamily, fontWeight);
      
      // If estimated width is much smaller than bbox, it's probably meant to be single line
      if (estimatedWidth < bboxWidth * 0.8) return true;
      
      // Check text characteristics
      const words = detectedText.text.split(' ');
      if (words.length <= 3) return true; // Short phrases stay single line
      
      return false;
    };

    // Initialize canvas
    useEffect(() => {
      if (!canvasRef.current || fabricCanvasRef.current) return;

      const canvas = new FabricCanvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: '#ffffff',
        preserveObjectStacking: true,
        selection: currentTool === "select",
        isDrawingMode: false,
      });

      fabricCanvasRef.current = canvas;
      onCanvasReady(canvas);

      // Setup event listeners
      const handleSelection = () => {
        const activeObject = canvas.getActiveObject();
        setSelectedObject(activeObject);
        
        if (activeObject && (activeObject.type === 'textbox' || activeObject.type === 'i-text')) {
          setFontOptions({
            fontFamily: activeObject.fontFamily || 'Arial',
            fontSize: activeObject.fontSize || 16,
            fontWeight: activeObject.fontWeight || 'normal',
            color: activeObject.fill || '#000000',
            strokeColor: activeObject.stroke || 'transparent',
            strokeWidth: activeObject.strokeWidth || 0,
            textAlign: activeObject.textAlign || 'left',
          });
        }
      };

      const handleObjectModified = () => canvas.renderAll();
      const handleDoubleClick = (e: any) => {
        const target = e.target;
        if (target && (target.type === 'textbox' || target.type === 'i-text')) {
          target.enterEditing();
          target.hiddenTextarea?.focus();
        }
      };

      canvas.on('selection:created', handleSelection);
      canvas.on('selection:updated', handleSelection);
      canvas.on('selection:cleared', () => setSelectedObject(null));
      canvas.on('object:modified', handleObjectModified);
      canvas.on('mouse:dblclick', handleDoubleClick);

      return () => {
        if (canvas && !canvas.isDestroyed) {
          canvas.off('selection:created', handleSelection);
          canvas.off('selection:updated', handleSelection);
          canvas.off('object:modified', handleObjectModified);
          canvas.off('mouse:dblclick', handleDoubleClick);
          canvas.dispose();
        }
      };
    }, []);

    // Update canvas tool mode
    useEffect(() => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      canvas.selection = currentTool === "select";
      canvas.forEachObject(obj => {
        obj.selectable = currentTool === "select";
        obj.evented = currentTool === "select";
      });
      canvas.renderAll();
    }, [currentTool]);

    // Load background image
    useEffect(() => {
      const canvas = fabricCanvasRef.current;
      if (!canvas || !backgroundImage) return;

      setIsLoading(true);
      
      FabricImage.fromURL(backgroundImage, {
        crossOrigin: 'anonymous'
      }).then((img) => {
        if (!canvas || canvas.isDestroyed) return;

        const maxWidth = 800;
        const maxHeight = 600;
        const imgWidth = img.width!;
        const imgHeight = img.height!;
        
        let canvasWidth = imgWidth;
        let canvasHeight = imgHeight;
        let scale = 1;
        
        if (imgWidth > maxWidth || imgHeight > maxHeight) {
          const scaleX = maxWidth / imgWidth;
          const scaleY = maxHeight / imgHeight;
          scale = Math.min(scaleX, scaleY);
          canvasWidth = imgWidth * scale;
          canvasHeight = imgHeight * scale;
        }

        setImageScale(scale);
        canvas.setDimensions({ width: canvasWidth, height: canvasHeight });

        img.scale(scale);
        img.set({
          left: 0,
          top: 0,
          selectable: false,
          evented: false,
        });

        canvas.clear();
        canvas.backgroundImage = img;
        canvas.renderAll();
        setIsLoading(false);
        toast("Image loaded on canvas!");
      }).catch((error) => {
        console.error('Error loading image:', error);
        toast.error("Failed to load image on canvas");
        setIsLoading(false);
      });
    }, [backgroundImage]);

    // Add detected texts to canvas
    useEffect(() => {
      const canvas = fabricCanvasRef.current;
      if (!canvas || !detectedTexts.length || isAnalyzing) return;

      // Remove existing text objects
      const existingTexts = canvas.getObjects().filter(obj => 
        (obj.type === 'textbox' || obj.type === 'i-text') && (obj as any).isDetectedText
      );
      existingTexts.forEach(text => canvas.remove(text));

      const canvasWidth = canvas.width!;
      const canvasHeight = canvas.height!;

      // Add new text objects
      detectedTexts.forEach((detectedText) => {
        const x = (detectedText.bbox.x0 / 100) * canvasWidth;
        const y = (detectedText.bbox.y0 / 100) * canvasHeight;
        const width = Math.max(((detectedText.bbox.x1 - detectedText.bbox.x0) / 100) * canvasWidth, 50);
        const height = ((detectedText.bbox.y1 - detectedText.bbox.y0) / 100) * canvasHeight;

        const style = detectedText.style || {
          fontSize: 16,
          fontWeight: 'normal',
          fontFamily: 'Arial',
          fill: '#000000',
          stroke: 'transparent',
          strokeWidth: 0,
          lineHeight: 1.3,
          letterSpacing: 0,
        };

        const adjustedY = y + (height * 0.1);

        // Determine if this should be single line or multi-line text
        const useSingleLine = shouldUseSingleLine(detectedText, canvasWidth, canvasHeight);
        
        let textObj;
        
        if (useSingleLine) {
          // Use IText for single-line text (no automatic wrapping)
          textObj = new IText(detectedText.text, {
            left: x,
            top: adjustedY,
            fontSize: style.fontSize,
            fill: style.fill,
            stroke: style.stroke,
            strokeWidth: style.strokeWidth,
            fontFamily: style.fontFamily,
            fontWeight: style.fontWeight,
            charSpacing: style.letterSpacing,
            selectable: currentTool === "select",
            evented: currentTool === "select",
            padding: 3,
            transparentCorners: false,
            cornerColor: '#0066cc',
            cornerStrokeColor: '#0066cc',
            borderColor: '#0066cc',
            editingBorderColor: '#0066cc',
            editable: true,
            splitByGrapheme: false,
            textAlign: 'left',
            // Prevent line wrapping
            splitByGrapheme: false,
          });
        } else {
          // Use Textbox for multi-line text with proper width
          const estimatedTextWidth = estimateTextWidth(
            detectedText.text, 
            style.fontSize, 
            style.fontFamily, 
            style.fontWeight
          );
          
          // Use a more generous width to prevent unnecessary wrapping
          const textWidth = Math.max(width, estimatedTextWidth * 1.1, 100);
          
          textObj = new Textbox(detectedText.text, {
            left: x,
            top: adjustedY,
            width: textWidth,
            fontSize: style.fontSize,
            fill: style.fill,
            stroke: style.stroke,
            strokeWidth: style.strokeWidth,
            fontFamily: style.fontFamily,
            fontWeight: style.fontWeight,
            lineHeight: style.lineHeight,
            charSpacing: style.letterSpacing,
            selectable: currentTool === "select",
            evented: currentTool === "select",
            padding: 3,
            transparentCorners: false,
            cornerColor: '#0066cc',
            cornerStrokeColor: '#0066cc',
            borderColor: '#0066cc',
            editingBorderColor: '#0066cc',
            editable: true,
            splitByGrapheme: false,
            textAlign: 'left',
            // Additional properties to control wrapping
            minWidth: textWidth,
            dynamicMinWidth: true,
          });
        }

        // Add metadata
        (textObj as any).isDetectedText = true;
        (textObj as any).originalBbox = detectedText.bbox;
        (textObj as any).detectedStyle = style;
        (textObj as any).confidence = detectedText.confidence;
        (textObj as any).isSingleLine = useSingleLine;

        canvas.add(textObj);
      });

      canvas.renderAll();
      
      // Log detection results
      console.log(`Added ${detectedTexts.length} text objects:`, 
        detectedTexts.map(t => ({
          text: t.text,
          singleLine: shouldUseSingleLine(t, canvasWidth, canvasHeight)
        }))
      );
      
    }, [detectedTexts, currentTool, isAnalyzing]);

    // Handle canvas clicks for text tool
    useEffect(() => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const handleCanvasClick = (e: any) => {
        if (currentTool === "text" && e.pointer) {
          // Always use IText for manually added text to prevent unwanted wrapping
          const textObj = new IText('Click to edit', {
            left: e.pointer.x - 50,
            top: e.pointer.y - 10,
            fontSize: fontOptions.fontSize,
            fill: fontOptions.color,
            stroke: fontOptions.strokeColor,
            strokeWidth: fontOptions.strokeWidth,
            fontFamily: fontOptions.fontFamily,
            fontWeight: fontOptions.fontWeight,
            selectable: true,
            evented: true,
            padding: 4,
            transparentCorners: false,
            cornerColor: '#0066cc',
            cornerStrokeColor: '#0066cc',
            borderColor: '#0066cc',
            editingBorderColor: '#0066cc',
            editable: true,
            splitByGrapheme: false,
            textAlign: fontOptions.textAlign as any,
            charSpacing: 0,
          });

          canvas.add(textObj);
          canvas.setActiveObject(textObj);
          
          setTimeout(() => {
            if (canvas && !canvas.isDestroyed) {
              textObj.enterEditing();
              textObj.hiddenTextarea?.focus();
            }
          }, 100);
          
          canvas.renderAll();
          toast("Text added! Double-click to edit, drag to move");
        }
      };

      canvas.on('mouse:down', handleCanvasClick);
      return () => {
        if (canvas && !canvas.isDestroyed) {
          canvas.off('mouse:down', handleCanvasClick);
        }
      };
    }, [currentTool, fontOptions]);

    // Update text style when font options change
    useEffect(() => {
      const canvas = fabricCanvasRef.current;
      if (!canvas || !selectedObject) return;

      if (selectedObject && (selectedObject.type === 'textbox' || selectedObject.type === 'i-text')) {
        selectedObject.set({
          fontFamily: fontOptions.fontFamily,
          fontSize: fontOptions.fontSize,
          fontWeight: fontOptions.fontWeight,
          fill: fontOptions.color,
          stroke: fontOptions.strokeColor,
          strokeWidth: fontOptions.strokeWidth,
          textAlign: fontOptions.textAlign,
        });
        canvas.renderAll();
      }
    }, [fontOptions, selectedObject]);

    const performStyleAnalysis = async () => {
      if (!analyzeTextsWithStyles || !fabricCanvasRef.current || !backgroundImage || !detectedTexts.length) return;

      setIsAnalyzing(true);
      try {
        const analyzedTexts = await analyzeTextsWithStyles(
          detectedTexts,
          backgroundImage,
          fabricCanvasRef.current.width || 800,
          fabricCanvasRef.current.height || 600
        );
        toast(`Re-analyzed ${analyzedTexts.length} text regions`);
      } catch (error) {
        console.error('Style analysis failed:', error);
        toast.error('Failed to analyze text styles');
      } finally {
        setIsAnalyzing(false);
      }
    };

    const handleFontChange = (property: keyof TextStyleInfo, value: any) => {
      setFontOptions(prev => ({ ...prev, [property]: value }));
    };

    const copyStyleFromSelected = () => {
      if (selectedObject && (selectedObject as any).detectedStyle) {
        const style = (selectedObject as any).detectedStyle;
        setFontOptions({
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          color: style.fill,
          strokeColor: style.stroke,
          strokeWidth: style.strokeWidth,
          textAlign: selectedObject.textAlign || 'left',
        });
        toast("Style copied from selected text!");
      }
    };

    const availableFonts = [
      'Arial',
      'Arial Black',
      'Courier New',
      'Georgia',
      'Impact',
      'Times New Roman',
      'Trebuchet MS',
      'Verdana',
      'Helvetica',
      'Comic Sans MS',
      'Lucida Sans Unicode',
      'Palatino Linotype'
    ];

    const hasSelectedText = selectedObject && (selectedObject.type === 'textbox' || selectedObject.type === 'i-text');
    const hasDetectedStyle = hasSelectedText && (selectedObject as any).detectedStyle;
    const isSelectedTextSingleLine = hasSelectedText && (selectedObject as any).isSingleLine;

    return (
      <div className="flex gap-4">
        <div className="flex-1 space-y-4">
          <div className="flex justify-center">
            <div className="relative border border-border rounded-lg overflow-hidden shadow-tool">
              {(isLoading || isAnalyzing) && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm text-muted-foreground">
                      {isLoading ? "Loading image..." : "Analyzing text styles..."}
                    </p>
                  </div>
                </div>
              )}
              <canvas ref={canvasRef} className="max-w-full" />
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground space-y-1">
            {currentTool === "select" && (
              <div>
                <p>Select and edit text objects</p>
                <p className="text-xs">Double-click to edit text, drag to move</p>
              </div>
            )}
            {currentTool === "text" && (
              <div>
                <p>Click on the canvas to add new text</p>
                <p className="text-xs">New text will use current style settings</p>
              </div>
            )}
          </div>

          {analyzeTextsWithStyles && (
            <div className="flex justify-center gap-2">
              <button
                onClick={performStyleAnalysis}
                disabled={!detectedTexts.length || isAnalyzing}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isAnalyzing ? "Analyzing..." : "Re-analyze Styles"}
              </button>
            </div>
          )}
        </div>

        <div className={`w-64 p-4 bg-background border border-border rounded-lg shadow-tool transition-opacity ${hasSelectedText ? 'opacity-100' : 'opacity-50'}`}>
          <h3 className="font-medium mb-4">
            Text Properties
            {!hasSelectedText && (
              <span className="text-xs text-muted-foreground block">Select text to edit</span>
            )}
          </h3>
          
          {hasDetectedStyle && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Detected Style</h4>
              <div className="text-xs text-blue-600 space-y-1">
                <div>Confidence: {(selectedObject as any).confidence}%</div>
                <div>Font: {(selectedObject as any).detectedStyle.fontFamily}</div>
                <div>Size: {(selectedObject as any).detectedStyle.fontSize}px</div>
                <div>Weight: {(selectedObject as any).detectedStyle.fontWeight}</div>
                <div>Type: {isSelectedTextSingleLine ? 'Single Line' : 'Multi-line'}</div>
              </div>
              <button
                onClick={copyStyleFromSelected}
                className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
              >
                Copy Style
              </button>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Font Family</label>
              <select
                value={fontOptions.fontFamily}
                onChange={(e) => handleFontChange('fontFamily', e.target.value)}
                className="w-full p-2 border rounded text-sm text-black"
                disabled={!hasSelectedText}
              >
                {availableFonts.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Font Size</label>
              <input
                type="number"
                value={fontOptions.fontSize}
                onChange={(e) => handleFontChange('fontSize', parseInt(e.target.value))}
                className="w-full p-2 border rounded text-sm text-black"
                min="8"
                max="72"
                disabled={!hasSelectedText}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Font Weight</label>
              <select
                value={fontOptions.fontWeight}
                onChange={(e) => handleFontChange('fontWeight', e.target.value)}
                className="w-full p-2 border rounded text-sm text-black"
                disabled={!hasSelectedText}
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Text Color</label>
              <input
                type="color"
                value={fontOptions.color}
                onChange={(e) => handleFontChange('color', e.target.value)}
                className="w-full h-10 text-black"
                disabled={!hasSelectedText}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Stroke Color</label>
              <input
                type="color"
                value={fontOptions.strokeColor}
                onChange={(e) => handleFontChange('strokeColor', e.target.value)}
                className="w-full h-10 text-black"
                disabled={!hasSelectedText}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Stroke Width</label>
              <input
                type="range"
                value={fontOptions.strokeWidth}
                onChange={(e) => handleFontChange('strokeWidth', parseFloat(e.target.value))}
                className="w-full text-black"
                min="0"
                max="2"
                step="0.1"
                disabled={!hasSelectedText}
              />
              <div className="text-xs text-muted-foreground">{fontOptions.strokeWidth}px</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Text Alignment</label>
              <div className="flex gap-2">
                {['left', 'center', 'right'].map(align => (
                  <button
                    key={align}
                    onClick={() => handleFontChange('textAlign', align)}
                    className={`p-2 border rounded text-sm flex-1 transition-colors ${
                      fontOptions.textAlign === align 
                        ? 'bg-primary text-white' 
                        : 'bg-background hover:bg-gray-50'
                    } ${!hasSelectedText ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!hasSelectedText}
                  >
                    {align.charAt(0).toUpperCase() + align.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {!hasSelectedText && (
              <div className="text-xs text-muted-foreground p-2 bg-gray-50 rounded">
                These settings will be used for new text when using the Text tool.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

TextCanvas.displayName = "TextCanvas";