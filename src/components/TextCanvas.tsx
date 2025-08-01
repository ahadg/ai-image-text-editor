import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Canvas as FabricCanvas, Textbox, FabricImage, util } from "fabric";
import { toast } from "sonner";
import type { DetectedText } from "./PhotoTextEditor";

interface TextCanvasProps {
  backgroundImage: string;
  detectedTexts: DetectedText[];
  currentTool: "select" | "text" | "move";
}

interface TextStyleInfo {
  fontSize: number;
  fontWeight: string;
  fontFamily: string;
  color: string;
  strokeColor: string;
  strokeWidth: number;
}

export const TextCanvas = forwardRef<any, TextCanvasProps>(
  ({ backgroundImage, detectedTexts, currentTool }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [imageScale, setImageScale] = useState(1);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [selectedObject, setSelectedObject] = useState<any>(null);
    const [fontOptions, setFontOptions] = useState({
      fontFamily: 'Arial',
      fontSize: 16,
      fontWeight: 'normal',
      color: '#000000',
      strokeColor: 'transparent',
      strokeWidth: 0,
      textAlign: 'left',
    });

    useImperativeHandle(ref, () => ({
      exportCanvas: () => {
        if (fabricCanvas) {
          const dataURL = fabricCanvas.toDataURL({
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
        selection: currentTool === "select",
        isDrawingMode: false,
      });

      setFabricCanvas(canvas);

      return () => {
        canvas.dispose();
      };
    }, []);

    // Set up canvas event listeners
    useEffect(() => {
      if (!fabricCanvas) return;

      const handleSelection = () => {
        const activeObject = fabricCanvas.getActiveObject();
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

      const handleObjectModified = () => {
        fabricCanvas.renderAll();
      };

      // Handle double-click for editing
      const handleDoubleClick = (e: any) => {
        const target = e.target;
        if (target && (target.type === 'textbox' || target.type === 'i-text')) {
          target.enterEditing();
          target.hiddenTextarea?.focus();
        }
      };

      fabricCanvas.on('selection:created', handleSelection);
      fabricCanvas.on('selection:updated', handleSelection);
      fabricCanvas.on('selection:cleared', () => setSelectedObject(null));
      fabricCanvas.on('object:modified', handleObjectModified);
      fabricCanvas.on('mouse:dblclick', handleDoubleClick);

      return () => {
        fabricCanvas.off('selection:created', handleSelection);
        fabricCanvas.off('selection:updated', handleSelection);
        fabricCanvas.off('selection:cleared', () => setSelectedObject(null));
        fabricCanvas.off('object:modified', handleObjectModified);
        fabricCanvas.off('mouse:dblclick', handleDoubleClick);
      };
    }, [fabricCanvas]);

    // Update canvas tool mode
    useEffect(() => {
      if (!fabricCanvas) return;

      fabricCanvas.selection = currentTool === "select";
      
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

        const maxWidth = 800;
        const maxHeight = 600;
        const imgWidth = img.width!;
        const imgHeight = img.height!;
        
        // Store original image dimensions
        setImageDimensions({ width: imgWidth, height: imgHeight });
        
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

        fabricCanvas.setDimensions({
          width: canvasWidth,
          height: canvasHeight
        });

        img.scale(scale);
        img.set({
          left: 0,
          top: 0,
          selectable: false,
          evented: false,
        });

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

    // Analyze text style from image region with better coordinate mapping
    const analyzeTextStyle = (detectedText: DetectedText): TextStyleInfo => {
      const canvasWidth = fabricCanvas?.width || 800;
      const canvasHeight = fabricCanvas?.height || 600;
      
      // Convert percentage coordinates to actual canvas coordinates
      const actualWidth = ((detectedText.bbox.x1 - detectedText.bbox.x0) / 100) * canvasWidth;
      const actualHeight = ((detectedText.bbox.y1 - detectedText.bbox.y0) / 100) * canvasHeight;
      
      // More accurate font size estimation based on bounding box height
      // Account for typical text metrics where cap height is about 70% of font size
      const estimatedFontSize = Math.max(Math.round(actualHeight * 0.9), 12);
      
      // Determine likely font characteristics based on text properties
      let fontWeight = 'normal';
      let fontFamily = 'Arial';
      let color = '#000000';
      let strokeColor = 'transparent';
      let strokeWidth = 0;
      
      // High confidence and large text might be bold/headers
      if (detectedText.confidence > 85 && estimatedFontSize > 20) {
        fontWeight = 'bold';
        fontFamily = 'Arial Black';
      }
      
      // Very large text is likely headers
      if (estimatedFontSize > 28) {
        fontWeight = 'bold';
        color = '#333333';
      }
      
      // Medium text
      if (estimatedFontSize >= 16 && estimatedFontSize <= 20) {
        color = '#444444';
      }
      
      // Small text might be captions/fine print
      if (estimatedFontSize < 16) {
        color = '#666666';
        fontFamily = 'Arial';
      }
      
      // Add subtle stroke for better visibility on varied backgrounds
      if (estimatedFontSize < 18) {
        strokeColor = '#ffffff';
        strokeWidth = 0.3;
      }
      
      return {
        fontSize: estimatedFontSize,
        fontWeight,
        fontFamily,
        color,
        strokeColor,
        strokeWidth,
      };
    };

    // Add detected texts to canvas with improved positioning
    useEffect(() => {
      if (!fabricCanvas || !detectedTexts.length) return;

      // Remove existing text objects
      const existingTexts = fabricCanvas.getObjects().filter(obj => 
        (obj.type === 'textbox' || obj.type === 'i-text') && (obj as any).isDetectedText
      );
      existingTexts.forEach(text => fabricCanvas.remove(text));

      const canvasWidth = fabricCanvas.width!;
      const canvasHeight = fabricCanvas.height!;

      // Group texts by similar properties for consistent styling
      const styleGroups = groupTextsByStyle(detectedTexts, canvasWidth, canvasHeight);

      // Add texts with consistent styling per group
      styleGroups.forEach((group, groupIndex) => {
        const baseStyle = analyzeTextStyle(group[0]);
        
        group.forEach((detectedText) => {
          // More accurate coordinate conversion
          const x = (detectedText.bbox.x0 / 100) * canvasWidth;
          const y = (detectedText.bbox.y0 / 100) * canvasHeight;
          const width = Math.max(((detectedText.bbox.x1 - detectedText.bbox.x0) / 100) * canvasWidth, 50);
          const height = ((detectedText.bbox.y1 - detectedText.bbox.y0) / 100) * canvasHeight;

          // Adjust Y position to better align with text baseline
          // Move text down slightly to account for text metrics
          const adjustedY = y + (height * 0.1); // Move down by 10% of height

          // Use Textbox for better editing capabilities
          const textObj = new Textbox(detectedText.text, {
            left: x,
            top: adjustedY,
            width: width,
            fontSize: baseStyle.fontSize,
            fill: baseStyle.color,
            stroke: baseStyle.strokeColor,
            strokeWidth: baseStyle.strokeWidth,
            fontFamily: baseStyle.fontFamily,
            fontWeight: baseStyle.fontWeight,
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
            // Better text rendering
            textAlign: 'left',
            lineHeight: 1.2,
            charSpacing: 0,
          });

          // Mark as detected text for easy identification
          (textObj as any).isDetectedText = true;
          (textObj as any).styleGroup = groupIndex;
          (textObj as any).originalBbox = detectedText.bbox;

          fabricCanvas.add(textObj);
        });
      });

      fabricCanvas.renderAll();
      
      if (detectedTexts.length > 0) {
        toast(`Added ${detectedTexts.length} editable text regions`);
      }
    }, [fabricCanvas, detectedTexts, currentTool]);

    // Handle canvas clicks for text tool
    useEffect(() => {
      if (!fabricCanvas) return;

      const handleCanvasClick = (e: any) => {
        if (currentTool === "text" && e.pointer) {
          const textObj = new Textbox('Click to edit', {
            left: e.pointer.x - 50,
            top: e.pointer.y - 10,
            width: 100,
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
            textAlign: fontOptions.textAlign,
            lineHeight: 1.2,
          });

          fabricCanvas.add(textObj);
          fabricCanvas.setActiveObject(textObj);
          
          // Enter editing mode immediately
          setTimeout(() => {
            textObj.enterEditing();
            textObj.hiddenTextarea?.focus();
          }, 100);
          
          fabricCanvas.renderAll();
          
          toast("Text added! Double-click to edit, drag to move");
        }
      };

      fabricCanvas.on('mouse:down', handleCanvasClick);

      return () => {
        fabricCanvas.off('mouse:down', handleCanvasClick);
      };
    }, [fabricCanvas, currentTool, fontOptions]);

    // Handle text editing
    useEffect(() => {
      if (!fabricCanvas) return;

      const handleTextEditing = () => {
        toast("Editing text - click outside to finish");
      };

      const handleTextEditingExited = () => {
        fabricCanvas.renderAll();
      };

      fabricCanvas.on('text:editing:entered', handleTextEditing);
      fabricCanvas.on('text:editing:exited', handleTextEditingExited);

      return () => {
        fabricCanvas.off('text:editing:entered', handleTextEditing);
        fabricCanvas.off('text:editing:exited', handleTextEditingExited);
      };
    }, [fabricCanvas]);

    // Update text style when font options change
    useEffect(() => {
      if (!fabricCanvas || !selectedObject) return;

      const updateTextStyle = () => {
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
          fabricCanvas.renderAll();
        }
      };

      updateTextStyle();
    }, [fontOptions, fabricCanvas, selectedObject]);

    const handleFontChange = (property: string, value: any) => {
      setFontOptions(prev => ({
        ...prev,
        [property]: value
      }));
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

    return (
      <div className="flex gap-4">
        <div className="flex-1 space-y-4">
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
            {currentTool === "move" && "Drag to move objects around"}
          </div>
        </div>

        {/* Text Properties Panel - Always Visible */}
        <div className={`w-64 p-4 bg-background border border-border rounded-lg shadow-tool transition-opacity ${hasSelectedText ? 'opacity-100' : 'opacity-50'}`}>
          <h3 className="font-medium mb-4">
            Text Properties
            {!hasSelectedText && (
              <span className="text-xs text-muted-foreground block">Select text to edit</span>
            )}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Font Family</label>
              <select
                value={fontOptions.fontFamily}
                onChange={(e) => handleFontChange('fontFamily', e.target.value)}
                className="w-full p-2 border rounded text-sm"
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
                className="w-full p-2 border rounded text-sm"
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
                className="w-full p-2 border rounded text-sm"
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
                className="w-full h-10"
                disabled={!hasSelectedText}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Stroke Color</label>
              <input
                type="color"
                value={fontOptions.strokeColor}
                onChange={(e) => handleFontChange('strokeColor', e.target.value)}
                className="w-full h-10"
                disabled={!hasSelectedText}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Stroke Width</label>
              <input
                type="range"
                value={fontOptions.strokeWidth}
                onChange={(e) => handleFontChange('strokeWidth', parseFloat(e.target.value))}
                className="w-full"
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

// Group texts by similar styling characteristics with improved logic
function groupTextsByStyle(texts: DetectedText[], canvasWidth: number, canvasHeight: number): DetectedText[][] {
  const groups: DetectedText[][] = [];
  const processed = new Set<string>();

  texts.forEach(text => {
    if (processed.has(text.id)) return;

    const height = ((text.bbox.y1 - text.bbox.y0) / 100) * canvasHeight;
    const fontSize = Math.max(Math.round(height * 0.9), 12);
    
    // Find similar texts with improved similarity detection
    const similarTexts = texts.filter(otherText => {
      if (processed.has(otherText.id) || otherText.id === text.id) return false;
      
      const otherHeight = ((otherText.bbox.y1 - otherText.bbox.y0) / 100) * canvasHeight;
      const otherFontSize = Math.max(Math.round(otherHeight * 0.9), 12);
      
      // Group by similar font size, confidence, and proximity
      const sizeDiff = Math.abs(fontSize - otherFontSize);
      const confidenceDiff = Math.abs(text.confidence - otherText.confidence);
      
      // Check if texts are on similar horizontal level (same line/paragraph)
      const yDiff = Math.abs(text.bbox.y0 - otherText.bbox.y0);
      
      return sizeDiff <= 3 && confidenceDiff <= 15 && yDiff <= 5;
    });

    // Add to group
    const group = [text, ...similarTexts];
    group.forEach(t => processed.add(t.id));
    groups.push(group);
  });

  return groups;
}

TextCanvas.displayName = "TextCanvas";