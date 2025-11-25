const { ai } = require('../genkit');
const { z } = require('genkit');

const GenerateDesignImageInputSchema = z.object({
  prompt: z.string(),
  clothingType: z.string(),
  clothingColor: z.string(),
  printStyle: z.enum(['centered', 'pattern']),
  sleeveLength: z.enum(['half', 'full']),
  includeLogo: z.boolean().optional(),
});

const GenerateDesignImageOutputSchema = z.object({
  imageUrl: z.string(),
});

async function generateDesignImage(input) {
  return generateDesignImageFlow(input);
}

const CF_WORKER_URL = "https://image-generation.masterjas84.workers.dev/";

const generateDesignImageFlow = ai.defineFlow(
  {
    name: 'generateDesignImageFlow',
    inputSchema: GenerateDesignImageInputSchema,
    outputSchema: GenerateDesignImageOutputSchema,
  },
  async (input) => {

    // 🔥 Load fetch dynamically (fixes "fetch is not a function")
    const { default: fetch } = await import('node-fetch');

    let designPrompt;

    if (input.printStyle === 'centered') {
      designPrompt = `A centered graphic: "${input.prompt}".`;
    } else {
      designPrompt = `A seamless all-over pattern: "${input.prompt}".`;
    }

    const clothingTypeName = input.clothingType.replace('-', ' ');
    const sleeveDescription = `It has ${input.sleeveLength === 'full' ? 'long' : 'short'} sleeves.`;

    const shouldIncludeLogo = input.includeLogo !== false;
    const logoPrompt = shouldIncludeLogo
      ? ` Include a small DAPI embroidered logo on the left chest.`
      : '';

    const fullPrompt = `
      Create a photorealistic studio mockup of a premium ${input.clothingColor} ${clothingTypeName}.
      ${sleeveDescription}
      ${designPrompt}
      ${logoPrompt}

      CRITICAL REQUIREMENTS (FOLLOW EXACTLY):
      - The design from "${input.prompt}" must be printed directly onto the ${clothingTypeName} fabric, perfectly following folds and seams.
      - Absolutely NO extra graphics, props, models, or scenery. The ${clothingTypeName} must be the only subject.
      - Background must be perfectly plain (solid light gray or white) with zero textures, gradients, or elements.
      - The design must appear embedded in the fabric (screen-printed look), never floating, sticker-like, or detached.
      - Lighting should be modern studio lighting with soft shadows; no reflections or gloss that obscure the print.
      - Frame the garment front-on, cropped mid torso, with no face or body visible.
    `;

    // 🔥 Call Cloudflare Worker
    const response = await fetch(
      `${CF_WORKER_URL}?prompt=${encodeURIComponent(fullPrompt)}`
    );

    if (!response.ok) {
      throw new Error(`Cloudflare Worker Error: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUri = `data:image/png;base64,${base64}`;

    return {
      imageUrl: dataUri,
    };
  }
);

module.exports = { generateDesignImage };
