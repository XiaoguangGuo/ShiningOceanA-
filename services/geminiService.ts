import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ProductInfo, ModuleType, ModuleData } from '../types';

// Initialize Gemini Client
// Note: process.env.API_KEY is guaranteed to be available in this environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Analyzes a product from a URL using Google Search grounding.
 */
export const analyzeProductFromUrl = async (url: string): Promise<{ data: Partial<ProductInfo>, sources: string[] }> => {
  const prompt = `
    Analyze the product sold at the following URL: ${url}
    
    First, search the web to find the product details, official description, key features, and target audience.
    
    Then, extract the following information and return it as a strictly valid JSON object:
    {
      "name": "Product Name",
      "brand": "Brand Name",
      "primaryMessage": "What is the single most important thing the customer needs to know? (The Unique Selling Proposition)",
      "description": "A detailed and persuasive product description based on the page content.",
      "keyFeatures": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
      "targetAudience": "Describe the ideal customer for this product.",
      "tone": "The brand tone (e.g. Professional, Fun, Luxury, Technical)"
    }
    
    Return ONLY the JSON object. Do not include markdown code blocks like \`\`\`json.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        // Use Google Search to find info about the link
        tools: [{ googleSearch: {} }],
        // responseMimeType and responseSchema are NOT allowed when using googleSearch
      }
    });

    let text = response.text || "";
    
    // Clean up markdown if the model ignores the "no markdown" instruction
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
        text = text.substring(start, end + 1);
    }

    const data = JSON.parse(text) as Partial<ProductInfo>;

    // Extract sources from grounding metadata
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web?.uri)
      .filter((uri: string) => !!uri) || [];

    return { data, sources };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

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
    Primary Key Message (USP): ${product.primaryMessage}
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
    
    case ModuleType.KEY_PROPOSITION:
      responseSchema = {
        type: Type.OBJECT,
        properties: {
            headline: { type: Type.STRING, description: "A powerful headline stating the #1 benefit." },
            body: { type: Type.STRING, description: "Persuasive text explaining why this specific feature changes everything for the user." },
            subItems: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                         headline: { type: Type.STRING, description: "Supporting point header" },
                         body: { type: Type.STRING, description: "Supporting point detail" },
                    },
                    required: ["headline", "body"]
                },
                description: "3 key reasons why this main proposition is true."
            },
            imagePrompt: { type: Type.STRING, description: "A heroic close-up or action shot demonstrating this specific core benefit (300x300)." }
        },
        required: ["headline", "body", "subItems", "imagePrompt"]
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
    const extraPrompt = moduleType === ModuleType.KEY_PROPOSITION 
        ? ` THIS MODULE IS THE MOST IMPORTANT. FOCUS ENTIRELY ON: "${product.primaryMessage}". Make it shine.`
        : "";

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt + extraPrompt,
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