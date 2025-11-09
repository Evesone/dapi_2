const { ai } = require('../genkit');
const { z } = require('genkit');

const GenerateDesignIdeasInputSchema = z.object({
  prompt: z.string().describe('A text prompt describing the desired design.'),
});

const GenerateDesignIdeasOutputSchema = z.object({
  designIdeas: z
    .array(z.string())
    .describe('An array of AI-generated design ideas based on the prompt.'),
});

async function generateDesignIdeas(input) {
  return generateDesignIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDesignIdeasPrompt',
  input: {schema: GenerateDesignIdeasInputSchema},
  output: {schema: GenerateDesignIdeasOutputSchema},
  prompt: `You are a creative design assistant.  Generate several distinct and creative design ideas based on the following prompt. Return the design ideas as a JSON array of strings.\n\nPrompt: {{{prompt}}}`,
});

const generateDesignIdeasFlow = ai.defineFlow(
  {
    name: 'generateDesignIdeasFlow',
    inputSchema: GenerateDesignIdeasInputSchema,
    outputSchema: GenerateDesignIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output;
  }
);

module.exports = { generateDesignIdeas };
