import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ProductInfo, ModuleType, ModuleData } from '../types';

// Initialize Gemini Client
// Note: process.env.API_KEY is guaranteed to be available in this environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Generates content for a specific A+ module based on product info.
 */
export const generateModuleContent = async (
  moduleType: ModuleType,
  product: ProductInfo
): Promise<Partial<ModuleData>> => {
  
  const systemInstruction = `
    You are an expert Amazon A+ Content Copywriter and Conversion Rate Optimization (CRO) specialist.
    Your goal is to write persuasive, keyword-rich, and compliant content for Amazon product listings.
    You also act as an Art Director, providing detailed prompts for photographers/designers to create the accompanying visuals.
    
    Product Context:
    Name: ${product.name}
    Brand: ${product.brand}
    Description: ${product.description}
    Key Features: ${product.keyFeatures.join(', ')}
    Target Audience: ${product.targetAudience}
    Tone: ${product.tone}
  `;

  const prompt = `Create content for an Amazon A+ module of type: ${moduleType}.
  Ensure the tone matches the brand. Focus on benefits over features where possible.`;

  let responseSchema: Schema;

  // Define schemas based on module type
  switch (moduleType) {
    case ModuleType.COMPANY_LOGO:
        // Logo usually doesn't need text generation, but maybe alt text or a brief usage note?
        // We'll just return a generic structure, maybe for the 'brand story' blurb if applicable, but mostly image prompt.
         responseSchema = {
            type: Type.OBJECT,
            properties: {
                imagePrompt: { type: Type.STRING, description: "A description of the brand logo style or placement context." },
            },
            required: ["imagePrompt"]
        };
        break;

    case ModuleType.HEADER_IMAGE_TEXT:
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING, description: "A catchy, benefit-driven headline." },
          body: { type: Type.STRING, description: "Persuasive body text (approx 50-100 words)." },
          imagePrompt: { type: Type.STRING, description: "Detailed visual description for the banner image (970x600)." }
        },
        required: ["headline", "body", "imagePrompt"]
      };
      break;

    case ModuleType.SINGLE_IMAGE_HIGHLIGHTS:
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING, description: "Section header." },
          body: { type: Type.STRING, description: "Main descriptive text." },
          subItems: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                     headline: { type: Type.STRING, description: "Bullet point header" },
                     body: { type: Type.STRING, description: "Bullet point text" },
                },
                required: ["headline", "body"]
            },
            description: "List of 3-5 key highlights/bullet points."
          },
          imagePrompt: { type: Type.STRING, description: "Visual description for the side image (300x300)." }
        },
        required: ["headline", "body", "subItems", "imagePrompt"]
      };
      break;

    case ModuleType.THREE_IMAGES_TEXT:
    case ModuleType.FOUR_IMAGES_TEXT:
        const count = moduleType === ModuleType.THREE_IMAGES_TEXT ? 3 : 4;
        responseSchema = {
            type: Type.OBJECT,
            properties: {
                headline: { type: Type.STRING, description: "Overall section headline (optional)." },
                subItems: {
                    type: Type.ARRAY,
                    description: `Exactly ${count} distinct features or use-cases.`,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            headline: { type: Type.STRING, description: "Feature title" },
                            body: { type: Type.STRING, description: "Short benefit description" },
                            imagePrompt: { type: Type.STRING, description: "Visual description for this specific feature image." }
                        },
                        required: ["headline", "body", "imagePrompt"]
                    }
                }
            },
            required: ["subItems"]
        };
        break;
    
    case ModuleType.COMPARISON_CHART:
        responseSchema = {
             type: Type.OBJECT,
             properties: {
                 headline: { type: Type.STRING, description: "Title for the comparison chart (e.g., 'Find the right [Brand] product for you')." },
                 subItems: {
                     type: Type.ARRAY,
                     description: "List of 3-4 comparable products (including the current one).",
                     items: {
                        type: Type.OBJECT,
                        properties: {
                            headline: { type: Type.STRING, description: "Product Name" },
                            body: { type: Type.STRING, description: "Key differentiator or price tier hint." },
                            imagePrompt: { type: Type.STRING, description: "Visual description of the product thumbnail." }
                        },
                        required: ["headline", "body", "imagePrompt"]
                     }
                 }
             },
             required: ["headline", "subItems"]
        };
        break;

    case ModuleType.TEXT_ONLY:
        responseSchema = {
            type: Type.OBJECT,
            properties: {
                headline: { type: Type.STRING },
                body: { type: Type.STRING, description: "Long-form text formatted with paragraphs." }
            },
            required: ["headline", "body"]
        }
        break;

    default:
        responseSchema = { type: Type.OBJECT, properties: { body: { type: Type.STRING } } };
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text generated");
    return JSON.parse(text) as Partial<ModuleData>;

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};
