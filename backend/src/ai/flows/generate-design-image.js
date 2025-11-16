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
      console.log("Using Gemini 2.5 Flash Image");

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-image",
});

const result = await model.generateContent({
  contents: [
    {
      role: "user",
      parts: [{ text: fullPrompt }],
    },
  ],
});

const imagePart = result.response.candidates?.[0]?.content?.parts?.find(
  (p) => p.inlineData && p.inlineData.mimeType.startsWith("image/")
);

if (!imagePart) {
  throw new Error("Gemini 2.5 Flash returned no image.");
}

const dataUri = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;

return {
  imageUrl: dataUri,
};
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





