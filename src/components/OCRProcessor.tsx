import { useEffect } from "react";
import { createWorker } from "tesseract.js";
import type { DetectedText } from "./PhotoTextEditor";

interface OCRProcessorProps {
  imageDataUrl: string;
  onComplete: (texts: DetectedText[]) => void;
  onError: () => void;
}

export const OCRProcessor = ({ imageDataUrl, onComplete, onError }: OCRProcessorProps) => {
  useEffect(() => {
    const processOCR = async () => {
      try {
        // Initialize Tesseract worker with better options
        const worker = await createWorker('eng', 1, {
          logger: m => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        });

        // Set better OCR parameters for improved accuracy
        await worker.setParameters({
          tessedit_pageseg_mode: '3', // Fully automatic page segmentation, but no OSD
          tessedit_char_whitelist: '', // Allow all characters
          preserve_interword_spaces: '1',
          tessedit_ocr_engine_mode: '2', // Use LSTM OCR engine mode
        });

        // Process the image
        const { data } = await worker.recognize(imageDataUrl);
        
        // Get actual image dimensions from the image element
        const img = new Image();
        img.src = imageDataUrl;
        
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;
        
        console.log(`Image dimensions: ${imgWidth}x${imgHeight}`);
        console.log(`Detected ${data.words.length} words`);

        // Convert Tesseract results to our format with better coordinate mapping
        const detectedTexts: DetectedText[] = data.words
          .filter(word => {
            // More lenient filtering for better detection
            const isValidText = word.text && word.text.trim().length > 0;
            const hasGoodConfidence = word.confidence > 50; // Lower threshold
            const hasValidBbox = word.bbox && word.bbox.x1 > word.bbox.x0 && word.bbox.y1 > word.bbox.y0;
            
            return isValidText && hasGoodConfidence && hasValidBbox;
          })
          .map((word, index) => {
            // More accurate coordinate conversion with padding adjustment
            const padding = 0.5; // Add slight padding for better text selection
            const x0 = Math.max(0, ((word.bbox.x0 - padding) / imgWidth) * 100);
            const y0 = Math.max(0, ((word.bbox.y0 - padding) / imgHeight) * 100);
            const x1 = Math.min(100, ((word.bbox.x1 + padding) / imgWidth) * 100);
            const y1 = Math.min(100, ((word.bbox.y1 + padding) / imgHeight) * 100);
            
            return {
              id: `text-${index}`,
              text: word.text.trim(),
              bbox: { x0, y0, x1, y1 },
              confidence: word.confidence,
            };
          });

        console.log(`Filtered to ${detectedTexts.length} valid text regions`);

        // Group nearby words into text blocks with improved algorithm
        const groupedTexts = groupNearbyTexts(detectedTexts, imgWidth, imgHeight);
        
        console.log(`Grouped into ${groupedTexts.length} text blocks`);

        await worker.terminate();
        onComplete(groupedTexts);
      } catch (error) {
        console.error('OCR Error:', error);
        onError();
      }
    };

    processOCR();
  }, [imageDataUrl, onComplete, onError]);

  return null; // This component doesn't render anything
};

