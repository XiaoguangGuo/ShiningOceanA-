import { ModuleType, Template } from './types';
import { Layout, Image, List, Grid, Type, BarChart3, FileText } from 'lucide-react';

export const MODULE_DEFINITIONS: Record<ModuleType, { name: string; icon: any; dimensions: string; description: string }> = {
  [ModuleType.COMPANY_LOGO]: {
    name: 'Standard Company Logo',
    icon: Image,
    dimensions: '600 x 180 px',
    description: 'Brand awareness builder at the start or end of content.'
  },
  [ModuleType.HEADER_IMAGE_TEXT]: {
    name: 'Header Image with Text',
    icon: Layout,
    dimensions: '970 x 600 px',
    description: 'High impact visual with overlay or side text for storytelling.'
  },
  [ModuleType.SINGLE_IMAGE_HIGHLIGHTS]: {
    name: 'Standard Image & Highlights',
    icon: FileText,
    dimensions: '300 x 300 px (Image)',
    description: 'Focus on specific specs or features with a side image.'
  },
  [ModuleType.THREE_IMAGES_TEXT]: {
    name: 'Standard 3 Images & Text',
    icon: Grid,
    dimensions: '300 x 300 px (each)',
    description: 'Showcase multiple features, lifestyle shots, or variations.'
  },
  [ModuleType.FOUR_IMAGES_TEXT]: {
    name: 'Standard 4 Images & Text',
    icon: Grid,
    dimensions: '220 x 220 px (each)',
    description: 'Dense feature grid for highlighting many benefits.'
  },
  [ModuleType.COMPARISON_CHART]: {
    name: 'Comparison Chart',
    icon: BarChart3,
    dimensions: '150 x 300 px (thumbnails)',
    description: 'Upsell by comparing this product to others in your catalog.'
  },
  [ModuleType.TEXT_ONLY]: {
    name: 'Standard Product Description',
    icon: Type,
    dimensions: 'N/A',
    description: 'Rich text block for detailed storytelling or SEO keywords.'
  }
};

export const STRATEGIES: Template[] = [
  {
    id: 'brand-story',
    name: 'Brand Storytelling',
    description: 'Focus on emotional connection, brand heritage, and lifestyle.',
    modules: [
      ModuleType.COMPANY_LOGO,
      ModuleType.HEADER_IMAGE_TEXT,
      ModuleType.THREE_IMAGES_TEXT,
      ModuleType.HEADER_IMAGE_TEXT,
      ModuleType.COMPANY_LOGO
    ]
  },
  {
    id: 'feature-deep-dive',
    name: 'Tech & Specs Deep Dive',
    description: 'Best for electronics or complex items requiring explanation.',
    modules: [
      ModuleType.COMPANY_LOGO,
      ModuleType.HEADER_IMAGE_TEXT,
      ModuleType.SINGLE_IMAGE_HIGHLIGHTS,
      ModuleType.FOUR_IMAGES_TEXT,
      ModuleType.COMPARISON_CHART
    ]
  },
  {
    id: 'problem-solution',
    name: 'Problem / Solution',
    description: 'Highlight user pain points and how your product solves them.',
    modules: [
      ModuleType.HEADER_IMAGE_TEXT, // The Problem
      ModuleType.THREE_IMAGES_TEXT, // The Solution features
      ModuleType.HEADER_IMAGE_TEXT, // The Outcome (Lifestyle)
      ModuleType.COMPARISON_CHART
    ]
  }
];
