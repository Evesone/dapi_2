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

    const fullPrompt = `Photorealistic product photography of a ${input.clothingColor} ${clothingTypeName} with ${sleeveDescription}. ${designPrompt}${logoPrompt}

MANDATORY REQUIREMENTS - READ CAREFULLY:

1. DESIGN PLACEMENT - CRITICAL:
   - The design described in "${input.prompt}" MUST be printed directly ONTO the front surface of the ${clothingTypeName} fabric
   - The design graphics MUST appear as if they are part of the fabric itself, like screen printing or heat transfer
   - The design MUST follow the natural curves and folds of the garment when the fabric bends or wrinkles
   - The design MUST be visible ON THE GARMENT SURFACE, not behind it, not around it, not in the background

2. STRICT PROHIBITIONS - DO NOT CREATE:
   - NO design elements behind the ${clothingTypeName}
   - NO design elements floating around or surrounding the garment
   - NO background graphics, patterns, or decorative elements
   - NO design elements that appear separate from the fabric
   - NO creatures, animals, or graphics positioned behind or around the garment
   - The background must be completely plain and empty

3. VISUAL REQUIREMENTS:
   - The design should look like professional screen printing or digital printing directly on fabric
   - When the fabric folds or curves, the design should show realistic perspective distortion
   - The design colors should appear integrated into the fabric, not as an overlay or sticker
   - The design should be clearly visible and readable on the front of the garment

4. BACKGROUND AND SETTING:
   - Clean, solid white or light gray background
   - No patterns, textures, or graphics in the background
   - Soft, professional studio lighting
   - The garment displayed on a mannequin or hanger
   - No model's face visible (out of frame or obscured)

Remember: The design from "${input.prompt}" must be printed ON the ${clothingTypeName}, not behind it or around it. The background must be completely plain with no design elements whatsoever.`;
    
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
