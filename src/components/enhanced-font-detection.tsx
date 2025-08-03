// Enhanced DetectedText interface with style information
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
      fontSize: number;
      fontWeight: string;
      fontFamily: string;
      fill: string;
      stroke: string;
      strokeWidth: number;
      lineHeight: number;
      letterSpacing: number;
    };
  }
  
  // Enhanced font style analyzer with improved pixel sampling
  export class FontStyleAnalyzer {
    private static async getTextColorFromImage(
      imageDataUrl: string,
      bbox: { x0: number; y0: number; x1: number; y1: number },
      canvasWidth: number,
      canvasHeight: number
    ): Promise<{ textColor: string; backgroundColor: string; contrast: number }> {
      return new Promise((resolve) => {
        const image = new Image();
        image.src = imageDataUrl;
        image.crossOrigin = 'Anonymous';
        
        image.onload = () => {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvasWidth;
          tempCanvas.height = canvasHeight;
          const ctx = tempCanvas.getContext('2d')!;
          ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);
  
          const startX = Math.max(0, Math.round((bbox.x0 / 100) * canvasWidth));
          const startY = Math.max(0, Math.round((bbox.y0 / 100) * canvasHeight));
          const width = Math.min(canvasWidth - startX, Math.round(((bbox.x1 - bbox.x0) / 100) * canvasWidth));
          const height = Math.min(canvasHeight - startY, Math.round(((bbox.y1 - bbox.y0) / 100) * canvasHeight));
  
          if (width <= 0 || height <= 0) {
            resolve({ textColor: '#000000', backgroundColor: '#ffffff', contrast: 21 });
            return;
          }
  
          // Sample pixels from text region with improved algorithm
          const imageData = ctx.getImageData(startX, startY, width, height);
          const pixels = imageData.data;
          
          // Collect all colors with their positions
          const colorData: Array<{ r: number; g: number; b: number; x: number; y: number; brightness: number }> = [];
          
          for (let y = 0; y < height; y += 2) { // Sample every 2nd pixel for performance
            for (let x = 0; x < width; x += 2) {
              const i = (y * width + x) * 4;
              const r = pixels[i];
              const g = pixels[i + 1];
              const b = pixels[i + 2];
              const a = pixels[i + 3];
              
              if (a > 200) { // Only consider opaque pixels
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                colorData.push({ r, g, b, x, y, brightness });
              }
            }
          }
  
          if (colorData.length === 0) {
            resolve({ textColor: '#000000', backgroundColor: '#ffffff', contrast: 21 });
            return;
          }
  
          // Sort by brightness to separate text from background
          colorData.sort((a, b) => a.brightness - b.brightness);
          
          // Use edge detection approach - text is usually on edges/borders
          const edgeColors: typeof colorData = [];
          const centerColors: typeof colorData = [];
          
          const centerX = width / 2;
          const centerY = height / 2;
          const edgeThreshold = Math.min(width, height) * 0.3;
          
          colorData.forEach(color => {
            const distanceFromCenter = Math.sqrt(
              Math.pow(color.x - centerX, 2) + Math.pow(color.y - centerY, 2)
            );
            
            if (distanceFromCenter > edgeThreshold || 
                color.x < width * 0.2 || color.x > width * 0.8 ||
                color.y < height * 0.2 || color.y > height * 0.8) {
              edgeColors.push(color);
            } else {
              centerColors.push(color);
            }
          });
  
          let textColor = '#000000';
          let backgroundColor = '#ffffff';
  
          // Strategy 1: If we have clear edge vs center separation
          if (edgeColors.length > 0 && centerColors.length > 0) {
            const edgeAvg = this.getAverageColor(edgeColors);
            const centerAvg = this.getAverageColor(centerColors);
            
            // Text is usually the higher contrast color
            if (Math.abs(edgeAvg.brightness - 128) > Math.abs(centerAvg.brightness - 128)) {
              textColor = `rgb(${edgeAvg.r},${edgeAvg.g},${edgeAvg.b})`;
              backgroundColor = `rgb(${centerAvg.r},${centerAvg.g},${centerAvg.b})`;
            } else {
              textColor = `rgb(${centerAvg.r},${centerAvg.g},${centerAvg.b})`;
              backgroundColor = `rgb(${edgeAvg.r},${edgeAvg.g},${edgeAvg.b})`;
            }
          } else {
            // Strategy 2: Use brightness-based clustering
            const darkColors = colorData.filter(c => c.brightness < 128);
            const lightColors = colorData.filter(c => c.brightness >= 128);
            
            if (darkColors.length > 0 && lightColors.length > 0) {
              const darkAvg = this.getAverageColor(darkColors);
              const lightAvg = this.getAverageColor(lightColors);
              
              // Assume text is the minority color for better contrast
              if (darkColors.length < lightColors.length) {
                textColor = `rgb(${darkAvg.r},${darkAvg.g},${darkAvg.b})`;
                backgroundColor = `rgb(${lightAvg.r},${lightAvg.g},${lightAvg.b})`;
              } else {
                textColor = `rgb(${lightAvg.r},${lightAvg.g},${lightAvg.b})`;
                backgroundColor = `rgb(${darkAvg.r},${darkAvg.g},${darkAvg.b})`;
              }
            } else {
              // Fallback: use the most extreme colors
              const avgColor = this.getAverageColor(colorData);
              if (avgColor.brightness > 128) {
                textColor = '#000000';
                backgroundColor = `rgb(${avgColor.r},${avgColor.g},${avgColor.b})`;
              } else {
                textColor = `rgb(${avgColor.r},${avgColor.g},${avgColor.b})`;
                backgroundColor = '#ffffff';
              }
            }
          }
  
          // Calculate contrast ratio
          const contrast = this.calculateContrast(textColor, backgroundColor);
          
          // If contrast is too low, adjust colors
          if (contrast < 3) {
            const textBrightness = this.getColorBrightness(textColor);
            if (textBrightness > 128) {
              textColor = '#000000'; // Force dark text
            } else {
              textColor = '#ffffff'; // Force light text
            }
          }
          
          resolve({ textColor, backgroundColor, contrast });
        };
  
        image.onerror = () => {
          resolve({ textColor: '#000000', backgroundColor: '#ffffff', contrast: 21 });
        };
      });
    }
  
    private static getAverageColor(colors: Array<{ r: number; g: number; b: number }>): { r: number; g: number; b: number; brightness: number } {
      if (colors.length === 0) {
        return { r: 0, g: 0, b: 0, brightness: 0 };
      }
  
      const sum = colors.reduce(
        (acc, color) => ({
          r: acc.r + color.r,
          g: acc.g + color.g,
          b: acc.b + color.b,
        }),
        { r: 0, g: 0, b: 0 }
      );
  
      const r = Math.round(sum.r / colors.length);
      const g = Math.round(sum.g / colors.length);
      const b = Math.round(sum.b / colors.length);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
      return { r, g, b, brightness };
    }
  
    private static getColorBrightness(color: string): number {
      const rgb = color.match(/\d+/g);
      if (!rgb) return 0;
      const [r, g, b] = rgb.map(Number);
      return (r * 299 + g * 587 + b * 114) / 1000;
    }
  
    private static calculateContrast(color1: string, color2: string): number {
      const getLuminance = (color: string): number => {
        const rgb = color.match(/\d+/g);
        if (!rgb) return 0;
        
        const [r, g, b] = rgb.map(c => {
          const normalized = parseInt(c) / 255;
          return normalized <= 0.03928 
            ? normalized / 12.92 
            : Math.pow((normalized + 0.055) / 1.055, 2.4);
        });
        
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
  
      const l1 = getLuminance(color1);
      const l2 = getLuminance(color2);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      
      return (lighter + 0.05) / (darker + 0.05);
    }
  
    private static detectFontWeight(
      text: string,
      fontSize: number,
      confidence: number,
      contrast: number,
      bbox: { x0: number; y0: number; x1: number; y1: number }
    ): string {
      // Multiple heuristics for font weight detection
      const bboxWidth = bbox.x1 - bbox.x0;
      const bboxHeight = bbox.y1 - bbox.y0;
      const aspectRatio = bboxWidth / bboxHeight;
      
      // Header detection (large size, high confidence)
      if (fontSize > 24 && confidence > 80) return 'bold';
      
      // Wide aspect ratio with good contrast often indicates bold
      if (aspectRatio > 8 && contrast > 3) return 'bold';
      
      // All caps text is often bold
      if (text === text.toUpperCase() && text.length > 2 && fontSize > 14) return 'bold';
      
      // High contrast small text might be bold for readability
      if (fontSize < 16 && contrast > 7) return 'bold';
      
      // Short text with high confidence might be headers/labels
      if (text.length < 10 && confidence > 85 && fontSize > 16) return 'bold';
      
      return 'normal';
    }
  
    private static detectFontFamily(
      text: string,
      fontSize: number,
      confidence: number,
      bbox: { x0: number; y0: number; x1: number; y1: number }
    ): string {
      const bboxWidth = bbox.x1 - bbox.x0;
      const bboxHeight = bbox.y1 - bbox.y0;
      const charWidth = bboxWidth / Math.max(text.length, 1);
      const aspectRatio = charWidth / Math.max(bboxHeight, 1);
      
      // Monospace detection (consistent character width)
      if (aspectRatio > 0.45 && aspectRatio < 0.8 && text.length > 3) {
        return 'Courier New';
      }
      
      // Sans-serif for small, high-confidence text (UI elements)
      if (fontSize < 16 && confidence > 85) {
        return 'Arial';
      }
      
      // Serif for large, readable text (articles, headings)
      if (fontSize > 18 && confidence > 75 && text.length > 5) {
        return 'Georgia';
      }
      
      // Display fonts for very large text
      if (fontSize > 28) {
        return text.length < 8 ? 'Impact' : 'Arial Black';
      }
      
      return 'Arial'; // Default fallback
    }
  
    private static calculateLetterSpacing(
      text: string,
      bbox: { x0: number; y0: number; x1: number; y1: number },
      fontSize: number
    ): number {
      const bboxWidth = bbox.x1 - bbox.x0;
      const expectedWidth = Math.max(text.length, 1) * fontSize * 0.6; // Rough estimate
      const actualWidth = bboxWidth;
      
      // If actual width is much larger than expected, there's likely extra spacing
      const spacingRatio = actualWidth / Math.max(expectedWidth, 1);
      
      if (spacingRatio > 1.4) return 3; // Very loose spacing
      if (spacingRatio > 1.25) return 2; // Loose spacing
      if (spacingRatio > 1.1) return 1; // Normal spacing
      if (spacingRatio < 0.85) return -1; // Tight spacing
      
      return 0; // Default
    }
  
    public static async analyzeTextStyle(
      detectedText: DetectedText,
      imageDataUrl: string,
      canvasWidth: number,
      canvasHeight: number
    ): Promise<DetectedText['style']> {
      try {
        // Calculate basic properties from bounding box
        const bboxHeight = ((detectedText.bbox.y1 - detectedText.bbox.y0) / 100) * canvasHeight;
        const fontSize = Math.max(Math.round(bboxHeight * 0.85), 10);
        
        // Get color information from improved image sampling
        const { textColor, backgroundColor, contrast } = await this.getTextColorFromImage(
          imageDataUrl,
          detectedText.bbox,
          canvasWidth,
          canvasHeight
        );
        
        // Detect font properties using heuristics
        const fontWeight = this.detectFontWeight(
          detectedText.text,
          fontSize,
          detectedText.confidence,
          contrast,
          detectedText.bbox
        );
        
        const fontFamily = this.detectFontFamily(
          detectedText.text,
          fontSize,
          detectedText.confidence,
          detectedText.bbox
        );
        
        const letterSpacing = this.calculateLetterSpacing(
          detectedText.text,
          detectedText.bbox,
          fontSize
        );
        
        // Determine stroke properties for better visibility
        let strokeColor = 'transparent';
        let strokeWidth = 0;
        
        if (contrast < 4) {
          // Low contrast - add stroke for visibility
          const textBrightness = this.getColorBrightness(textColor);
          strokeColor = textBrightness > 128 ? '#000000' : '#ffffff';
          strokeWidth = fontSize < 16 ? 0.5 : fontSize > 24 ? 1.5 : 1;
        }
        
        return {
          fontSize,
          fontWeight,
          fontFamily,
          fill: textColor,
          stroke: strokeColor,
          strokeWidth,
          lineHeight: fontSize < 12 ? 1.5 : fontSize > 24 ? 1.1 : 1.3,
          letterSpacing,
        };
      } catch (error) {
        console.warn(`Error analyzing style for "${detectedText.text}":`, error);
        // Return safe fallback
        return {
          fontSize: 16,
          fontWeight: 'normal',
          fontFamily: 'Arial',
          fill: '#000000',
          stroke: 'transparent',
          strokeWidth: 0,
          lineHeight: 1.3,
          letterSpacing: 0,
        };
      }
    }
  }
  
  // Enhanced OCR processor with better error handling and loading states
  export class EnhancedOCRProcessor {
    public static async processWithStyleDetection(
      imageDataUrl: string,
      detectedTexts: DetectedText[],
      canvasWidth: number,
      canvasHeight: number,
      onProgress?: (processed: number, total: number) => void
    ): Promise<DetectedText[]> {
      if (!detectedTexts || detectedTexts.length === 0) {
        return [];
      }
  
      const enhancedTexts: DetectedText[] = [];
      
      for (let i = 0; i < detectedTexts.length; i++) {
        const text = detectedTexts[i];
        
        try {
          // Report progress
          if (onProgress) {
            onProgress(i, detectedTexts.length);
          }
  
          const style = await FontStyleAnalyzer.analyzeTextStyle(
            text,
            imageDataUrl,
            canvasWidth,
            canvasHeight
          );
          
          enhancedTexts.push({
            ...text,
            style
          });
        } catch (error) {
          console.warn(`Failed to analyze style for text: "${text.text}"`, error);
          // Fallback to safe default style
          enhancedTexts.push({
            ...text,
            style: {
              fontSize: Math.max(12, Math.round(((text.bbox.y1 - text.bbox.y0) / 100) * canvasHeight * 0.8)),
              fontWeight: text.text === text.text.toUpperCase() && text.text.length < 20 ? 'bold' : 'normal',
              fontFamily: 'Arial',
              fill: '#000000',
              stroke: 'transparent',
              strokeWidth: 0,
              lineHeight: 1.3,
              letterSpacing: 0,
            }
          });
        }
      }
      
      // Final progress update
      if (onProgress) {
        onProgress(detectedTexts.length, detectedTexts.length);
      }
      
      return enhancedTexts;
    }
  }
  
  // Enhanced hook with better loading states and error handling
  export const useEnhancedTextAnalysis = () => {
    const analyzeTextsWithStyles = async (
      texts: DetectedText[],
      imageDataUrl: string,
      canvasWidth: number,
      canvasHeight: number,
      onProgress?: (processed: number, total: number) => void
    ): Promise<DetectedText[]> => {
      if (!texts || texts.length === 0) {
        return [];
      }
  
      if (!imageDataUrl || !canvasWidth || !canvasHeight) {
        console.warn('Invalid parameters for style analysis');
        return texts; // Return original texts if parameters are invalid
      }
  
      try {
        return await EnhancedOCRProcessor.processWithStyleDetection(
          imageDataUrl,
          texts,
          canvasWidth,
          canvasHeight,
          onProgress
        );
      } catch (error) {
        console.error('Error in style analysis:', error);
        return texts; // Return original texts on error
      }
    };
    
    return { analyzeTextsWithStyles };
  };