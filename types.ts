// FIX: Removed self-import of EditMode which was causing a conflict with the local declaration.
export enum EditMode {
  GENERATE = 'Generate',
  EDIT = 'Edit',
  ENHANCE = 'Enhance',
  COMBINE = 'Combine',
}

export enum AppView {
  PHOTO = 'Photo',
  VIDEO = 'Video',
  CARTOON = 'Cartoon',
  THUMBNAIL = 'Thumbnail',
  TEMPLATES = 'Templates',
}

export type AspectRatio = '1:1' | '16:9' | '9:16';

export type Template = {
  name: string;
  description: string;
  stylePrompt: string;
  thumbnail: string;
};
