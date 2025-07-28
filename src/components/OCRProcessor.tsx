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
        // Initialize Tesseract worker
        const worker = await createWorker('eng', 1, {
          logger: m => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        });

        // Process the image
        const { data } = await worker.recognize(imageDataUrl);
        
        // Get image dimensions
        const imgWidth = data.blocks[0]?.bbox?.x1 || 1000;
        const imgHeight = data.blocks[0]?.bbox?.y1 || 1000;
        
        // Convert Tesseract results to our format
        const detectedTexts: DetectedText[] = data.words
          .filter(word => word.confidence > 60) // Filter by confidence
          .map((word, index) => ({
            id: `text-${index}`,
            text: word.text,
            bbox: {
              x0: (word.bbox.x0 / imgWidth) * 100, // Convert to percentage
              y0: (word.bbox.y0 / imgHeight) * 100,
              x1: (word.bbox.x1 / imgWidth) * 100,
              y1: (word.bbox.y1 / imgHeight) * 100,
            },
            confidence: word.confidence,
          }));

        // Group nearby words into text blocks
        const groupedTexts = groupNearbyTexts(detectedTexts);
        
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

// Helper function to group nearby words into text blocks
function groupNearbyTexts(texts: DetectedText[]): DetectedText[] {
  if (texts.length === 0) return [];

  const grouped: DetectedText[] = [];
  const processed = new Set<string>();
  
  texts.forEach((text, index) => {
    if (processed.has(text.id)) return;
    
    const group = [text];
    processed.add(text.id);
    
    // Find nearby texts
    texts.forEach((otherText, otherIndex) => {
      if (index === otherIndex || processed.has(otherText.id)) return;
      
      // Check if texts are on the same line (similar Y coordinates)
      const yDiff = Math.abs(text.bbox.y0 - otherText.bbox.y0);
      const xDistance = Math.abs(text.bbox.x1 - otherText.bbox.x0);
      
      if (yDiff < 2 && xDistance < 5) { // Adjust thresholds as needed
        group.push(otherText);
        processed.add(otherText.id);
      }
    });
    
    // Combine texts in the group
    if (group.length > 1) {
      group.sort((a, b) => a.bbox.x0 - b.bbox.x0); // Sort by X position
      
      const combinedText = group.map(t => t.text).join(' ');
      const minX = Math.min(...group.map(t => t.bbox.x0));
      const minY = Math.min(...group.map(t => t.bbox.y0));
      const maxX = Math.max(...group.map(t => t.bbox.x1));
      const maxY = Math.max(...group.map(t => t.bbox.y1));
      const avgConfidence = group.reduce((sum, t) => sum + t.confidence, 0) / group.length;
      
      grouped.push({
        id: `group-${grouped.length}`,
        text: combinedText,
        bbox: { x0: minX, y0: minY, x1: maxX, y1: maxY },
        confidence: avgConfidence,
      });
    } else {
      grouped.push(text);
    }
  });
  
  return grouped.filter(text => text.text.trim().length > 0);
}