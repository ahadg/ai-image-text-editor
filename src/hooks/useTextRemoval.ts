// hooks/useTextRemoval.ts
import { useState, useCallback } from 'react';
import { TextRemovalService, BoundingBox } from '../services/textRemovalService';
import { toast } from 'sonner';

export interface UseTextRemovalOptions {
  baseUrl?: string;
}

export const useTextRemoval = (options: UseTextRemovalOptions = {}) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isServiceAvailable, setIsServiceAvailable] = useState<boolean | null>(null);
  
  const textRemovalService = new TextRemovalService(options.baseUrl);

  const checkServiceHealth = useCallback(async () => {
    try {
      const available = await textRemovalService.checkHealth();
      setIsServiceAvailable(available);
      
      if (available) {
        console.log('Text removal service is available');
      } else {
        console.warn('Text removal service is not responding');
      }
      
      return available;
    } catch (error) {
      console.error('Service health check error:', error);
      setIsServiceAvailable(false);
      return false;
    }
  }, [textRemovalService]);

  const removeText = useCallback(async (
    imageDataUrl: string,
    bboxes: BoundingBox[]
  ): Promise<string | null> => {
    console.log('removeText called with:', {
      imageDataUrl: imageDataUrl ? `${imageDataUrl.substring(0, 50)}...` : 'null',
      bboxesCount: bboxes?.length || 0,
      bboxes: bboxes
    });

    if (!imageDataUrl) {
      toast.error('No image provided');
      return null;
    }

    if (!bboxes || bboxes.length === 0) {
      toast.error('No text regions to remove');
      return null;
    }

    setIsRemoving(true);
    
    try {
      // Check service availability first
      toast('Checking service availability...');
      const serviceAvailable = await checkServiceHealth();
      
      if (!serviceAvailable) {
        throw new Error('Text removal service is not available. Make sure the Flask server is running on port 5050.');
      }

      toast('Sending image to backend for text removal...');
      
      const cleanedImageDataUrl = await textRemovalService.removeText(
        imageDataUrl,
        bboxes
      );
      
      if (!cleanedImageDataUrl) {
        throw new Error('No result received from service');
      }
      
      toast.success(`Successfully removed text from ${bboxes.length} regions!`);
      return cleanedImageDataUrl;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Text removal failed:', error);
      toast.error(`Text removal failed: ${errorMessage}`);
      return null;
    } finally {
      setIsRemoving(false);
    }
  }, [textRemovalService, checkServiceHealth]);

  return {
    removeText,
    isRemoving,
    isServiceAvailable,
    checkServiceHealth,
  };
};