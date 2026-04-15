export enum ContentStyle {
  QuickInsight = 'quick-insight',
  ProductFocus = 'focus-produk',
  LiveShowcase = 'live-showcase',
  Editorial = 'editorial-shots',
  DramaticPoster = 'dramatic-poster'
}

export enum AspectRatio {
  Vertical = '9:16',
  Square = '1:1',
  Landscape = '16:9'
}

export interface UploadedFile {
  name: string;
  type: string;
  base64: string; // Base64 string without data prefix for storage/api
  dataUrl: string; // Full data URL for preview
}

export interface CreativePlan {
  masterScene: {
    character: string;
    props: string;
    location: string;
    tiktokScript: string;
  };
  shotPrompts: string[];
}

export interface GeneratedImage {
  base64: string;
  prompt: string;
  videoPrompt?: string;
  label: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'product' | 'model' | 'background';
  base64: string;
  createdAt: number;
}

export interface GeneratedContent {
  plan: CreativePlan | null;
  images: GeneratedImage[];
  audioBlob: Blob | null;
}
