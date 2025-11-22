export enum ModuleType {
  COMPANY_LOGO = 'COMPANY_LOGO',
  HEADER_IMAGE_TEXT = 'HEADER_IMAGE_TEXT',
  SINGLE_IMAGE_HIGHLIGHTS = 'SINGLE_IMAGE_HIGHLIGHTS',
  THREE_IMAGES_TEXT = 'THREE_IMAGES_TEXT',
  FOUR_IMAGES_TEXT = 'FOUR_IMAGES_TEXT',
  COMPARISON_CHART = 'COMPARISON_CHART',
  TEXT_ONLY = 'TEXT_ONLY'
}

export interface ProductInfo {
  name: string;
  brand: string;
  description: string;
  keyFeatures: string[];
  targetAudience: string;
  tone: string;
}

export interface ModuleData {
  id: string;
  type: ModuleType;
  headline?: string;
  body?: string;
  imageUrl?: string; // Placeholder or generated concept
  imagePrompt?: string; // Brief for the photographer/designer
  subItems?: {
    headline: string;
    body: string;
    imageUrl?: string;
    imagePrompt?: string;
  }[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  modules: ModuleType[];
}

export type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';
