import React, { useState, useCallback, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ControlPanel } from './components/ControlPanel';
import { MediaDisplay } from './components/ImageDisplay';
import { EditMode, AppView, AspectRatio, Template } from './types';
import { generateImageFromText, editImage, enhanceImage, combineImages, createThumbnail, generateVideoFromPrompt } from './services/geminiService';

type UploadedImage = { file: File; dataUrl: string };

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.PHOTO);
  const [photoMode, setPhotoMode] = useState<EditMode>(EditMode.GENERATE);
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [videoDuration, setVideoDuration] = useState<number>(1);
  const [thumbnailTitle, setThumbnailTitle] = useState<string>('');
  const [thumbnailCloneUrl, setThumbnailCloneUrl] = useState<string>('');
  const [videoPrompt, setVideoPrompt] = useState<string>('');
  const [cartoonPrompt, setCartoonPrompt] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [uploadedImages, setUploadedImages] = useState<{
    image1: UploadedImage | null;
    image2: UploadedImage | null;
  }>({ image1: null, image2: null });
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyError, setApiKeyError] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  const handleImageUpload = (file: File, slot: 'image1' | 'image2') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImages(prev => ({ ...prev, [slot]: { file, dataUrl: e.target?.result as string } }));
    };
    reader.readAsDataURL(file);
  };

  const clearUpload = (slot: 'image1' | 'image2') => {
    setUploadedImages(prev => ({ ...prev, [slot]: null }));
  };
  
  const handleViewChange = (newView: AppView) => {
      setActiveView(newView);
      setPrompt('');
      setThumbnailTitle('');
      setThumbnailCloneUrl('');
      setVideoPrompt('');
      setCartoonPrompt('');
      setSelectedTemplate(null);
      setUploadedImages({ image1: null, image2: null });
      setGeneratedImage(null);
      setGeneratedVideo(null);
      setError(null);
      setApiKeyError(false);
      setVideoDuration(1);

      if (newView === AppView.VIDEO || newView === AppView.CARTOON || newView === AppView.TEMPLATES || newView === AppView.THUMBNAIL) {
        setAspectRatio('16:9');
      } else {
        setAspectRatio('1:1');
      }
  }

  const base64ToApiFormat = (dataUrl: string) => {
    const [header, data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
    return { data, mimeType };
  };

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setApiKeyError(false);
    setGeneratedImage(null);
    setGeneratedVideo(null);

    try {
        if (activeView === AppView.TEMPLATES) {
            if (!selectedTemplate || !prompt) {
                setError('Please select a template and enter a prompt.');
                setIsLoading(false);
                return;
            }
            setLoadingMessage(`Creating your ${selectedTemplate.name}...`);
            const fullPrompt = `${selectedTemplate.stylePrompt}. The video should be about: ${prompt}.`;
            const videoDataUrl = await generateVideoFromPrompt(
                fullPrompt,
                undefined,
                '16:9', // Templates are currently fixed to 16:9
                videoDuration,
                (message) => setLoadingMessage(message)
            );
            setGeneratedVideo(videoDataUrl);

        } else if (activeView === AppView.CARTOON) {
            if (!cartoonPrompt) {
                setError('Please enter a story prompt to generate a cartoon.');
                setIsLoading(false);
                return;
            }
            setLoadingMessage('Directing your cartoon episode...');
            const fullPrompt = `Generate a Pixar-style animated cartoon clip based on this story: ${cartoonPrompt}. The animation should be vibrant, with expressive characters, smooth movement, and cinematic backgrounds.`;
            const videoDataUrl = await generateVideoFromPrompt(
                fullPrompt,
                undefined, 
                aspectRatio,
                videoDuration,
                (message) => setLoadingMessage(message)
            );
            setGeneratedVideo(videoDataUrl);
        } else if (activeView === AppView.VIDEO) {
        if (!videoPrompt) {
          setError('Please enter a prompt to generate a video.');
          setIsLoading(false);
          return;
        }
        setLoadingMessage('Initializing video generation...');
        const imagePayload = uploadedImages.image1 ? base64ToApiFormat(uploadedImages.image1.dataUrl) : undefined;
        
        const videoDataUrl = await generateVideoFromPrompt(
          videoPrompt,
          imagePayload,
          aspectRatio,
          videoDuration,
          (message) => setLoadingMessage(message)
        );
        setGeneratedVideo(videoDataUrl);

      } else if (activeView === AppView.THUMBNAIL) {
        if (!uploadedImages.image1) {
          setError('Please upload an image for the thumbnail.');
          setIsLoading(false);
          return;
        }
        if (!prompt.trim() && !thumbnailTitle.trim()) {
            setError('Please provide a title or instructions.');
            setIsLoading(false);
            return;
        }
        setLoadingMessage('Creating your viral thumbnail...');
        const imagePayload = base64ToApiFormat(uploadedImages.image1.dataUrl);
        
        let fullPrompt = prompt;
        if (thumbnailTitle) {
          fullPrompt = `Title to include: "${thumbnailTitle}". ${fullPrompt}`;
        }
        if (thumbnailCloneUrl) {
          fullPrompt = `Clone the style from this thumbnail: ${thumbnailCloneUrl}. ${fullPrompt}`;
        }
        const resultImage = await createThumbnail(fullPrompt, imagePayload, aspectRatio);
        setGeneratedImage(`data:image/png;base64,${resultImage}`);

      } else if (activeView === AppView.PHOTO) {
          let resultImage: string | null = null;
          switch (photoMode) {
            case EditMode.GENERATE:
              if (!prompt) {
                setError('Please enter a prompt to generate an image.');
                setIsLoading(false);
                return;
              }
              setLoadingMessage('Generating your vision...');
              resultImage = await generateImageFromText(prompt, aspectRatio);
              break;
            case EditMode.EDIT:
              if (!prompt || !uploadedImages.image1) {
                setError('Please upload an image and provide an editing prompt.');
                setIsLoading(false);
                return;
              }
              setLoadingMessage('Applying AI edits...');
              const imagePayloadEdit = base64ToApiFormat(uploadedImages.image1.dataUrl);
              resultImage = await editImage(prompt, imagePayloadEdit);
              break;
            case EditMode.ENHANCE:
              if (!uploadedImages.image1) {
                setError('Please upload an image to enhance.');
                setIsLoading(false);
                return;
              }
              setLoadingMessage('Enhancing to 4K resolution...');
              const imagePayloadEnhance = base64ToApiFormat(uploadedImages.image1.dataUrl);
              resultImage = await enhanceImage(imagePayloadEnhance);
              break;
            case EditMode.COMBINE:
              if (!prompt || !uploadedImages.image1 || !uploadedImages.image2) {
                setError('Please upload two images and provide a prompt.');
                setIsLoading(false);
                return;
              }
              setLoadingMessage('Combining images...');
              const imagePayload1 = base64ToApiFormat(uploadedImages.image1.dataUrl);
              const imagePayload2 = base64ToApiFormat(uploadedImages.image2.dataUrl);
              resultImage = await combineImages(prompt, imagePayload1, imagePayload2, aspectRatio);
              break;
          }
           if (resultImage) {
            setGeneratedImage(`data:image/png;base64,${resultImage}`);
          }
      }
    } catch (e: any) {
      console.error(e);
      let errorMessage = `An error occurred: ${e.message}`;
      if (e.message.includes("API key not valid") || e.message.includes("Requested entity was not found")) {
        errorMessage = "Your API Key appears to be invalid or has expired. Please select a valid key to continue.";
        setApiKeyError(true);
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [activeView, photoMode, prompt, uploadedImages, thumbnailTitle, thumbnailCloneUrl, videoPrompt, cartoonPrompt, aspectRatio, videoDuration, selectedTemplate]);

  return (
    <div className="min-h-screen text-slate-100">
      <Navbar activeView={activeView} setActiveView={handleViewChange} />
      <main className="container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <ControlPanel
          activeView={activeView}
          photoMode={photoMode}
          setPhotoMode={setPhotoMode}
          prompt={prompt}
          setPrompt={setPrompt}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          videoDuration={videoDuration}
          setVideoDuration={setVideoDuration}
          thumbnailTitle={thumbnailTitle}
          setThumbnailTitle={setThumbnailTitle}
          thumbnailCloneUrl={thumbnailCloneUrl}
          setThumbnailCloneUrl={setThumbnailCloneUrl}
          videoPrompt={videoPrompt}
          setVideoPrompt={setVideoPrompt}
          cartoonPrompt={cartoonPrompt}
          setCartoonPrompt={setCartoonPrompt}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          onImageUpload={handleImageUpload}
          uploadedImages={{
            image1: uploadedImages.image1?.dataUrl || null,
            image2: uploadedImages.image2?.dataUrl || null,
          }}
          clearUpload={clearUpload}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          apiKeyError={apiKeyError}
          setApiKeyError={setApiKeyError}
        />
        <MediaDisplay
          generatedImage={generatedImage}
          generatedVideo={generatedVideo}
          isLoading={isLoading}
          loadingMessage={loadingMessage}
          initialMessage="Your masterpiece will appear here."
        />
      </main>
    </div>
  );
};

export default App;