// Improved helper function to group nearby words into text blocks
function groupNearbyTexts(texts: DetectedText[], imgWidth: number, imgHeight: number): DetectedText[] {
  if (texts.length === 0) return [];

  const grouped: DetectedText[] = [];
  const processed = new Set<string>();

  // Sort texts by reading order (top to bottom, left to right)
  const sortedTexts = [...texts].sort((a, b) => {
    const yDiff = a.bbox.y0 - b.bbox.y0;
    if (Math.abs(yDiff) < 2) { // Same line threshold
      return a.bbox.x0 - b.bbox.x0; // Left to right
    }
    return yDiff; // Top to bottom
  });

  sortedTexts.forEach((text, index) => {
    if (processed.has(text.id)) return;

    const group = [text];
    processed.add(text.id);

    // Calculate text dimensions for better grouping
    const textWidth = text.bbox.x1 - text.bbox.x0;
    const textHeight = text.bbox.y1 - text.bbox.y0;

    // Find nearby texts that should be grouped together
    sortedTexts.forEach((otherText, otherIndex) => {
      if (index === otherIndex || processed.has(otherText.id)) return;

      const otherWidth = otherText.bbox.x1 - otherText.bbox.x0;
      const otherHeight = otherText.bbox.y1 - otherText.bbox.y0;

      // Check if texts are on the same line (similar Y coordinates and similar heights)
      const yDiff = Math.abs(text.bbox.y0 - otherText.bbox.y0);
      const heightDiff = Math.abs(textHeight - otherHeight);
      const avgHeight = (textHeight + otherHeight) / 2;
      
      // Distance between text regions
      const xDistance = Math.min(
        Math.abs(text.bbox.x1 - otherText.bbox.x0), // Gap between end of first and start of second
        Math.abs(otherText.bbox.x1 - text.bbox.x0)  // Gap between end of second and start of first
      );

      // Improved grouping criteria
      const isSameLine = yDiff < Math.max(avgHeight * 0.4, 1.5); // Y difference less than 40% of average height or 1.5%
      const isSimilarHeight = heightDiff < avgHeight * 0.6; // Height difference less than 60%
      const isNearby = xDistance < Math.max(textWidth, otherWidth) * 1.5; // X distance less than 1.5x width
      const isValidConfidence = Math.abs(text.confidence - otherText.confidence) < 40;

      if (isSameLine && isSimilarHeight && isNearby && isValidConfidence) {
        group.push(otherText);
        processed.add(otherText.id);
      }
    });

    // Process the group
    if (group.length > 1) {
      // Sort group members by X position (left to right)
      group.sort((a, b) => a.bbox.x0 - b.bbox.x0);
      
      // Combine texts with proper spacing
      const combinedText = group.map(t => t.text).join(' ');
      
      // Calculate combined bounding box with better coordinate handling
      const minX = Math.min(...group.map(t => t.bbox.x0));
      const minY = Math.min(...group.map(t => t.bbox.y0));
      const maxX = Math.max(...group.map(t => t.bbox.x1));
      const maxY = Math.max(...group.map(t => t.bbox.y1));
      
      // Calculate weighted average confidence
      const totalChars = group.reduce((sum, t) => sum + t.text.length, 0);
      const avgConfidence = group.reduce((sum, t) => sum + (t.confidence * t.text.length), 0) / totalChars;
      
      grouped.push({
        id: `group-${grouped.length}`,
        text: combinedText,
        bbox: { 
          x0: minX, 
          y0: minY, 
          x1: maxX, 
          y1: maxY 
        },
        confidence: avgConfidence,
      });
    } else {
      // Single text item - apply coordinate refinement
      const refinedText = {
        ...text,
        bbox: {
          x0: Math.max(0, text.bbox.x0),
          y0: Math.max(0, text.bbox.y0),
          x1: Math.min(100, text.bbox.x1),
          y1: Math.min(100, text.bbox.y1),
        }
      };
      grouped.push(refinedText);
    }
  });

  // Final filtering and coordinate validation
  return grouped
    .filter(text => {
      const isValidText = text.text.trim().length > 0;
      const hasValidBounds = text.bbox.x1 > text.bbox.x0 && text.bbox.y1 > text.bbox.y0;
      const isReasonableSize = (text.bbox.x1 - text.bbox.x0) > 0.1 && (text.bbox.y1 - text.bbox.y0) > 0.1;
      return isValidText && hasValidBounds && isReasonableSize;
    })
    .map((text, index) => ({
      ...text,
      id: `final-${index}`, // Reassign IDs for consistency
    }));
}

// Additional utility function for post-processing coordinates
export function adjustCoordinatesForEditing(texts: DetectedText[], adjustmentFactor: number = 1.1): DetectedText[] {
  return texts.map(text => {
    const width = text.bbox.x1 - text.bbox.x0;
    const height = text.bbox.y1 - text.bbox.y0;
    
    // Expand bounding box slightly for better editing experience
    const widthExpansion = (width * (adjustmentFactor - 1)) / 2;
    const heightExpansion = (height * (adjustmentFactor - 1)) / 2;
    
    return {
      ...text,
      bbox: {
        x0: Math.max(0, text.bbox.x0 - widthExpansion),
        y0: Math.max(0, text.bbox.y0 - heightExpansion),
        x1: Math.min(100, text.bbox.x1 + widthExpansion),
        y1: Math.min(100, text.bbox.y1 + heightExpansion),
      }
    };
  });
}