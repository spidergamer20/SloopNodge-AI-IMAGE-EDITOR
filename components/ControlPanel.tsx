import React, { useRef, useState, useEffect } from 'react';
import { EditMode, AppView, AspectRatio, Template } from '../types';
import { GenerateIcon } from './icons/GenerateIcon';
import { EditIcon } from './icons/EditIcon';
import { EnhanceIcon } from './icons/EnhanceIcon';
import { CombineIcon } from './icons/CombineIcon';
import { PromptIdeas } from './PromptIdeas';
import { AspectRatioIcon } from './icons/AspectRatioIcon';
import { MicIcon } from './icons/MicIcon';

interface ControlPanelProps {
  activeView: AppView;
  photoMode: EditMode;
  setPhotoMode: (mode: EditMode) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  videoDuration: number;
  setVideoDuration: (duration: number) => void;
  thumbnailTitle: string;
  setThumbnailTitle: (title: string) => void;
  thumbnailCloneUrl: string;
  setThumbnailCloneUrl: (url: string) => void;
  videoPrompt: string;
  setVideoPrompt: (prompt: string) => void;
  cartoonPrompt: string;
  setCartoonPrompt: (prompt: string) => void;
  selectedTemplate: Template | null;
  setSelectedTemplate: (template: Template | null) => void;
  onImageUpload: (file: File, slot: 'image1' | 'image2') => void;
  uploadedImages: { image1: string | null; image2: string | null };
  clearUpload: (slot: 'image1' | 'image2') => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: string | null;
  apiKeyError: boolean;
  setApiKeyError: (error: boolean) => void;
}

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}> = ({ label, isActive, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-400 ${
      isActive
        ? 'bg-cyan-500/20 text-cyan-300 shadow-md shadow-cyan-500/10'
        : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/80 hover:text-slate-200'
    }`}
  >
    {icon}
    {label}
  </button>
);

const ImageUploader: React.FC<{
    label: string;
    uploadedImage: string | null;
    onUpload: (file: File) => void;
    onClear: () => void;
}> = ({ label, uploadedImage, onUpload, onClear }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <div className="flex-grow flex flex-col">
            <label className="block text-sm font-medium text-slate-400 mb-2">
                {label}
            </label>
            {uploadedImage ? (
                <div className="relative group">
                    <img src={uploadedImage} alt="Uploaded preview" className="w-full rounded-xl object-cover max-h-64 border-2 border-slate-700/50" />
                    <button
                        onClick={onClear}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ) : (
                <div
                    className="flex-grow flex justify-center items-center px-6 pt-5 pb-6 border-2 border-slate-700/50 border-dashed rounded-xl cursor-pointer hover:border-cyan-400/50 transition-colors h-full bg-slate-900/40"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-slate-600" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="text-sm text-slate-400">
                            <span className="font-semibold text-cyan-400">Click to upload</span>
                        </p>
                        <p className="text-xs text-slate-500">PNG, JPG, WEBP</p>
                        <input ref={fileInputRef} id={`file-upload-${label}`} name={`file-upload-${label}`} type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                    </div>
                </div>
            )}
        </div>
    );
}

const VoiceInput: React.FC<{ setPrompt: (prompt: string) => void }> = ({ setPrompt }) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // FIX: Cast window to `any` to access non-standard SpeechRecognition properties.
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            const recognition = recognitionRef.current;
            recognition.continuous = false;
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setPrompt(transcript);
                setIsListening(false);
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };
            
            recognition.onend = () => {
                setIsListening(false);
            };
        }
    }, [setPrompt]);
    
    const handleListen = () => {
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            if (recognitionRef.current) {
                recognitionRef.current.start();
                setIsListening(true);
            } else {
                alert('Voice recognition is not supported in your browser.');
            }
        }
    }

    return (
        <button
            type="button"
            onClick={handleListen}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
                isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-slate-200'
            }`}
        >
            <MicIcon />
        </button>
    );
};

