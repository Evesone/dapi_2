// Script to add sample promo codes to the database
// Run with: node src/scripts/addSamplePromoCodes.js

const { PromoCodeService } = require('../services/promoCodeService');

async function addSamplePromoCodes() {
  try {
    console.log('Adding sample promo codes...');

    // 1. General discount - 10% off
    await PromoCodeService.createPromoCode({
      code: 'WELCOME10',
      discountType: 'percentage',
      discountValue: 10,
      userEmail: null, // Available to all users
      maxUses: null, // Unlimited uses
      validUntil: null // Never expires
    });
    console.log('✅ Created WELCOME10 - 10% off for all users');

    // 2. Fixed discount - ₹100 off
    await PromoCodeService.createPromoCode({
      code: 'SAVE100',
      discountType: 'fixed',
      discountValue: 100,
      userEmail: null,
      maxUses: 100, // Limited to 100 uses
      validUntil: null
    });
    console.log('✅ Created SAVE100 - ₹100 off, max 100 uses');

    // 3. First order discount - 15% off
    await PromoCodeService.createPromoCode({
      code: 'FIRST15',
      discountType: 'percentage',
      discountValue: 15,
      userEmail: null,
      maxUses: null,
      validUntil: null
    });
    console.log('✅ Created FIRST15 - 15% off for first orders');

    // 4. Big discount - 20% off
    await PromoCodeService.createPromoCode({
      code: 'MEGA20',
      discountType: 'percentage',
      discountValue: 20,
      userEmail: null,
      maxUses: 50, // Limited to 50 uses
      validUntil: null
    });
    console.log('✅ Created MEGA20 - 20% off, max 50 uses');

    // 5. Fixed high discount - ₹200 off
    await PromoCodeService.createPromoCode({
      code: 'FLAT200',
      discountType: 'fixed',
      discountValue: 200,
      userEmail: null,
      maxUses: 25,
      validUntil: null
    });
    console.log('✅ Created FLAT200 - ₹200 off, max 25 uses');

    console.log('\n🎉 All sample promo codes added successfully!');
    console.log('\nAvailable codes:');
    console.log('- WELCOME10: 10% off (unlimited)');
    console.log('- SAVE100: ₹100 off (100 uses)');
    console.log('- FIRST15: 15% off (unlimited)');
    console.log('- MEGA20: 20% off (50 uses)');
    console.log('- FLAT200: ₹200 off (25 uses)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding promo codes:', error.message);
    process.exit(1);
  }
}

addSamplePromoCodes();


