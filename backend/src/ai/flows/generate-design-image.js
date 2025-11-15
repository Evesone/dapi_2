const { ai } = require('../genkit');
const { z } = require('genkit');
const { ImageGenerationService } = require('../../services/imageGenerationService');

const GenerateDesignImageInputSchema = z.object({
  prompt: z.string().describe('A text prompt describing the desired design.'),
  clothingType: z
    .string()
    .describe("The type of clothing, e.g., 't-shirt', 'hoodie'."),
  clothingColor: z.string().describe("The color of the clothing, e.g., 'white', 'black'."),
  printStyle: z
    .enum(['centered', 'pattern'])
    .describe("The style of the print: 'centered' for a graphic, 'pattern' for an all-over print."),
  sleeveLength: z.enum(['half', 'full']).describe("The sleeve length of the clothing, e.g., 'half' or 'full'."),
  includeLogo: z.boolean().optional().describe("Whether to include the brand logo on the garment. Defaults to true."),
});

const GenerateDesignImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});

async function generateDesignImage(input) {
  return generateDesignImageFlow(input);
}

const generateDesignImageFlow = ai.defineFlow(
  {
    name: 'generateDesignImageFlow',
    inputSchema: GenerateDesignImageInputSchema,
    outputSchema: GenerateDesignImageOutputSchema,
  },
  async (input) => {
    // Use Gemini 2.5 Flash Image (Nano Banana) as primary model
    console.log('Using Gemini 2.5 Flash Image (Nano Banana) for image generation');
    let designPrompt;
    if (input.printStyle === 'centered') {
      designPrompt = `The clothing must feature a visually striking, professionally-made, centered graphic based on this description: "${input.prompt}".`;
    } else {
      // 'pattern'
      designPrompt = `The clothing must feature an attractive, seamless, all-over pattern based on this description: "${input.prompt}". The pattern should cover the entire garment.`;
    }
    
    let clothingTypeName = input.clothingType.replace('-', ' ');

    let sleeveDescription = `It should have ${input.sleeveLength === 'full' ? 'long' : 'short'} sleeves.`;
    
    // Only include logo if explicitly requested (defaults to true if not specified)
    const shouldIncludeLogo = input.includeLogo !== false;
    const logoPrompt = shouldIncludeLogo 
      ? ` Additionally, a small, subtle, and elegantly embroidered logo featuring the stylized text "DAPI" must be placed on the left chest of the garment (from the wearer's perspective). The logo should be tastefully integrated into the clothing, appearing as a high-quality, premium brand mark.`
      : '';

    const fullPrompt = `Create a photorealistic product mockup of a high-quality ${input.clothingColor} ${clothingTypeName} with a design directly imprinted and printed onto the fabric. ${sleeveDescription} ${designPrompt}${logoPrompt} 

CRITICAL REQUIREMENTS:
- The design must be DIRECTLY PRINTED/IMPRINTED onto the fabric of the ${clothingTypeName}, not floating above it or separate from it
- The design should be an integral part of the garment, appearing as if it was screen-printed, heat-pressed, or digitally printed directly onto the fabric
- The design must conform to the natural folds, wrinkles, and curves of the fabric, showing realistic distortion where the fabric bends
- The design colors and graphics should appear as if they are part of the fabric itself, not a sticker or overlay
- The design should show proper perspective and follow the 3D shape of the garment
- The printing should look professional, with the design clearly visible and properly integrated into the clothing item

The mockup should be displayed on a clean, minimalist background with soft studio lighting that creates realistic shadows and highlights on the garment. The model's face should be out of frame or obscured. The overall image must be modern, attractive, and persuasive, showing the ${clothingTypeName} with the design clearly imprinted on it.`;
    
    try {
      // Try Gemini 2.5 Flash Image (Nano Banana) - try different possible model identifiers
      const possibleModels = [
        'googleai/gemini-2.5-flash-image-exp',  // Experimental version
        'googleai/gemini-2.5-flash-image',      // Standard version
        'googleai/gemini-2.5-flash-image-nano-banana', // Explicit Nano Banana identifier
      ];

      let lastError = null;
      for (const modelName of possibleModels) {
        try {
          console.log(`Trying Gemini model: ${modelName}`);
          const {media} = await ai.generate({
            model: modelName,
            prompt: fullPrompt,
            config: {
              responseModalities: ['TEXT', 'IMAGE'],
            },
          });

          if (media && media.url) {
            console.log(`Successfully generated image using model: ${modelName}`);
            return {
              imageUrl: media.url,
            };
          }
        } catch (modelError) {
          console.log(`Model ${modelName} failed:`, modelError.message);
          lastError = modelError;
          continue; // Try next model
        }
      }

      // If all Gemini models failed, try DALL-E as fallback
      const hasOpenAI = process.env.OPENAI_API_KEY && 
                       process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' &&
                       process.env.OPENAI_API_KEY.trim() !== '';

      if (hasOpenAI) {
        console.log('All Gemini models failed, trying DALL-E as fallback');
        try {
          return await ImageGenerationService.generateDesignImage({
            prompt: input.prompt,
            clothingType: input.clothingType,
            clothingColor: input.clothingColor,
            printStyle: input.printStyle,
            sleeveLength: input.sleeveLength,
            includeLogo: input.includeLogo,
          });
        } catch (dalleError) {
          console.error('DALL-E fallback also failed:', dalleError.message);
          throw new Error(`Image generation failed with all models. Last Gemini error: ${lastError?.message || 'Unknown error'}. DALL-E error: ${dalleError.message}`);
        }
      }

      throw new Error(`Gemini 2.5 Flash Image generation failed. Error: ${lastError?.message || 'Unknown error'}. Please check your GOOGLE_AI_API_KEY.`);
    } catch (error) {
      console.error('Image generation error:', error);
      throw error;
    }
  }
);

module.exports = { generateDesignImage };
