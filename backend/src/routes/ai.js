const express = require('express');
const router = express.Router();
const { AIService } = require('../services/aiService');

// Test endpoint to verify AI routes are working
router.get('/test', (req, res) => {
  const hasGoogleAI = process.env.GOOGLE_AI_API_KEY && 
                      process.env.GOOGLE_AI_API_KEY !== 'your_google_ai_api_key_here' &&
                      process.env.GOOGLE_AI_API_KEY.trim() !== '';
  const hasOpenAI = process.env.OPENAI_API_KEY && 
                    process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' &&
                    process.env.OPENAI_API_KEY.trim() !== '';
  
  res.json({ 
    message: 'AI routes are working!',
    timestamp: new Date().toISOString(),
    apiKeys: {
      hasGoogleAI,
      googleAIKeyLength: process.env.GOOGLE_AI_API_KEY ? process.env.GOOGLE_AI_API_KEY.length : 0,
      hasOpenAI,
      openAIKeyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
    },
    nodeEnv: process.env.NODE_ENV
  });
});

// Debug endpoint to test image generation
router.post('/debug-image-generation', async (req, res) => {
  try {
    console.log('=== DEBUG: Image Generation Test ===');
    
    const hasGoogleAI = process.env.GOOGLE_AI_API_KEY && 
                        process.env.GOOGLE_AI_API_KEY !== 'your_google_ai_api_key_here' &&
                        process.env.GOOGLE_AI_API_KEY.trim() !== '';
    const hasOpenAI = process.env.OPENAI_API_KEY && 
                      process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' &&
                      process.env.OPENAI_API_KEY.trim() !== '';
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      apiKeys: {
        hasGoogleAI,
        googleAIKeyPrefix: process.env.GOOGLE_AI_API_KEY ? process.env.GOOGLE_AI_API_KEY.substring(0, 10) + '...' : 'NOT SET',
        hasOpenAI,
        openAIKeyPrefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'NOT SET',
      },
      testParams: {
        prompt: req.body.prompt || 'a simple geometric design',
        clothingType: req.body.clothingType || 't-shirt',
        clothingColor: req.body.clothingColor || 'white',
        printStyle: req.body.printStyle || 'centered',
        sleeveLength: req.body.sleeveLength || 'half',
      }
    };

    console.log('Debug Info:', JSON.stringify(debugInfo, null, 2));

    if (!hasGoogleAI && !hasOpenAI) {
      return res.status(400).json({
        ...debugInfo,
        error: 'No API keys configured. Please set GOOGLE_AI_API_KEY or OPENAI_API_KEY in your .env file'
      });
    }

    // Try to generate a test image
    const testResult = await AIService.generateDesignImage({
      prompt: debugInfo.testParams.prompt,
      category: 'test',
      clothingType: debugInfo.testParams.clothingType,
      sleeveLength: debugInfo.testParams.sleeveLength,
      clothingColor: debugInfo.testParams.clothingColor,
      printStyle: debugInfo.testParams.printStyle,
      style: 'modern',
      printLocation: 'front',
      includeLogo: false
    });

    return res.json({
      ...debugInfo,
      success: true,
      result: testResult
    });
  } catch (error) {
    console.error('=== DEBUG: Error ===', error);
    return res.status(500).json({
      error: 'Debug test failed',
      message: error.message,
      stack: error.stack,
      details: error.response?.data || error.response || 'No additional details'
    });
  }
});

// Generate design ideas
router.post('/generate-design-ideas', async (req, res) => {
  try {
    console.log('Received request to /api/ai/generate-design-ideas');
    console.log('Request body:', req.body);
    
    const { prompt } = req.body;

    if (!prompt) {
      console.log('Error: Prompt is required');
      return res.status(400).json({
        error: 'Prompt is required'
      });
    }

    console.log('Calling AIService.generateDesignIdeas with prompt:', prompt);
    const result = await AIService.generateDesignIdeas({ prompt });
    console.log('AIService result:', result);
    
    return res.json(result);
  } catch (error) {
    console.error('Error generating design ideas:', error);
    return res.status(500).json({
      error: 'Failed to generate design ideas'
    });
  }
});

// Generate design image
router.post('/generate-design-image', async (req, res) => {
  try {
    console.log('Received request to /api/ai/generate-design-image');
    console.log('Request body size:', JSON.stringify(req.body).length, 'bytes');
    console.log('Request body:', req.body);
    
    const { prompt, category, clothingType, sleeveLength, clothingColor, printStyle, style, printLocation, includeLogo } = req.body;

    if (!prompt || !category || !clothingType || !sleeveLength || !clothingColor || !printStyle || !style || !printLocation) {
      console.log('Error: Missing required parameters');
      return res.status(400).json({
        error: 'All design parameters are required'
      });
    }

    console.log('Calling AIService.generateDesignImage with params:', {
      prompt, category, clothingType, sleeveLength, clothingColor, printStyle, style, printLocation, includeLogo
    });
    
    const result = await AIService.generateDesignImage({
      prompt,
      category,
      clothingType,
      sleeveLength,
      clothingColor,
      printStyle,
      style,
      printLocation,
      includeLogo
    });

    console.log('AIService result size:', JSON.stringify(result).length, 'bytes');
    console.log('AIService result:', result);
    
    // Set response headers to handle large responses
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    return res.json(result);
  } catch (error) {
    console.error('Error generating design image:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      error: 'Failed to generate design image',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Generate avatar views
router.post('/generate-avatar-views', async (req, res) => {
  try {
    const { userPhoto, designImage, clothingType } = req.body;

    if (!userPhoto || !designImage || !clothingType) {
      return res.status(400).json({
        error: 'User photo, design image, and clothing type are required'
      });
    }

    const result = await AIService.generateAvatarViews({
      userPhoto,
      designImage,
      clothingType
    });

    return res.json(result);
  } catch (error) {
    console.error('Error generating avatar views:', error);
    return res.status(500).json({
      error: 'Failed to generate avatar views'
    });
  }
});

module.exports = router;
