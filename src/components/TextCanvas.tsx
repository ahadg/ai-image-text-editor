import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Canvas as FabricCanvas, Textbox, FabricImage, IText, Object, Group, Path, Circle, Shadow } from "fabric";
import { toast } from "sonner";
import { DetectedText } from "./PhotoTextEditor";
import { FiEdit2, FiImage, FiType, FiMove, FiCopy, FiDownload, FiRefreshCw, FiInfo, FiAlignLeft, FiAlignCenter, FiAlignRight } from "react-icons/fi";
import { TbTextSize, TbBorderOuter } from "react-icons/tb";
import { IoColorFillOutline, IoTextOutline } from "react-icons/io5";

interface TextCanvasProps {
  backgroundImage: string;
  detectedTexts: DetectedText[];
  currentTool: "select" | "text" | "move";
  onCanvasReady: (canvas: FabricCanvas) => void;
  onTextEdit: (originalText: string, newText: string) => void;
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

interface EditIcon extends Object {
  originalTextObject?: IText | Textbox;
}

export const TextCanvas = forwardRef<any, TextCanvasProps>(
  ({ backgroundImage, detectedTexts, currentTool, onCanvasReady, onTextEdit, analyzeTextsWithStyles }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<FabricCanvas | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [imageScale, setImageScale] = useState(1);
    const [selectedObject, setSelectedObject] = useState<any>(null);
    const [fontOptions, setFontOptions] = useState<TextStyleInfo>({
      fontFamily: 'Inter',
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
          // Hide edit icons before exporting
          canvas.getObjects().forEach(obj => {
            if (obj.type === 'group' && (obj as any).isEditIconGroup) {
              obj.visible = false;
            }
          });
          
          const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2,
          });
          
          // Show edit icons again
          canvas.getObjects().forEach(obj => {
            if (obj.type === 'group' && (obj as any).isEditIconGroup) {
              obj.visible = true;
            }
          });
          
          canvas.renderAll();
          
          const link = document.createElement('a');
          link.download = 'edited-image.png';
          link.href = dataURL;
          link.click();
          
          toast.success("Image exported successfully!");
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

    // Create a better edit icon for a text object
    const createEditIcon = (textObject: IText | Textbox): Group => {
      const iconSize = 16;
      const padding = 6;
      
      // Create a simple pencil icon using SVG path
      const pencilIcon = new Path('M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z', {
        left: 0,
        top: 0,
        scaleX: 0.7,
        scaleY: 0.7,
        fill: '#ffffff',
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
      });
      
      // Create a subtle background circle
      const background = new Circle({
        radius: iconSize / 2,
        fill: '#3b82f6',
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
        shadow: new Shadow({
          color: 'rgba(0, 0, 0, 0.2)',
          blur: 3,
          offsetX: 0,
          offsetY: 1,
        })
      });
      
      // Group the icon elements
      const iconGroup = new Group([background, pencilIcon], {
        left: (textObject.left || 0) + (textObject.width || 0) + padding,
        top: (textObject.top || 0) + ((textObject.height || 0) / 2),
        hasControls: false,
        hasBorders: false,
        selectable: false,
        evented: true,
        isEditIconGroup: true,
        originalTextObject: textObject,
        hoverCursor: 'pointer',
      });
      
      return iconGroup;
    };

    // Initialize canvas
    useEffect(() => {
      if (!canvasRef.current || fabricCanvasRef.current) return;

      const canvas = new FabricCanvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: '#f8fafc',
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
            fontFamily: activeObject.fontFamily || 'Inter',
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
      
      // Handle edit icon clicks
      const handleMouseDown = (e: any) => {
        if (e.target && e.target.isEditIconGroup) {
          const textObject = e.target.originalTextObject;
          if (textObject) {
            canvas.setActiveObject(textObject);
            textObject.enterEditing();
            textObject.hiddenTextarea?.focus();
          }
          e.e.stopPropagation();
        }
      };

      canvas.on('selection:created', handleSelection);
      canvas.on('selection:updated', handleSelection);
      canvas.on('selection:cleared', () => setSelectedObject(null));
      canvas.on('object:modified', handleObjectModified);
      canvas.on('mouse:dblclick', handleDoubleClick);
      canvas.on('mouse:down', handleMouseDown);

      return () => {
        if (canvas && !canvas.isDestroyed) {
          canvas.off('selection:created', handleSelection);
          canvas.off('selection:updated', handleSelection);
          canvas.off('object:modified', handleObjectModified);
          canvas.off('mouse:dblclick', handleDoubleClick);
          canvas.off('mouse:down', handleMouseDown);
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
        toast.success("Image loaded successfully!");
      }).catch((error) => {
        console.error('Error loading image:', error);
        toast.error("Failed to load image");
        setIsLoading(false);
      });
    }, [backgroundImage]);

    // Add detected texts to canvas with edit icons
    useEffect(() => {
      const canvas = fabricCanvasRef.current;
      if (!canvas || !detectedTexts.length || isAnalyzing) return;

      // Remove existing text objects and their edit icons
      const objectsToRemove = canvas.getObjects().filter(obj => 
        (obj.type === 'textbox' || obj.type === 'i-text' || 
         (obj.type === 'group' && (obj as any).isEditIconGroup)) && 
        (obj as any).isDetectedText
      );
      objectsToRemove.forEach(obj => canvas.remove(obj));

      const canvasWidth = canvas.width!;
      const canvasHeight = canvas.height!;

      // Add new text objects with edit icons
      detectedTexts.forEach((detectedText) => {
        const x = (detectedText.bbox.x0 / 100) * canvasWidth;
        const y = (detectedText.bbox.y0 / 100) * canvasHeight;
        const width = Math.max(((detectedText.bbox.x1 - detectedText.bbox.x0) / 100) * canvasWidth, 50);
        const height = ((detectedText.bbox.y1 - detectedText.bbox.y0) / 100) * canvasHeight;

        const style = detectedText.style || {
          fontSize: 16,
          fontWeight: 'normal',
          fontFamily: 'Inter',
          fill: '#000000',
          stroke: 'transparent',
          strokeWidth: 0,
          lineHeight: 1.3,
          letterSpacing: 0,
        };

        const adjustedY = y + (height * 0.1);

        // Create text object
        const textObj = new IText(detectedText.text, {
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
          cornerColor: '#3b82f6',
          cornerStrokeColor: '#3b82f6',
          borderColor: '#3b82f6',
          editingBorderColor: '#3b82f6',
          cornerStyle: 'circle',
          cornerSize: 8,
          editable: true,
          splitByGrapheme: false,
          textAlign: 'left',
        });

        // Add metadata
        (textObj as any).isDetectedText = true;
        (textObj as any).originalBbox = detectedText.bbox;
        (textObj as any).detectedStyle = style;
        (textObj as any).confidence = detectedText.confidence;
        (textObj as any).originalText = detectedText.text;

        canvas.add(textObj);
        
        // Create and add edit icon
        const editIcon = createEditIcon(textObj);
        canvas.add(editIcon);
        
        // Link the text object to its edit icon
        (textObj as any).editIcon = editIcon;
      });

      canvas.renderAll();
      
      console.log(`Added ${detectedTexts.length} text objects with edit icons`);
      
    }, [detectedTexts, currentTool, isAnalyzing]);

    // Handle text object modifications to update edit icon position
    useEffect(() => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const handleObjectModified = (e: any) => {
        const modifiedObject = e.target;
        
        // If a text object was modified and has an edit icon, update the icon position
        if (modifiedObject && (modifiedObject.type === 'textbox' || modifiedObject.type === 'i-text') && 
            modifiedObject.editIcon) {
          const padding = 6;
          modifiedObject.editIcon.set({
            left: (modifiedObject.left || 0) + (modifiedObject.width || 0) + padding,
            top: (modifiedObject.top || 0) + ((modifiedObject.height || 0) / 2),
          });
          canvas.renderAll();
          
          // Notify parent component about text edit
          if (modifiedObject.originalText && onTextEdit) {
            onTextEdit(modifiedObject.originalText, modifiedObject.text);
          }
        }
      };

      canvas.on('object:modified', handleObjectModified);
      
      return () => {
        if (canvas && !canvas.isDestroyed) {
          canvas.off('object:modified', handleObjectModified);
        }
      };
    }, [onTextEdit]);

    // Handle canvas clicks for text tool
    useEffect(() => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const handleCanvasClick = (e: any) => {
        if (currentTool === "text" && e.pointer) {
          // Create new text object
          const textObj = new IText('Double click to edit', {
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
            cornerColor: '#3b82f6',
            cornerStrokeColor: '#3b82f6',
            borderColor: '#3b82f6',
            editingBorderColor: '#3b82f6',
            cornerStyle: 'circle',
            cornerSize: 8,
            editable: true,
            splitByGrapheme: false,
            textAlign: fontOptions.textAlign as any,
            charSpacing: 0,
          });

          canvas.add(textObj);
          
          // Create edit icon for the new text
          const editIcon = createEditIcon(textObj);
          canvas.add(editIcon);
          
          // Link the text object to its edit icon
          (textObj as any).editIcon = editIcon;
          
          canvas.setActiveObject(textObj);
          canvas.renderAll();
          
          toast.info("Text added! Double-click or use the edit icon to edit");
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
        toast.success(`Re-analyzed ${analyzedTexts.length} text regions`);
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
        toast.success("Style copied from selected text!");
      }
    };

    const availableFonts = [
      'Inter',
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

    return (
      <div className="flex flex-col lg:flex-row gap-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 space-y-4">
          <div className="flex justify-center">
            <div className="relative border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg bg-white">
              {(isLoading || isAnalyzing) && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
                  <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm text-gray-600 font-medium">
                      {isLoading ? "Loading image..." : "Analyzing text styles..."}
                    </p>
                  </div>
                </div>
              )}
              <div className="p-3 bg-gray-100 border-b flex items-center justify-between text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <FiImage className="h-4 w-4" />
                  Canvas - {currentTool === "select" ? "Select Mode" : currentTool === "text" ? "Text Mode" : "Move Mode"}
                </span>
                <span className="text-xs bg-gray-200 px-2 py-1 rounded">{fabricCanvasRef.current?.width} × {fabricCanvasRef.current?.height} px</span>
              </div>
              <canvas ref={canvasRef} className="max-w-full block mx-auto" />
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-600 space-y-2 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            {currentTool === "select" && (
              <div>
                <p className="font-medium text-gray-800 flex items-center justify-center gap-2"><FiType className="h-4 w-4" /> Select and Edit Text</p>
                <p className="text-xs mt-1">Click text to select, then use the properties panel to edit</p>
                <p className="text-xs mt-1 flex items-center justify-center gap-1">
                  <span className="inline-flex items-center justify-center w-4 h-4 bg-blue-100 text-blue-600 rounded-full text-xs"><FiEdit2 className="h-3 w-3" /></span>
                  Double-click or use the edit icon to modify text content
                </p>
              </div>
            )}
            {currentTool === "text" && (
              <div>
                <p className="font-medium text-gray-800 flex items-center justify-center gap-2"><IoTextOutline className="h-4 w-4" /> Add New Text</p>
                <p className="text-xs mt-1">Click anywhere on the canvas to add text</p>
                <p className="text-xs mt-1">New text will use the current style settings</p>
              </div>
            )}
            {currentTool === "move" && (
              <div>
                <p className="font-medium text-gray-800 flex items-center justify-center gap-2"><FiMove className="h-4 w-4" /> Move Objects</p>
                <p className="text-xs mt-1">Click and drag to move text elements</p>
              </div>
            )}
          </div>

          {analyzeTextsWithStyles && (
            <div className="flex justify-center">
              <button
                onClick={performStyleAnalysis}
                disabled={!detectedTexts.length || isAnalyzing}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <FiRefreshCw className="h-4 w-4" />
                    <span>Re-analyze Text Styles</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className={`w-full lg:w-80 bg-white border border-gray-200 rounded-xl shadow-lg transition-all ${hasSelectedText ? 'opacity-100' : 'opacity-70'}`}>
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <FiType className="h-5 w-5 text-blue-500" />
              Text Properties
            </h3>
            {!hasSelectedText && (
              <p className="text-xs text-gray-500 mt-1">Select a text element to edit its properties</p>
            )}
          </div>
          
          <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto space-y-5">
            {hasDetectedStyle && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1">
                  <FiInfo className="h-4 w-4" />
                  Detected Style
                </h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <div className="flex justify-between">
                    <span>Confidence:</span>
                    <span className="font-medium">{(selectedObject as any).confidence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Font:</span>
                    <span className="font-medium">{(selectedObject as any).detectedStyle.fontFamily}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span className="font-medium">{(selectedObject as any).detectedStyle.fontSize}px</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weight:</span>
                    <span className="font-medium">{(selectedObject as any).detectedStyle.fontWeight}</span>
                  </div>
                </div>
                <button
                  onClick={copyStyleFromSelected}
                  className="mt-3 w-full px-3 py-2 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-1 shadow-sm"
                >
                  <FiCopy className="h-3.5 w-3.5" />
                  Copy This Style
                </button>
              </div>
            )}
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FiType className="h-4 w-4 text-gray-400" />
                  Font Family
                </label>
                <select
                  value={fontOptions.fontFamily}
                  onChange={(e) => handleFontChange('fontFamily', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                  disabled={!hasSelectedText}
                >
                  {availableFonts.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <TbTextSize className="h-4 w-4 text-gray-400" />
                  Font Size
                </label>
                <input
                  type="number"
                  value={fontOptions.fontSize}
                  onChange={(e) => handleFontChange('fontSize', parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                  min="8"
                  max="72"
                  disabled={!hasSelectedText}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <TbTextSize className="h-4 w-4 text-gray-400" />
                  Font Weight
                </label>
                <select
                  value={fontOptions.fontWeight}
                  onChange={(e) => handleFontChange('fontWeight', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                  disabled={!hasSelectedText}
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="600">Semi Bold</option>
                  <option value="800">Extra Bold</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <IoColorFillOutline className="h-4 w-4 text-gray-400" />
                    Text Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={fontOptions.color}
                      onChange={(e) => handleFontChange('color', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border border-gray-300 shadow-sm"
                      disabled={!hasSelectedText}
                    />
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">{fontOptions.color}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <TbBorderOuter className="h-4 w-4 text-gray-400" />
                    Stroke Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={fontOptions.strokeColor}
                      onChange={(e) => handleFontChange('strokeColor', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border border-gray-300 shadow-sm"
                      disabled={!hasSelectedText}
                    />
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">{fontOptions.strokeColor === 'transparent' ? 'None' : fontOptions.strokeColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <TbBorderOuter className="h-4 w-4 text-gray-400" />
                  Stroke Width: <span className="text-blue-600 font-medium">{fontOptions.strokeWidth}px</span>
                </label>
                <input
                  type="range"
                  value={fontOptions.strokeWidth}
                  onChange={(e) => handleFontChange('strokeWidth', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                  min="0"
                  max="2"
                  step="0.1"
                  disabled={!hasSelectedText}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>None</span>
                  <span>Thin</span>
                  <span>Thick</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FiAlignLeft className="h-4 w-4 text-gray-400" />
                  Text Alignment
                </label>
                <div className="flex gap-2">
                  {[
                    {value: 'left', icon: <FiAlignLeft className="h-4 w-4" />, label: 'Left'},
                    {value: 'center', icon: <FiAlignCenter className="h-4 w-4" />, label: 'Center'},
                    {value: 'right', icon: <FiAlignRight className="h-4 w-4" />, label: 'Right'},
                  ].map(align => (
                    <button
                      key={align.value}
                      onClick={() => handleFontChange('textAlign', align.value)}
                      className={`p-3 border rounded-lg text-sm flex-1 transition-all flex flex-col items-center justify-center ${
                        fontOptions.textAlign === align.value 
                          ? 'bg-blue-500 text-white border-blue-500 shadow-sm' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      } ${!hasSelectedText ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      disabled={!hasSelectedText}
                      title={align.label}
                    >
                      {align.icon}
                      <span className="text-xs mt-1">{align.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {!hasSelectedText && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-start gap-2">
                  <FiInfo className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>These settings will be applied to new text when using the Text tool.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

TextCanvas.displayName = "TextCanvas";