const PhotoEditorControls: React.FC<Omit<ControlPanelProps, 'activeView' | 'thumbnailTitle' | 'setThumbnailTitle' | 'thumbnailCloneUrl' | 'setThumbnailCloneUrl' | 'videoPrompt' | 'setVideoPrompt' | 'cartoonPrompt' | 'setCartoonPrompt' | 'selectedTemplate' | 'setSelectedTemplate' | 'videoDuration' | 'setVideoDuration' | 'apiKeyError' | 'setApiKeyError'>> = ({
    photoMode, setPhotoMode, prompt, setPrompt, aspectRatio, setAspectRatio, onImageUpload, uploadedImages, clearUpload
}) => (
    <>
        <div className="flex gap-2 bg-slate-900/70 p-1 rounded-xl">
            <TabButton label="Generate" isActive={photoMode === EditMode.GENERATE} onClick={() => setPhotoMode(EditMode.GENERATE)} icon={<GenerateIcon />}/>
            <TabButton label="Edit" isActive={photoMode === EditMode.EDIT} onClick={() => setPhotoMode(EditMode.EDIT)} icon={<EditIcon />} />
            <TabButton label="Enhance" isActive={photoMode === EditMode.ENHANCE} onClick={() => setPhotoMode(EditMode.ENHANCE)} icon={<EnhanceIcon />} />
            <TabButton label="Combine" isActive={photoMode === EditMode.COMBINE} onClick={() => setPhotoMode(EditMode.COMBINE)} icon={<CombineIcon />} />
        </div>

        {(photoMode === EditMode.EDIT || photoMode === EditMode.ENHANCE) && (
            <ImageUploader label="Upload Image" uploadedImage={uploadedImages.image1} onUpload={(file) => onImageUpload(file, 'image1')} onClear={() => clearUpload('image1')} />
        )}

        {photoMode === EditMode.COMBINE && (
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ImageUploader label="Base Image" uploadedImage={uploadedImages.image1} onUpload={(file) => onImageUpload(file, 'image1')} onClear={() => clearUpload('image1')} />
                    <ImageUploader label="Reference Image" uploadedImage={uploadedImages.image2} onUpload={(file) => onImageUpload(file, 'image2')} onClear={() => clearUpload('image2')} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
                    <div className="flex gap-2">
                        {(['1:1', '16:9', '9:16'] as AspectRatio[]).map(ratio => (
                            <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-400 ${ aspectRatio === ratio ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/80'}`}>
                                <AspectRatioIcon ratio={ratio} />
                                {ratio}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {(photoMode === EditMode.GENERATE || photoMode === EditMode.EDIT || photoMode === EditMode.COMBINE) && (
            <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">Your Prompt</label>
                <div className="relative">
                    <textarea id="prompt" rows={4} className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 pr-12 text-slate-200 focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-colors" placeholder={ photoMode === EditMode.GENERATE ? 'e.g., A cat wearing a spacesuit on Mars' : photoMode === EditMode.EDIT ? 'e.g., Change the background to a beach' : 'e.g., Put the person from Base Image into the Reference Image background' } value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                    <VoiceInput setPrompt={setPrompt} />
                </div>
                <PromptIdeas onSelectIdea={setPrompt} />
            </div>
        )}
        
        {photoMode === EditMode.GENERATE && (
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
                 <div className="flex gap-2">
                    {(['1:1', '16:9', '9:16'] as AspectRatio[]).map(ratio => (
                        <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-400 ${ aspectRatio === ratio ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/80'}`}>
                            <AspectRatioIcon ratio={ratio} />
                            {ratio}
                        </button>
                    ))}
                 </div>
             </div>
        )}

        {photoMode === EditMode.GENERATE && <div className="flex-grow"></div>}
    </>
);

const ThumbnailMakerControls: React.FC<Omit<ControlPanelProps, 'activeView' | 'photoMode' | 'setPhotoMode' | 'videoPrompt' | 'setVideoPrompt' | 'cartoonPrompt' | 'setCartoonPrompt' | 'selectedTemplate' | 'setSelectedTemplate' | 'videoDuration' | 'setVideoDuration' | 'apiKeyError' | 'setApiKeyError'>> = ({
    prompt, setPrompt, thumbnailTitle, setThumbnailTitle, thumbnailCloneUrl, setThumbnailCloneUrl, onImageUpload, uploadedImages, clearUpload, aspectRatio, setAspectRatio
}) => (
    <div className="flex flex-col gap-6">
        <h2 className="text-xl font-bold text-slate-200">Thumbnail Maker</h2>
        <ImageUploader label="Upload Main Image" uploadedImage={uploadedImages.image1} onUpload={(file) => onImageUpload(file, 'image1')} onClear={() => clearUpload('image1')} />
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
            <div className="flex gap-2">
                {(['16:9', '9:16', '1:1'] as AspectRatio[]).map(ratio => (
                    <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-400 ${ aspectRatio === ratio ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/80'}`}>
                        <AspectRatioIcon ratio={ratio} />
                        {ratio}
                    </button>
                ))}
            </div>
        </div>
        <div className="flex flex-col gap-4">
            <div>
                <label htmlFor="thumbnail-title" className="block text-sm font-medium text-slate-300 mb-2">Thumbnail Title</label>
                <input id="thumbnail-title" type="text" className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-colors" placeholder="e.g., I BUILT A ROCKET!" value={thumbnailTitle} onChange={(e) => setThumbnailTitle(e.target.value)} />
            </div>
            <div>
                <label htmlFor="thumbnail-clone-url" className="block text-sm font-medium text-slate-300 mb-2">Clone Style from URL (Optional)</label>
                <input id="thumbnail-clone-url" type="url" className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-colors" placeholder="e.g., YouTube or TikTok video URL" value={thumbnailCloneUrl} onChange={(e) => setThumbnailCloneUrl(e.target.value)} />
            </div>
            <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">Additional Instructions</label>
                <div className="relative">
                    <textarea id="prompt" rows={2} className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 pr-12 text-slate-200 focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-colors" placeholder="e.g., add a surprised emoji, make the background explode" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                    <VoiceInput setPrompt={setPrompt} />
                </div>
                <PromptIdeas onSelectIdea={setPrompt} />
            </div>
        </div>
    </div>
);

const ApiKeyScreen: React.FC<{ onKeySelect: () => void }> = ({ onKeySelect }) => (
    <div className="flex-grow flex flex-col items-center justify-center text-center gap-4 p-4">
         <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center border-2 border-yellow-500/30 text-yellow-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
         </div>
         <h2 className="text-xl font-bold text-slate-200">API Key Required</h2>
         <p className="text-slate-400 max-w-sm">This AI model requires your own API key for billing and access. This is a one-time setup.</p>
         <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:underline">Learn more about billing</a>
         <button onClick={onKeySelect} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg w-full max-w-sm transition-transform hover:scale-105">
            Select API Key
         </button>
    </div>
);

const VideoEditorControls: React.FC<Omit<ControlPanelProps, 'activeView' | 'photoMode' | 'setPhotoMode' | 'prompt' | 'setPrompt' | 'thumbnailTitle' | 'setThumbnailTitle' | 'thumbnailCloneUrl' | 'setThumbnailCloneUrl' | 'cartoonPrompt' | 'setCartoonPrompt' | 'selectedTemplate' | 'setSelectedTemplate'>> = ({
    videoPrompt, setVideoPrompt, onImageUpload, uploadedImages, clearUpload, aspectRatio, setAspectRatio, videoDuration, setVideoDuration, apiKeyError, setApiKeyError
}) => {
    const [apiKeySelected, setApiKeySelected] = useState(false);
    const [checkingApiKey, setCheckingApiKey] = useState(true);

    useEffect(() => {
        const checkKey = async () => {
            if(window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setApiKeySelected(hasKey);
            }
            setCheckingApiKey(false);
        };
        checkKey();
    }, []);

    useEffect(() => {
        if (apiKeyError) {
            setApiKeySelected(false);
            setApiKeyError(false);
        }
    }, [apiKeyError, setApiKeyError]);

    const handleSelectKey = async () => {
        if(window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
            setApiKeySelected(true); 
        }
    };

    if (checkingApiKey) {
        return <div className="flex-grow flex items-center justify-center"><p>Initializing...</p></div>
    }

    if (!apiKeySelected) {
        return <ApiKeyScreen onKeySelect={handleSelectKey} />
    }

    return (
        <div className="flex flex-col gap-6 h-full">
            <h2 className="text-xl font-bold text-slate-200">Video Generation</h2>
            <div className="flex-grow">
                <ImageUploader label="Upload Starting Image (Optional)" uploadedImage={uploadedImages.image1} onUpload={(file) => onImageUpload(file, 'image1')} onClear={() => clearUpload('image1')} />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
                    <div className="flex gap-2">
                        {(['16:9', '9:16', '1:1'] as AspectRatio[]).map(ratio => (
                            <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-400 ${ aspectRatio === ratio ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/80'}`}>
                                <AspectRatioIcon ratio={ratio} />
                                {ratio}
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <label htmlFor="duration-slider" className="block text-sm font-medium text-slate-300 mb-2">
                        Timeline: <span className="font-bold text-cyan-400">{videoDuration} min</span>
                    </label>
                    <input
                        id="duration-slider"
                        type="range"
                        min="1"
                        max="20"
                        step="1"
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(Number(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="video-prompt" className="block text-sm font-medium text-slate-300 mb-2">Video Prompt</label>
                <div className="relative">
                    <textarea id="video-prompt" rows={4} className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 pr-12 text-slate-200 focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-colors" placeholder="e.g., A robot holding a red skateboard in a futuristic city" value={videoPrompt} onChange={(e) => setVideoPrompt(e.target.value)} />
                    <VoiceInput setPrompt={setVideoPrompt} />
                </div>
                <PromptIdeas onSelectIdea={setVideoPrompt} />
            </div>
        </div>
    );
};

const CartoonGeneratorControls: React.FC<Omit<ControlPanelProps, 'activeView' | 'photoMode' | 'setPhotoMode' | 'prompt' | 'setPrompt' | 'thumbnailTitle' | 'setThumbnailTitle' | 'thumbnailCloneUrl' | 'setThumbnailCloneUrl' | 'videoPrompt' | 'setVideoPrompt' | 'selectedTemplate' | 'setSelectedTemplate'>> = ({
    cartoonPrompt, setCartoonPrompt, aspectRatio, setAspectRatio, videoDuration, setVideoDuration, apiKeyError, setApiKeyError
}) => {
     const [apiKeySelected, setApiKeySelected] = useState(false);
    const [checkingApiKey, setCheckingApiKey] = useState(true);

    useEffect(() => {
        const checkKey = async () => {
            if(window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setApiKeySelected(hasKey);
            }
            setCheckingApiKey(false);
        };
        checkKey();
    }, []);

    useEffect(() => {
        if (apiKeyError) {
            setApiKeySelected(false);
            setApiKeyError(false);
        }
    }, [apiKeyError, setApiKeyError]);

    const handleSelectKey = async () => {
        if(window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
            setApiKeySelected(true);
        }
    };

    if (checkingApiKey) {
        return <div className="flex-grow flex items-center justify-center"><p>Initializing...</p></div>
    }

    if (!apiKeySelected) {
        return <ApiKeyScreen onKeySelect={handleSelectKey} />
    }
    
    return (
        <div className="flex flex-col gap-6 h-full">
            <h2 className="text-xl font-bold text-slate-200">AI Cartoon Generator</h2>
            <p className="text-sm text-slate-400 -mt-4">Describe a story, and the AI will generate a short, Pixar-style animated clip.</p>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
                    <div className="flex gap-2">
                        {(['16:9', '9:16', '1:1'] as AspectRatio[]).map(ratio => (
                            <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-400 ${ aspectRatio === ratio ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/80'}`}>
                                <AspectRatioIcon ratio={ratio} />
                                {ratio}
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <label htmlFor="duration-slider-cartoon" className="block text-sm font-medium text-slate-300 mb-2">
                        Timeline: <span className="font-bold text-cyan-400">{videoDuration} min</span>
                    </label>
                    <input
                        id="duration-slider-cartoon"
                        type="range"
                        min="1"
                        max="20"
                        step="1"
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(Number(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                </div>
            </div>
            <div className="flex-grow flex flex-col">
                <label htmlFor="cartoon-prompt" className="block text-sm font-medium text-slate-300 mb-2">Your Story Prompt</label>
                 <div className="relative flex-grow">
                    <textarea id="cartoon-prompt" className="w-full h-full bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 pr-12 text-slate-200 focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-colors" placeholder="e.g., A brave little robot discovers a glowing, magical flower in a dark, abandoned factory..." value={cartoonPrompt} onChange={(e) => setCartoonPrompt(e.target.value)} />
                    <VoiceInput setPrompt={setCartoonPrompt} />
                </div>
            </div>
            <PromptIdeas onSelectIdea={setCartoonPrompt} />
        </div>
    );
}

const templates: Template[] = [
    { name: 'Cinematic Vlog', description: 'Dramatic, smooth shots with high contrast and teal-orange color grading.', stylePrompt: 'Create a cinematic vlog style video. Use slow, sweeping camera movements, a shallow depth of field, and a teal and orange color grade. The mood should be thoughtful and epic.', thumbnail: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { name: 'Sci-Fi Trailer', description: 'Futuristic, high-tech visuals with neon glows and digital glitch effects.', stylePrompt: 'Generate a high-energy sci-fi trailer. Include futuristic cityscapes, neon lighting, lens flares, and quick cuts. Use digital glitch transitions and an intense, suspenseful tone.', thumbnail: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { name: 'Retro VHS', description: 'A nostalgic, 90s home video look with tape grain and tracking lines.', stylePrompt: 'Produce a video with a retro VHS aesthetic. The footage should have a 4:3 aspect ratio, visible scan lines, color bleeding, a soft focus, and a timestamp in the corner. Emulate the look of an old camcorder.', thumbnail: 'https://images.pexels.com/photos/7130498/pexels-photo-7130498.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { name: 'Viral TikTok Short', description: 'Fast-paced, engaging content with trending music and quick text overlays.', stylePrompt: 'Make a vertical, fast-paced video suitable for TikTok or Reels. Use quick cuts, punchy zoom effects, and engaging text captions that appear on screen. The energy should be high and attention-grabbing.', thumbnail: 'https://images.pexels.com/photos/7674643/pexels-photo-7674643.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
];

const TemplatesControls: React.FC<Omit<ControlPanelProps, 'activeView' | 'photoMode' | 'setPhotoMode' | 'thumbnailTitle' | 'setThumbnailTitle' | 'thumbnailCloneUrl' | 'setThumbnailCloneUrl' | 'videoPrompt' | 'setVideoPrompt' | 'cartoonPrompt' | 'setCartoonPrompt' | 'aspectRatio' | 'setAspectRatio' | 'onImageUpload' | 'uploadedImages' | 'clearUpload' | 'apiKeyError' | 'setApiKeyError'>> = ({
    prompt, setPrompt, selectedTemplate, setSelectedTemplate
}) => {
    return (
        <div className="flex flex-col gap-6 h-full">
            <h2 className="text-xl font-bold text-slate-200">Video Templates</h2>
            <p className="text-sm text-slate-400 -mt-4">Select a style, then describe what should happen in the video.</p>
            
            <div className="grid grid-cols-2 gap-4">
                {templates.map(template => (
                    <button key={template.name} onClick={() => setSelectedTemplate(template)} className={`relative group block p-4 rounded-xl border-2 transition-all duration-200 overflow-hidden ${selectedTemplate?.name === template.name ? 'border-cyan-400 shadow-lg shadow-cyan-500/20' : 'border-slate-700/50 hover:border-slate-600'}`}>
                        <img src={template.thumbnail} alt={template.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                        <div className="relative">
                           <h3 className="font-bold text-white">{template.name}</h3>
                           <p className="text-xs text-slate-300 mt-1">{template.description}</p>
                        </div>
                    </button>
                ))}
            </div>

            {selectedTemplate && (
                <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">What should happen in this video?</label>
                    <div className="relative">
                        <textarea id="prompt" rows={4} className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 pr-12 text-slate-200 focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-colors" placeholder={`e.g., A person walking through a dense, foggy forest at sunrise`} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                        <VoiceInput setPrompt={setPrompt} />
                    </div>
                </div>
            )}
        </div>
    );
};


export const ControlPanel: React.FC<ControlPanelProps> = (props) => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 h-full min-h-[75vh]">
      {props.activeView === AppView.PHOTO && <PhotoEditorControls {...props} />}
      {props.activeView === AppView.THUMBNAIL && <ThumbnailMakerControls {...props} />}
      {props.activeView === AppView.VIDEO && <VideoEditorControls {...props} />}
      {props.activeView === AppView.CARTOON && <CartoonGeneratorControls {...props} />}
      {props.activeView === AppView.TEMPLATES && <TemplatesControls {...props} />}

      <div className="mt-auto pt-6">
        {props.error && <p className="text-red-400 text-sm mb-2 text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">{props.error}</p>}
        <button
          onClick={props.onSubmit}
          disabled={props.isLoading}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/20 rounded-xl mix-blend-overlay"></div>
          {props.isLoading ? 'Processing...' : 'Generate'}
        </button>
      </div>
    </div>
  );
};