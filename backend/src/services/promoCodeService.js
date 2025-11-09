const pool = require('../config/database');

class PromoCodeService {
  
  // Validate and apply promo code
  static async validatePromoCode(code, userEmail, orderTotal) {
    try {
      console.log('🎟️ Validating promo code:', code, 'for user:', userEmail);
      
      const result = await pool.query(
        `SELECT * FROM promo_codes 
         WHERE code = $1 
         AND is_active = true 
         AND (valid_until IS NULL OR valid_until > NOW())
         AND (max_uses IS NULL OR current_uses < max_uses)
         AND (user_email IS NULL OR user_email = $2)`,
        [code.toUpperCase(), userEmail]
      );

      if (result.rows.length === 0) {
        return {
          valid: false,
          message: 'Invalid or expired promo code'
        };
      }

      const promoCode = result.rows[0];
      let discountAmount = 0;

      // Calculate discount based on type
      if (promoCode.discount_type === 'percentage') {
        discountAmount = (orderTotal * promoCode.discount_value) / 100;
      } else if (promoCode.discount_type === 'fixed') {
        discountAmount = parseFloat(promoCode.discount_value);
      }

      // Ensure discount doesn't exceed order total
      discountAmount = Math.min(discountAmount, orderTotal);

      console.log('✅ Promo code valid. Discount:', discountAmount);

      return {
        valid: true,
        discountAmount: Math.round(discountAmount),
        discountType: promoCode.discount_type,
        discountValue: promoCode.discount_value,
        promoCodeId: promoCode.id,
        message: `Promo code applied! You saved ₹${Math.round(discountAmount)}`
      };
    } catch (error) {
      console.error('❌ Error validating promo code:', error.message);
      throw new Error(`Failed to validate promo code: ${error.message}`);
    }
  }

  // Increment promo code usage
  static async incrementPromoCodeUsage(promoCodeId) {
    try {
      await pool.query(
        'UPDATE promo_codes SET current_uses = current_uses + 1 WHERE id = $1',
        [promoCodeId]
      );
      console.log('✅ Promo code usage incremented');
    } catch (error) {
      console.error('❌ Error incrementing promo code usage:', error.message);
      throw error;
    }
  }

  // Create new promo code (admin function)
  static async createPromoCode(promoData) {
    try {
      const {
        code,
        discountType,
        discountValue,
        userEmail,
        maxUses,
        validUntil
      } = promoData;

      const result = await pool.query(
        `INSERT INTO promo_codes 
         (code, discount_type, discount_value, user_email, max_uses, valid_until) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id`,
        [
          code.toUpperCase(),
          discountType,
          discountValue,
          userEmail || null,
          maxUses || null,
          validUntil || null
        ]
      );

      console.log('✅ Created promo code:', result.rows[0].id);
      return result.rows[0].id.toString();
    } catch (error) {
      console.error('❌ Error creating promo code:', error.message);
      throw new Error(`Failed to create promo code: ${error.message}`);
    }
  }

  // Get all promo codes (admin function)
  static async getAllPromoCodes() {
    try {
      const result = await pool.query(
        'SELECT * FROM promo_codes ORDER BY created_at DESC'
      );

      return result.rows.map(row => ({
        id: row.id.toString(),
        code: row.code,
        discountType: row.discount_type,
        discountValue: row.discount_value,
        userEmail: row.user_email,
        maxUses: row.max_uses,
        currentUses: row.current_uses,
        validFrom: row.valid_from,
        validUntil: row.valid_until,
        isActive: row.is_active,
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error('❌ Error fetching promo codes:', error.message);
      throw error;
    }
  }

  // Deactivate promo code
  static async deactivatePromoCode(promoCodeId) {
    try {
      await pool.query(
        'UPDATE promo_codes SET is_active = false WHERE id = $1',
        [promoCodeId]
      );
      console.log('✅ Promo code deactivated');
    } catch (error) {
      console.error('❌ Error deactivating promo code:', error.message);
      throw error;
    }
  }
}

module.exports = { PromoCodeService };


