const OpenAI = require('openai');

// Check if OpenAI API key is available
const hasOpenAI = process.env.OPENAI_API_KEY && 
                 process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' &&
                 process.env.OPENAI_API_KEY.trim() !== '';

let openai = null;

if (hasOpenAI) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

console.log('Image Generation Service Status:', {
  hasOpenAI,
  apiKeyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
  nodeEnv: process.env.NODE_ENV
});

class ImageGenerationService {
  /**
   * Generate an image using OpenAI DALL-E 3
   * @param {string} prompt - The text prompt describing the image to generate
   * @returns {Promise<{imageUrl: string}>} - Object containing the generated image URL
   */
  static async generateImageWithDALLE(prompt) {
    if (!hasOpenAI) {
      throw new Error('OpenAI API key is not configured');
    }

    try {
      console.log('Generating image with DALL-E 3, prompt length:', prompt.length);
      
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        response_format: 'url',
      });

      if (!response.data || !response.data[0] || !response.data[0].url) {
        throw new Error('Failed to generate image: No image URL in response');
      }

      const imageUrl = response.data[0].url;
      console.log('Image generated successfully, URL length:', imageUrl.length);

      return {
        imageUrl: imageUrl,
      };
    } catch (error) {
      console.error('Error generating image with DALL-E:', error);
      console.error('Error details:', error.message);
      if (error.response) {
        console.error('OpenAI API response:', error.response.data);
      }
      throw error;
    }
  }

  /**
   * Generate a design image for clothing with proper prompt formatting
   * @param {Object} params - Design parameters
   * @param {string} params.prompt - Design description
   * @param {string} params.clothingType - Type of clothing (e.g., 't-shirt', 'hoodie')
   * @param {string} params.clothingColor - Color of the clothing
   * @param {string} params.printStyle - 'centered' or 'pattern'
   * @param {string} params.sleeveLength - 'half' or 'full'
   * @param {boolean} params.includeLogo - Whether to include logo
   * @returns {Promise<{imageUrl: string}>} - Object containing the generated image URL
   */
  static async generateDesignImage({ prompt, clothingType, clothingColor, printStyle, sleeveLength, includeLogo }) {
    let designPrompt;
    if (printStyle === 'centered') {
      designPrompt = `The clothing must feature a visually striking, professionally-made, centered graphic design based on this description: "${prompt}".`;
    } else {
      // 'pattern'
      designPrompt = `The clothing must feature an attractive, seamless, all-over repeating pattern based on this description: "${prompt}". The pattern should cover the entire garment uniformly.`;
    }
    
    let clothingTypeName = clothingType.replace('-', ' ');
    let sleeveDescription = sleeveLength === 'full' ? 'long sleeves' : 'short sleeves';
    
    // Only include logo if explicitly requested (defaults to true if not specified)
    const shouldIncludeLogo = includeLogo !== false;
    const logoDescription = shouldIncludeLogo 
      ? ` A small, subtle embroidered logo with the text "DAPI" is placed on the left chest area.`
      : '';

    // DALL-E 3 optimized prompt (max 4000 characters, works best with clear, descriptive prompts)
    const fullPrompt = `Photorealistic product photography of a high-quality ${clothingColor} ${clothingTypeName} with ${sleeveDescription}. ${designPrompt}${logoDescription}

The design is directly printed onto the fabric surface. The graphic follows the natural curves and folds of the garment, showing realistic fabric texture and distortion. The design appears as an integral part of the fabric, not a sticker or overlay. Professional product photography with clean white background, soft studio lighting, realistic shadows and highlights. The garment is displayed on a mannequin or hanger. High quality, modern, commercial product image.`;

    return await this.generateImageWithDALLE(fullPrompt);
  }
}

module.exports = { ImageGenerationService };

