import { GoogleGenAI, Modality } from "@google/genai";
import { AspectRatio } from "../types";

const getApiKey = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set.");
  }
  return apiKey;
}

const createAiClient = () => new GoogleGenAI({ apiKey: getApiKey() });

const SYSTEM_PROMPT = `You are an expert AI video editor, enhancer, voice dubber, and UI/UX designer. When the user gives a video or prompt, follow these steps: enhance quality → apply edits/effects → voice dubbing if needed → preview → give final download/export option.

# 🎥 1. VIDEO QUALITY ENHANCEMENT
- Enhance video to 4K / 8K / 16K resolution automatically.
- Improve brightness, contrast, saturation, shadows, highlights, exposure.
- Remove noise, blur, pixelation, low-light grain.
- Stabilize shaky videos.
- Increase FPS to 60/120 FPS using AI frame interpolation.

# 🎬 2. FULL VIDEO EDITING SYSTEM
- Trim, cut, merge, crop, rotate, speed up, slow-motion (AI smooth slow-mo).
- Add professional transitions: fade, motion blur, zoom, glitch, 3D flips.
- Auto detect silences and cut dead parts.
- Auto Scene Detection and split into editable sections.
- Add stickers, emojis, text animations, subtitles.

# 🎭 3. AI OBJECT & SCENE EDITING
- Replace objects: "change car to Ferrari", "add snowfall", etc.
- Remove objects or people (AI object removal).
- Change background (AI + green screen removal even without green screen).
- Face tracking & motion tracking – attach text to moving objects.

# 🗣️ 4. VOICE & AUDIO AI SYSTEM
- AI Voice Dubbing — type or speak → AI sync voice to lips in video.
- Voice cloning (user speaks once → AI copies voice forever).
- Multi-language dubbing + lip sync.
- Remove background noise, wind, traffic, crowd.
- Remove music but keep voice OR remove voice but keep music.
- Generate music or sound effects using AI.

# 🎤 5. AUTO CAPTIONS & TRANSLATION
- Create subtitles automatically from speech.
- Translate subtitles to any language.
- Convert subtitles to voice (Text-to-Speech).
- Export SRT/ASS/VTT files.

# 📁 8. TEMPLATES & PRESETS
- Support for TikTok, Reels, YouTube Shorts templates.
- Apply cinematic LUTs: Teal-Orange, Cyberpunk, Moody Dark Film Look.
- Drag & Drop overlays, filters, transitions.
`;

const ai = createAiClient();

/**
 * Generates an image from a text prompt using Imagen.
 * @param prompt - The text description for the image.
 * @param aspectRatio - The desired aspect ratio for the image.
 * @returns Base64 encoded image string.
 */
export const generateImageFromText = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  const fullPrompt = `${prompt}. Style: realistic, 4k, ultra detail.`;
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: fullPrompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/png',
      aspectRatio: aspectRatio,
    },
  });

  if (!response.generatedImages || response.generatedImages.length === 0) {
    throw new Error("Image generation failed, no images returned.");
  }
  return response.generatedImages[0].image.imageBytes;
};

/**
 * Edits an existing image based on a text prompt.
 * @param prompt - The editing instructions.
 * @param image - The image to edit, in API format.
 * @returns Base64 encoded image string.
 */
export const editImage = async (prompt: string, image: { data: string; mimeType: string }): Promise<string> => {
  const imagePart = {
    inlineData: {
      data: image.data,
      mimeType: image.mimeType,
    },
  };

  const textPart = {
    text: prompt,
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [imagePart, textPart],
    },
// FIX: The `systemInstruction` parameter is not supported for image editing with 'gemini-2.5-flash-image'.
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const imageContent = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
  if (!imageContent || !imageContent.inlineData) {
    throw new Error("Image editing failed. No image data in response.");
  }
  return imageContent.inlineData.data;
};

/**
 * Combines two images based on a text prompt.
 * @param prompt - The combining instructions.
 * @param image1 - The base image.
 * @param image2 - The reference image.
 * @param aspectRatio - The desired aspect ratio for the final image.
 * @returns Base64 encoded image string.
 */
