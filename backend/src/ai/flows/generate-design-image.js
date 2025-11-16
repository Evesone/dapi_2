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
      Create a photorealistic mockup of a ${input.clothingColor} ${clothingTypeName}.
      ${sleeveDescription}
      ${designPrompt}
      ${logoPrompt}
      Make the print look naturally integrated with fabric folds.
      Use modern studio lighting, clean background, no visible face.
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
