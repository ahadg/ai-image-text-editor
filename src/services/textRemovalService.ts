// services/textRemovalService.ts
export interface BoundingBox {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  }
  
  export class TextRemovalService {
    private baseUrl: string;
  
    constructor(baseUrl: string = 'http://localhost:5050') {
      this.baseUrl = baseUrl;
    }
  
    /**
     * Convert data URL to Blob
     */
    private dataURLToBlob(dataURL: string): Blob {
      const arr = dataURL.split(',');
      const mime = arr[0].match(/:(.*?);/)![1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    }
  
    /**
     * Convert percentage-based bounding boxes to pixel coordinates
     */
    private convertBboxesToPixels(
      bboxes: BoundingBox[],
      imageWidth: number,
      imageHeight: number
    ): Array<[number, number, number, number]> {
      return bboxes.map(bbox => {
        const x0 = Math.round((bbox.x0 / 100) * imageWidth);
        const y0 = Math.round((bbox.y0 / 100) * imageHeight);
        const x1 = Math.round((bbox.x1 / 100) * imageWidth);
        const y1 = Math.round((bbox.y1 / 100) * imageHeight);
        
        console.log(`Converting bbox: ${bbox.x0}%, ${bbox.y0}%, ${bbox.x1}%, ${bbox.y1}% 
                    to pixels: ${x0}, ${y0}, ${x1}, ${y1} 
                    (image: ${imageWidth}x${imageHeight})`);
        
        return [x0, y0, x1, y1];
      });
    }
  
    /**
     * Get image dimensions from data URL
     */
    private getImageDimensions(dataURL: string): Promise<{ width: number; height: number }> {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          console.log(`Image dimensions: ${img.width}x${img.height}`);
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = (error) => {
          console.error('Failed to load image for dimension calculation:', error);
          reject(error);
        };
        img.src = dataURL;
      });
    }
  
    /**
     * Remove text from image using the Flask backend
     */
    async removeText(
      imageDataUrl: string,
      bboxes: BoundingBox[]
    ): Promise<string> {
      try {
        console.log(`Starting text removal for ${bboxes.length} bounding boxes`);
        console.log('Bounding boxes:', bboxes);
        
        // Validate inputs
        if (!imageDataUrl || !imageDataUrl.startsWith('data:')) {
          throw new Error('Invalid image data URL');
        }
        
        if (!bboxes || bboxes.length === 0) {
          throw new Error('No bounding boxes provided');
        }
  
        // Get image dimensions
        const { width, height } = await this.getImageDimensions(imageDataUrl);
        
        // Convert percentage-based bboxes to pixel coordinates
        const pixelBboxes = this.convertBboxesToPixels(bboxes, width, height);
        
        // Validate pixel bboxes
        const validBboxes = pixelBboxes.filter(([x0, y0, x1, y1]) => {
          const isValid = x1 > x0 && y1 > y0 && x0 >= 0 && y0 >= 0 && x1 <= width && y1 <= height;
          if (!isValid) {
            console.warn(`Invalid bbox filtered out: [${x0}, ${y0}, ${x1}, ${y1}]`);
          }
          return isValid;
        });
        
        if (validBboxes.length === 0) {
          throw new Error('No valid bounding boxes after filtering');
        }
        
        console.log(`Using ${validBboxes.length} valid bounding boxes:`, validBboxes);
        
        // Convert data URL to blob
        const imageBlob = this.dataURLToBlob(imageDataUrl);
        console.log(`Image blob size: ${imageBlob.size} bytes, type: ${imageBlob.type}`);
        
        // Create form data
        const formData = new FormData();
        formData.append('image', imageBlob, 'image.jpg');
        formData.append('bboxes', JSON.stringify(validBboxes));
        
        console.log(`Sending request to ${this.baseUrl}/remove-text`);
        
        // Send request to Flask backend
        const response = await fetch(`${this.baseUrl}/remove-text`, {
          method: 'POST',
          body: formData,
        });
        
        console.log(`Response status: ${response.status}`);
        
        if (!response.ok) {
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            try {
              const errorText = await response.text();
              errorMessage = errorText || errorMessage;
            } catch (e2) {
              // Use default error message
            }
          }
          throw new Error(errorMessage);
        }
        
        // Convert response blob to data URL
        const resultBlob = await response.blob();
        console.log(`Received result blob: ${resultBlob.size} bytes, type: ${resultBlob.type}`);
        
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            console.log('Successfully converted result to data URL');
            resolve(reader.result as string);
          };
          reader.onerror = (error) => {
            console.error('Failed to convert result blob to data URL:', error);
            reject(error);
          };
          reader.readAsDataURL(resultBlob);
        });
        
      } catch (error) {
        console.error('Text removal failed:', error);
        throw new Error(`Failed to remove text: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  
    /**
     * Check if the service is available
     */
    async checkHealth(): Promise<boolean> {
      try {
        console.log(`Checking health at ${this.baseUrl}/health`);
        const response = await fetch(`${this.baseUrl}/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        const isHealthy = response.ok;
        console.log(`Health check result: ${isHealthy}`);
        return isHealthy;
      } catch (error) {
        console.error('Health check failed:', error);
        return false;
      }
    }
  }