export const combineImages = async (
  prompt: string,
  image1: { data: string; mimeType: string },
  image2: { data: string; mimeType: string },
  aspectRatio: AspectRatio
): Promise<string> => {
  const imagePart1 = {
    inlineData: {
      data: image1.data,
      mimeType: image1.mimeType,
    },
  };

  const imagePart2 = {
    inlineData: {
      data: image2.data,
      mimeType: image2.mimeType,
    },
  };

  const textPart = {
    text: `${prompt}. The final image must have a ${aspectRatio} aspect ratio.`,
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [imagePart1, imagePart2, textPart],
    },
// FIX: The `systemInstruction` parameter is not supported for image editing with 'gemini-2.5-flash-image'.
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const imageContent = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
  if (!imageContent || !imageContent.inlineData) {
    throw new Error("Image combining failed. No image data in response.");
  }
  return imageContent.inlineData.data;
};

/**
 * Enhances an image to a higher resolution.
 * @param image - The image to enhance, in API format.
 * @returns Base64 encoded image string.
 */
export const enhanceImage = async (image: { data: string; mimeType: string }): Promise<string> => {
  const enhancementPrompt = "Enhance this image to 4K resolution. Sharpen all details, improve lighting, and make it ultra-clear. Do not change the original content, composition, or colors. Only improve the quality and resolution.";

  return await editImage(enhancementPrompt, image);
};

/**
 * Creates a thumbnail from an image and a prompt.
 * @param prompt - The instructions for the thumbnail.
 * @param image - The base image for the thumbnail.
 * @param aspectRatio - The desired aspect ratio for the thumbnail.
 * @returns Base64 encoded image string.
 */
export const createThumbnail = async (
  prompt: string,
  image: { data: string; mimeType: string },
  aspectRatio: AspectRatio,
): Promise<string> => {
  const imagePart = {
    inlineData: {
      data: image.data,
      mimeType: image.mimeType,
    },
  };

  const textPart = {
    text: `Create a viral YouTube thumbnail (${aspectRatio} aspect ratio) using the provided image as the main subject. Instructions: ${prompt}`,
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [imagePart, textPart],
    },
// FIX: The `systemInstruction` parameter is not supported for image editing with 'gemini-2.5-flash-image'.
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const imageContent = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
  if (!imageContent || !imageContent.inlineData) {
    throw new Error("Thumbnail generation failed. No image data in response.");
  }
  return imageContent.inlineData.data;
};

/**
 * Generates a video from a text prompt and an optional image.
 * @param prompt The text prompt for the video.
 * @param image Optional starting image.
 * @param aspectRatio The desired aspect ratio for the video.
 * @param duration The desired duration of the video in minutes.
 * @param onProgress Callback to report progress messages.
 * @returns A data URL for the generated video.
 */
export const generateVideoFromPrompt = async (
  prompt: string,
  image: { data: string; mimeType: string } | undefined,
  aspectRatio: AspectRatio,
  duration: number,
  onProgress: (message: string) => void
): Promise<string> => {
  // Create a new client instance for each video call to ensure the latest API key is used.
  const videoAi = createAiClient();

  const imagePayload = image ? {
    imageBytes: image.data,
    mimeType: image.mimeType,
  } : undefined;

  const fullPrompt = `Generate a video, approximately ${duration} minute${duration > 1 ? 's' : ''} long. ${prompt}`;

  onProgress("Sending request to AI...");
  let operation;
  try {
      operation = await videoAi.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: fullPrompt,
        image: imagePayload,
// FIX: The `systemInstruction` parameter is not supported for video generation.
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio
        }
      });
  } catch(e: any) {
    if (e.message.includes("API key not valid")) {
        throw new Error("API key not valid. Please select a new key.");
    }
    throw e;
  }


  onProgress("AI is directing your scene... (this may take a few minutes)");
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await videoAi.operations.getVideosOperation({ operation: operation });
  }

  onProgress("Rendering final frames...");
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("Video generation failed: no download link provided.");
  }
  
  onProgress("Downloading video...");
  const response = await fetch(`${downloadLink}&key=${getApiKey()}`);
  if (!response.ok) {
    if(response.status === 404) {
        throw new Error("API key not valid. Please select a new key.");
    }
    throw new Error(`Failed to download video: ${response.statusText}`);
  }
  
  const videoBlob = await response.blob();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(videoBlob);
  });
};