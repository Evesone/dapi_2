const express = require('express');
const router = express.Router();
const { AIService } = require('../services/aiService');

// Test endpoint to verify AI routes are working
router.get('/test', (req, res) => {
  res.json({ 
    message: 'AI routes are working!',
    timestamp: new Date().toISOString(),
    hasGoogleAI: process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY !== 'your_google_ai_api_key_here'
  });
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
    return res.status(500).json({
      error: 'Failed to generate design image'
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
