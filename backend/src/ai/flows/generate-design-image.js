const { ai } = require('../genkit');
const { z } = require('genkit');

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
      // Try different Gemini models that support image generation
      // Note: Image generation support varies by model and may require specific API access
      const possibleModels = [
        'imagen-4.0-generate-001',
  'googleai/imagen-4.0-generate-001',
        'gemini-2.5-flash-image'
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
            console.log(`✅ Successfully generated image using model: ${modelName}`);
            return {
              imageUrl: media.url,
            };
          } else if (media) {
            console.log(`Model ${modelName} returned media but no URL, checking structure...`);
            console.log('Media object:', JSON.stringify(media, null, 2));
          }
        } catch (modelError) {
          console.error(`❌ Model ${modelName} FAILED`);
          console.error('Error message:', modelError.message);
          console.error('Error name:', modelError.name);
          if (modelError.response) {
            console.error('Response status:', modelError.response.status);
            console.error('Response data:', JSON.stringify(modelError.response.data, null, 2));
          }
          if (modelError.cause) {
            console.error('Error cause:', modelError.cause);
          }
          lastError = modelError;
          continue; // Try next model
        }
      }

      // All Gemini models failed
      throw new Error(`Gemini image generation failed. Tried ${possibleModels.length} models. Last error: ${lastError?.message || 'Unknown error'}. Please check your GOOGLE_AI_API_KEY and ensure it's valid. Note: Image generation may require specific model access or API permissions.`);
    } catch (error) {
      console.error('=== FINAL ERROR in generateDesignImageFlow ===');
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
      console.error('Error stack:', error.stack);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  }
);

module.exports = { generateDesignImage };




