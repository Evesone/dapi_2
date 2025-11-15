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
      console.log('=== AIService.generateDesignImage START ===');
      console.log('Params:', { prompt, clothingType, clothingColor, printStyle, sleeveLength, includeLogo });
      console.log('hasGoogleAI:', hasGoogleAI);
      console.log('GOOGLE_AI_API_KEY exists:', !!process.env.GOOGLE_AI_API_KEY);
      console.log('GOOGLE_AI_API_KEY length:', process.env.GOOGLE_AI_API_KEY ? process.env.GOOGLE_AI_API_KEY.length : 0);
<<<<<<< HEAD
=======
      console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
>>>>>>> 278d4a0d950422d50193d65d3e8906f3e8100487
      
      // Always try to use AI if either key is available
      const hasOpenAI = process.env.OPENAI_API_KEY && 
                        process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' &&
                        process.env.OPENAI_API_KEY.trim() !== '';
      
      if (hasGoogleAI || hasOpenAI) {
        // Use the real AI flow for generating design images
<<<<<<< HEAD
        console.log('Attempting AI image generation with Gemini...');
=======
        console.log('Attempting AI image generation...');
        console.log('Will try Gemini:', hasGoogleAI);
        console.log('Will try DALL-E as fallback:', hasOpenAI);
>>>>>>> 278d4a0d950422d50193d65d3e8906f3e8100487
        
        try {
          const result = await generateDesignImage({ 
            prompt, 
            clothingType, 
            clothingColor, 
            printStyle, 
            sleeveLength,
            includeLogo
          });
          console.log('✅ AI image generation SUCCESS');
          console.log('Result imageUrl length:', result?.imageUrl?.length || 0);
          console.log('Result imageUrl preview:', result?.imageUrl?.substring(0, 100) || 'N/A');
          return result;
        } catch (aiError) {
          console.error('❌ AI image generation FAILED');
          console.error('Error:', aiError.message);
          // Re-throw so the route can handle it properly
          throw aiError;
        }
      } else {
        // No API keys configured - return error instead of placeholder
        console.error('❌ No AI API keys configured!');
<<<<<<< HEAD
        console.error('Please set GOOGLE_AI_API_KEY in environment variables');
        throw new Error('AI image generation is not configured. Please set GOOGLE_AI_API_KEY in your environment variables.');
=======
        console.error('Please set GOOGLE_AI_API_KEY or OPENAI_API_KEY in environment variables');
        throw new Error('AI image generation is not configured. Please set GOOGLE_AI_API_KEY or OPENAI_API_KEY in your environment variables.');
>>>>>>> 278d4a0d950422d50193d65d3e8906f3e8100487
      }
    } catch (error) {
      console.error('=== ERROR in AIService.generateDesignImage ===');
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
      console.error('Error stack:', error.stack);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
      }
      if (error.cause) {
        console.error('Error cause:', error.cause);
      }
      
      // Re-throw the error so it can be properly handled by the route
      throw error;
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
