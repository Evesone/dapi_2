const express = require('express');
const router = express.Router();
const { PromoCodeService } = require('../services/promoCodeService');

// Validate promo code
router.post('/validate', async (req, res) => {
  try {
    const { code, userEmail, orderTotal } = req.body;

    if (!code || !orderTotal) {
      return res.status(400).json({
        error: 'Missing required fields: code and orderTotal'
      });
    }

    const result = await PromoCodeService.validatePromoCode(
      code,
      userEmail || null,
      orderTotal
    );

    return res.json(result);
  } catch (error) {
    console.error('Error validating promo code:', error);
    return res.status(500).json({
      error: 'Failed to validate promo code',
      message: error.message
    });
  }
});

// Create promo code (admin only)
router.post('/', async (req, res) => {
  try {
    const promoCodeId = await PromoCodeService.createPromoCode(req.body);
    
    return res.status(201).json({
      success: true,
      promoCodeId,
      message: 'Promo code created successfully'
    });
  } catch (error) {
    console.error('Error creating promo code:', error);
    
    if (error.message.includes('duplicate key')) {
      return res.status(400).json({
        error: 'Promo code already exists'
      });
    }
    
    return res.status(500).json({
      error: 'Failed to create promo code'
    });
  }
});

// Get all promo codes (admin only)
router.get('/', async (req, res) => {
  try {
    const promoCodes = await PromoCodeService.getAllPromoCodes();
    return res.json({ promoCodes });
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return res.status(500).json({
      error: 'Failed to fetch promo codes'
    });
  }
});

// Deactivate promo code (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await PromoCodeService.deactivatePromoCode(id);
    
    return res.json({
      success: true,
      message: 'Promo code deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating promo code:', error);
    return res.status(500).json({
      error: 'Failed to deactivate promo code'
    });
  }
});

module.exports = router;


