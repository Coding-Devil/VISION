import { BlipApiResponse } from './types';

export async function processImage(imageData: string): Promise<string> {
  try {
    if (!imageData) {
      throw new Error('No image data provided');
    }

    // Optimize image before processing
    const optimizedImage = await optimizeImage(imageData);
    
    const response = await fetch(
      "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
      {
        headers: {
          Authorization: "Bearer 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",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: optimizedImage,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }

    const result = await response.json() as BlipApiResponse[];
    
    if (!Array.isArray(result) || result.length === 0 || !result[0]?.generated_text) {
      throw new Error('Invalid API response format');
    }

    return result[0].generated_text;
  } catch (error) {
    // Log the full error for debugging
    console.error('Error processing image:', error instanceof Error ? error.message : 'Unknown error');
    return 'Sorry, there was an error processing the image. Please try again.';
  }
}

// Add new function to optimize image
async function optimizeImage(imageData: string): Promise<Uint8Array> {
  // Remove data URL prefix
  const base64Data = imageData.replace(/^data:image\/jpeg;base64,/, '');
  const binaryData = atob(base64Data);
  const bytes = new Uint8Array(binaryData.length);
  
  for (let i = 0; i < binaryData.length; i++) {
    bytes[i] = binaryData.charCodeAt(i);
  }

  // Create temporary canvas for resizing
  const img = new Image();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Wait for image to load
  await new Promise((resolve) => {
    img.onload = resolve;
    img.src = imageData;
  });

  // Resize to smaller dimensions (e.g., 800px max)
  const maxDimension = 800;
  let width = img.width;
  let height = img.height;

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  canvas.width = width;
  canvas.height = height;
  
  // Draw and compress image
  ctx?.drawImage(img, 0, 0, width, height);
  const compressedData = canvas.toDataURL('image/jpeg', 0.8); // 80% quality

  // Convert back to binary
  const optimizedBase64 = compressedData.replace(/^data:image\/jpeg;base64,/, '');
  const optimizedBinary = atob(optimizedBase64);
  const optimizedBytes = new Uint8Array(optimizedBinary.length);
  
  for (let i = 0; i < optimizedBinary.length; i++) {
    optimizedBytes[i] = optimizedBinary.charCodeAt(i);
  }

  return optimizedBytes;
}