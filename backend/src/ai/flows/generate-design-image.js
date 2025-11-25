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
    // Use Cloudflare Workers AI for image generation
    console.log('Using Cloudflare Workers AI for image generation');
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

    const fullPrompt = `Create a photorealistic product mockup of a high-quality ${input.clothingColor} ${clothingTypeName} with ${sleeveDescription}. ${designPrompt}${logoPrompt}

ABSOLUTE REQUIREMENTS - FOLLOW EXACTLY:

1. DESIGN PLACEMENT - ONLY ON FABRIC:
   - ONLY the design described in "${input.prompt}" must appear on the ${clothingTypeName}
   - The design MUST be printed directly ONTO the front surface of the ${clothingTypeName} fabric
   - The design must appear as if it was professionally screen-printed or digitally printed directly onto the fabric surface
   - The design must follow the natural curves and folds of the garment when the fabric bends
   - NO other design elements, graphics, patterns, or decorative elements should appear anywhere else

2. STRICT PROHIBITIONS - DO NOT INCLUDE:
   - NO design elements behind the ${clothingTypeName}
   - NO design elements around, beside, or surrounding the garment
   - NO background graphics, patterns, textures, or decorative elements
   - NO additional creatures, animals, objects, or graphics that are not part of "${input.prompt}"
   - NO design elements floating in the air or separate from the fabric
   - The background must be completely plain, solid, and empty

3. VISUAL ACCURACY:
   - The design should look like professional printing directly on fabric
   - When fabric folds or curves, show realistic perspective distortion of the design
   - The design colors must appear integrated into the fabric, not as an overlay
   - Only show the exact design requested: "${input.prompt}" - nothing more, nothing less

4. SETTING:
   - Clean, solid white or light gray background - completely plain with no patterns or graphics
   - Soft professional studio lighting
   - Garment displayed on a mannequin or hanger
   - No model's face visible (out of frame or obscured)

IMPORTANT: Only create the design "${input.prompt}" printed on the ${clothingTypeName}. Do not add any other design elements, graphics, or decorative features. The background must be completely plain.`;
    
    try {
      // Use Cloudflare Workers AI for image generation
      const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
      const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN;
      const cloudflareModel = process.env.CLOUDFLARE_IMAGE_MODEL || '@cf/black-forest-labs/flux-schnell';
      
      if (!cloudflareAccountId || !cloudflareApiToken) {
        throw new Error('Cloudflare API credentials not configured. Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN environment variables.');
      }

      const cloudflareApiUrl = `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/ai/run/${cloudflareModel}`;
      
      console.log('Calling Cloudflare API:', cloudflareApiUrl);
      console.log('Using model:', cloudflareModel);
      
      const response = await fetch(cloudflareApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cloudflareApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: fullPrompt,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cloudflare API error:', errorText);
        throw new Error(`Cloudflare API error: ${response.status} ${errorText}`);
      }

      // Cloudflare Workers AI returns image as ArrayBuffer or Blob
      const imageBlob = await response.blob();
      const arrayBuffer = await imageBlob.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString('base64');
      const mimeType = imageBlob.type || 'image/png';
      
      const dataUri = `data:${mimeType};base64,${base64Image}`;

      console.log('Image generated successfully via Cloudflare');
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
