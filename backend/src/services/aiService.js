// Import the real AI flows
const { generateDesignIdeas } = require('../ai/flows/generate-design-ideas');
const { generateDesignImage } = require('../ai/flows/generate-design-image');

// Check if Google AI API key is available
const hasGoogleAI = process.env.GOOGLE_AI_API_KEY && 
                   process.env.GOOGLE_AI_API_KEY !== 'your_google_ai_api_key_here' &&
                   process.env.GOOGLE_AI_API_KEY.trim() !== '';

console.log('AI Service Status:', {
  hasGoogleAI,
  apiKeyLength: process.env.GOOGLE_AI_API_KEY ? process.env.GOOGLE_AI_API_KEY.length : 0,
  nodeEnv: process.env.NODE_ENV
});

class AIService {
  static async generateDesignIdeas({ prompt }) {
    try {
      console.log('Generating design ideas with prompt:', prompt);
      console.log('hasGoogleAI:', hasGoogleAI);
      
      if (hasGoogleAI) {
        // Use the real AI flow for generating design ideas
        console.log('Using real AI service for design ideas');
        const result = await generateDesignIdeas({ prompt });
        console.log('AI service result:', result);
        return result;
      } else {
        // Fallback to basic design ideas when AI is not configured
        console.log('Using fallback design ideas (AI not configured)');
        const designIdeas = [
          `${prompt} with modern minimalist style`,
          `${prompt} with vintage retro vibes`,
          `${prompt} with abstract artistic elements`
        ];

        return {
          designIdeas
        };
      }
    } catch (error) {
      console.error('Error generating design ideas:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      
      // Return fallback on error
      const designIdeas = [
        `${prompt} with modern minimalist style`,
        `${prompt} with vintage retro vibes`,
        `${prompt} with abstract artistic elements`
      ];

      return {
        designIdeas
      };
    }
  }

  static async generateDesignImage({ prompt, category, clothingType, sleeveLength, clothingColor, printStyle, style, printLocation, includeLogo }) {
    try {
      console.log('Generating design image with params:', { prompt, clothingType, clothingColor, printStyle, sleeveLength, includeLogo });
      console.log('hasGoogleAI:', hasGoogleAI);
      
      if (hasGoogleAI) {
        // Use the real AI flow for generating design images
        console.log('Using real AI service for design image');
        const result = await generateDesignImage({ 
          prompt, 
          clothingType, 
          clothingColor, 
          printStyle, 
          sleeveLength,
          includeLogo
        });
        console.log('AI image generation result:', result);
        return result;
      } else {
        // Fallback to placeholder when AI is not configured
        console.log('Using fallback image (AI not configured)');
        const imageUrl = `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`;
        
        return {
          imageUrl
        };
      }
    } catch (error) {
      console.error('Error generating design image:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      
      // Return fallback on error
      const imageUrl = `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`;
      
      return {
        imageUrl
      };
    }
  }

  static async generateAvatarViews({ userPhoto, designImage, clothingType }) {
    try {
      // This is a placeholder implementation
      // In a real implementation, you would use the actual AI service to generate avatar views
      const frontViewUrl = `https://picsum.photos/300/400?random=${Math.floor(Math.random() * 1000)}`;
      const sideViewUrl = `https://picsum.photos/300/400?random=${Math.floor(Math.random() * 1000)}`;
      const backViewUrl = `https://picsum.photos/300/400?random=${Math.floor(Math.random() * 1000)}`;

      return {
        frontViewUrl,
        sideViewUrl,
        backViewUrl
      };
    } catch (error) {
      console.error('Error generating avatar views:', error);
      throw error;
    }
  }
}

module.exports = { AIService };
