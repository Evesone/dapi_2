const { ai } = require('../genkit');
const { z } = require('genkit');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ✅ FIX: Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

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

const generateDesignImageFlow = ai.defineFlow(
  {
    name: 'generateDesignImageFlow',
    inputSchema: GenerateDesignImageInputSchema,
    outputSchema: GenerateDesignImageOutputSchema,
  },
  async (input) => {
    console.log("Using Gemini 2.5 Flash Image Model");

    let designPrompt =
      input.printStyle === 'centered'
        ? `The clothing must feature a visually striking centered graphic based on: "${input.prompt}".`
        : `The clothing must feature a seamless all-over pattern based on: "${input.prompt}".`;

    const logoPrompt =
      input.includeLogo !== false
        ? ` Include a small, elegant embroidered logo reading "DAPI" on the left chest.`
        : '';

    const sleeveDescription =
      input.sleeveLength === 'full' ? 'long sleeves' : 'short sleeves';

    const clothingTypeName = input.clothingType.replace('-', ' ');

    const fullPrompt = `
Create a photorealistic product mockup of a high-quality ${input.clothingColor} ${clothingTypeName}
with ${sleeveDescription}. ${designPrompt}${logoPrompt}

CRITICAL REQUIREMENTS:
- The design must be printed directly onto the fabric (not floating or overlayed)
- It must follow fabric folds and curves realistically
- The design should distort naturally with the garment's shape
- It must look professionally printed using real textile printing methods
- Background must be clean, studio-lit, modern, and minimalistic
- Model faces must be out of frame
`;

    try {
      // ✅ Call Gemini 2.5 Flash Image
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-image",
        "imagen-4.0-generate-001"
      });

      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: fullPrompt }],
          },
        ],
      });

      const imagePart =
        result.response.candidates?.[0]?.content?.parts?.find(
          (p) => p.inlineData && p.inlineData.mimeType.startsWith("image/")
        );

      if (!imagePart) {
        throw new Error("Gemini 2.5 Flash returned no image.");
      }

      const dataUri = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;

      return { imageUrl: dataUri };
    } catch (error) {
      console.error('=== FINAL ERROR in generateDesignImageFlow ===');
      console.error(error);
      throw error;
    }
  }
);

module.exports = { generateDesignImage };


