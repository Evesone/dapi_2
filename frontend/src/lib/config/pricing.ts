// Base pricing configuration - easily editable
export const PRICING_CONFIG = {
  // Base prices for different clothing types organized by gender (in INR)
  // Based on detailed cost table: Base Cost + Print Cost + Shipping + Production Cost
  basePrices: {
    // Men's Clothing
    "men-half-sleeves-t-shirt": 381,       // ₹381 (prepaid front print)
    "men-full-sleeves-t-shirt": 426,       // ₹426 (prepaid front print)
    "men-polo-half-sleeves": 576,          // ₹576 (prepaid front print)
    "men-dry-fit-polo": 501,               // ₹501 (prepaid front print)
    "men-acid-wash-t-shirt": 651,          // ₹651 (prepaid front print)
    "men-stripe-polo-t-shirt": 666,        // ₹666 (prepaid, no print)
    
    // Women's Clothing
    "women-half-sleeves-t-shirt": 381,     // ₹381 (prepaid front print)
    "women-crop-top": 351,                 // ₹351 (prepaid front print)
    "women-cropped-hoodies": 636,          // ₹636 (prepaid front print)
    "women-t-shirt-dress": 561,            // ₹561 (prepaid front print)
    
    // Unisex Clothing
    "unisex-hip-hop-oversized-t-shirt": 501, // ₹501 (prepaid front print)
    "unisex-hoodies": 897,                 // ₹897 (prepaid front print)
    "unisex-sweatshirt": 747,              // ₹747 (prepaid front print)
    
    // Legacy support (keeping old keys for backward compatibility)
    't-shirt': 381,
    'hoodie': 897,
    'sweatshirt': 747,
    'tank-top': 351,
    'long-sleeve': 426,
  },

  // Print style costs (additional cost on top of base price) in INR
  printCosts: {
    'centered': 0,           // No additional cost for centered prints
    'pattern': 85,           // ₹85 additional for pattern prints
    'full-coverage': 125,    // ₹125 additional for full coverage prints
  },

  // Available colors for each clothing type
  availableColors: {
    // Men's Clothing Colors
    "men-half-sleeves-t-shirt": ['yellow', 'red', 'light-gray', 'light-blue', 'tan', 'light-purple', 'dark-purple', 'light-green', 'pink', 'dark-brown', 'orange', 'light-pink', 'black', 'white', 'olive-green', 'dark-blue', 'maroon', 'royal-blue', 'light-yellow', 'lime-green', 'gold', 'teal', 'light-peach', 'dark-gray'],
    "men-full-sleeves-t-shirt": ['black', 'light-gray', 'dark-blue', 'white'],
    "men-polo-half-sleeves": ['dark-purple', 'dark-brown', 'black', 'dark-blue', 'white', 'maroon', 'gold'],
    "men-dry-fit-polo": ['black', 'dark-green', 'navy', 'red', 'yellow', 'light-gray', 'dark-blue', 'white', 'maroon', 'light-purple'],
    "men-acid-wash-t-shirt": ['maroon', 'black', 'dark-blue', 'olive-green'],
    "men-stripe-polo-t-shirt": ['dark-purple', 'dark-brown', 'black', 'dark-blue', 'white', 'maroon', 'gold'],
    
    // Women's Clothing Colors
    "women-half-sleeves-t-shirt": ['yellow', 'red', 'light-gray', 'light-blue', 'tan', 'light-purple', 'dark-purple', 'light-green', 'pink', 'dark-brown', 'orange', 'light-pink', 'black', 'white', 'olive-green', 'dark-blue', 'maroon', 'royal-blue', 'light-yellow', 'lime-green', 'gold', 'teal', 'light-peach', 'dark-gray'],
    "women-crop-top": ['yellow', 'red', 'light-gray', 'light-blue', 'tan', 'light-purple', 'dark-purple', 'light-green', 'pink', 'dark-brown', 'orange', 'light-pink', 'black', 'white', 'olive-green', 'dark-blue', 'maroon', 'royal-blue', 'light-yellow', 'lime-green', 'gold', 'teal', 'light-peach', 'dark-gray'],
    "women-cropped-hoodies": ['black', 'maroon', 'dark-blue', 'olive-green', 'light-purple', 'light-gray', 'red', 'dark-teal', 'gold'],
    "women-t-shirt-dress": ['yellow', 'red', 'light-gray', 'light-blue', 'tan', 'light-purple', 'dark-purple', 'light-green', 'pink', 'dark-brown', 'orange', 'light-pink', 'black', 'white', 'olive-green', 'dark-blue', 'maroon', 'royal-blue', 'light-yellow', 'lime-green', 'gold', 'teal', 'light-peach', 'dark-gray'],
    
    // Unisex Clothing Colors
    "unisex-hip-hop-oversized-t-shirt": ['medium-blue', 'dark-gray', 'olive-green', 'white', 'black'],
    "unisex-hoodies": ['black', 'maroon', 'dark-blue', 'olive-green', 'light-purple', 'light-gray', 'red', 'dark-teal', 'gold'],
    "unisex-sweatshirt": ['black', 'olive-green', 'dark-blue', 'gold', 'maroon', 'light-purple'],
    
    // Legacy support
    't-shirt': ['yellow', 'red', 'light-gray', 'light-blue', 'tan', 'light-purple', 'dark-purple', 'light-green', 'pink', 'dark-brown', 'orange', 'light-pink', 'black', 'white', 'olive-green', 'dark-blue', 'maroon', 'royal-blue', 'light-yellow', 'lime-green', 'gold', 'teal', 'light-peach', 'dark-gray'],
    'hoodie': ['black', 'maroon', 'dark-blue', 'olive-green', 'light-purple', 'light-gray', 'red', 'dark-teal', 'gold'],
    'sweatshirt': ['black', 'olive-green', 'dark-blue', 'gold', 'maroon', 'light-purple'],
    'tank-top': ['yellow', 'red', 'light-gray', 'light-blue', 'tan', 'light-purple', 'dark-purple', 'light-green', 'pink', 'dark-brown', 'orange', 'light-pink', 'black', 'white', 'olive-green', 'dark-blue', 'maroon', 'royal-blue', 'light-yellow', 'lime-green', 'gold', 'teal', 'light-peach', 'dark-gray'],
    'long-sleeve': ['black', 'light-gray', 'dark-blue', 'white'],
  },

  // Color multipliers (white and black are base price, others cost more)
  colorMultipliers: {
    'white': 1.0,      // Base price
    'black': 1.0,      // Base price
    'navy': 1.15,      // 15% more
    'gray': 1.1,       // 10% more
    'light-gray': 1.1, // 10% more
    'dark-gray': 1.15, // 15% more
    'red': 1.2,        // 20% more
    'blue': 1.15,      // 15% more
    'light-blue': 1.15, // 15% more
    'dark-blue': 1.15, // 15% more
    'royal-blue': 1.15, // 15% more
    'green': 1.2,      // 20% more
    'light-green': 1.2, // 20% more
    'olive-green': 1.2, // 20% more
    'lime-green': 1.2, // 20% more
    'yellow': 1.25,    // 25% more
    'light-yellow': 1.25, // 25% more
    'gold': 1.25,      // 25% more
    'pink': 1.2,       // 20% more
    'light-pink': 1.2, // 20% more
    'purple': 1.25,    // 25% more
    'light-purple': 1.25, // 25% more
    'dark-purple': 1.25, // 25% more
    'orange': 1.2,     // 20% more
    'brown': 1.15,     // 15% more
    'dark-brown': 1.15, // 15% more
    'tan': 1.1,        // 10% more
    'maroon': 1.2,     // 20% more
    'teal': 1.2,       // 20% more
    'dark-teal': 1.2,  // 20% more
    'light-peach': 1.1, // 10% more
    'medium-blue': 1.15, // 15% more
    'dark-green': 1.2, // 20% more
  },

  // Print style multipliers
  printStyleMultipliers: {
    'centered': 1.0,           // Base price
    'pattern': 1.5,            // 50% more for pattern
    'full-coverage': 2.5,      // 150% more for full coverage
  },

  // Size pricing (if needed)
  sizeMultipliers: {
    'XS': 0.95,    // 5% less
    'S': 1.0,      // Base price
    'M': 1.0,      // Base price
    'L': 1.0,      // Base price
    'XL': 1.05,    // 5% more
    'XXL': 1.1,    // 10% more
    'XXXL': 1.15,  // 15% more
  },

  // Fixed costs based on the cost table (in INR)
  fixedCosts: {
    // Shipping costs based on weight (per 500g)
    shipping: {
      'light': 54,      // ₹54 for items up to 500g (prepaid)
      'heavy': 108,     // ₹108 for items 500g-1000g (prepaid)
    },
    // GST rates based on product value
    taxRates: {
      low: 0.05,  // 5% GST for products < ₹2500
      high: 0.18, // 18% GST for products >= ₹2500
    },
    taxThreshold: 2500, // Threshold for GST rate change
    deliveryChargePerItem: 20, // ₹20 delivery charge per product
  },

  // Weight categories for shipping calculation
  itemWeights: {
    "men-half-sleeves-t-shirt": 'light',      // 250g
    "men-full-sleeves-t-shirt": 'light',      // 290g
    "men-polo-half-sleeves": 'light',         // 290g
    "men-dry-fit-polo": 'light',              // 290g
    "men-acid-wash-t-shirt": 'light',         // 350g
    "men-stripe-polo-t-shirt": 'light',       // 290g
    "women-half-sleeves-t-shirt": 'light',    // 250g
    "women-crop-top": 'light',                // 250g
    "women-cropped-hoodies": 'light',         // 480g
    "women-t-shirt-dress": 'light',           // 250g
    "unisex-hip-hop-oversized-t-shirt": 'light', // 350g
    "unisex-hoodies": 'heavy',                // 750g
    "unisex-sweatshirt": 'heavy',             // 650g
    // Legacy
    't-shirt': 'light',
    'hoodie': 'heavy',
    'sweatshirt': 'heavy',
    'tank-top': 'light',
    'long-sleeve': 'light',
  },
};

// Helper function to calculate item price
export function calculateItemPrice(
  clothingType: string,
  color: string,
  printStyle: string,
  size: string = 'M'
): number {
  const basePrice = PRICING_CONFIG.basePrices[clothingType as keyof typeof PRICING_CONFIG.basePrices] || 381;
  const colorMultiplier = PRICING_CONFIG.colorMultipliers[color as keyof typeof PRICING_CONFIG.colorMultipliers] || 1.0;
  const printCost = PRICING_CONFIG.printCosts[printStyle as keyof typeof PRICING_CONFIG.printCosts] || 0;
  const sizeMultiplier = PRICING_CONFIG.sizeMultipliers[size as keyof typeof PRICING_CONFIG.sizeMultipliers] || 1.0;

  return (basePrice + printCost) * colorMultiplier * sizeMultiplier;
}

// Helper function to calculate order totals
export function calculateOrderTotals(items: any[]): {
  subtotal: number;
  tax: number;
  shipping: number;
  delivery: number;
  total: number;
} {
  let subtotal = 0;
  let totalTax = 0;
  let totalDelivery = 0;

  // Calculate subtotal, tax, and delivery charges per item
  items.forEach(item => {
    const itemPrice = calculateItemPrice(
      item.clothingType || 't-shirt',
      item.clothingColor || 'white',
      item.printStyle || 'centered',
      item.size || 'M'
    );
    
    const itemSubtotal = itemPrice * item.quantity;
    subtotal += itemSubtotal;

    // Calculate GST per item based on individual product price
    // If individual product price < ₹2500: 5% GST
    // If individual product price >= ₹2500: 18% GST
    const gstRate = itemPrice < PRICING_CONFIG.fixedCosts.taxThreshold 
      ? PRICING_CONFIG.fixedCosts.taxRates.low 
      : PRICING_CONFIG.fixedCosts.taxRates.high;
    
    const itemTax = itemSubtotal * gstRate;
    totalTax += itemTax;

    // Add delivery charge per product (₹20 per item)
    const itemDelivery = PRICING_CONFIG.fixedCosts.deliveryChargePerItem * item.quantity;
    totalDelivery += itemDelivery;
  });

  // Calculate shipping based on item weights
  const totalWeight = items.reduce((sum, item) => {
    const weight = PRICING_CONFIG.itemWeights[item.clothingType as keyof typeof PRICING_CONFIG.itemWeights] || 'light';
    const weightMultiplier = weight === 'heavy' ? 1.5 : 1; // Heavy items cost more
    return sum + (weightMultiplier * item.quantity);
  }, 0);

  const baseShipping = PRICING_CONFIG.fixedCosts.shipping.light;
  const shipping = Math.ceil(totalWeight) * baseShipping; // Round up to next weight category

  const total = subtotal + totalTax + shipping + totalDelivery;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(totalTax * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    delivery: Math.round(totalDelivery * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

// Get price display for UI
export function getPriceDisplay(
  clothingType: string,
  color: string,
  printStyle: string,
  size: string = 'M'
): string {
  const price = calculateItemPrice(clothingType, color, printStyle, size);
  return `₹${price.toFixed(0)}`;
}

// Get price breakdown for UI
export function getPriceBreakdown(
  clothingType: string,
  color: string,
  printStyle: string,
  size: string = 'M'
): {
  basePrice: number;
  sizeSurcharge: number;
  total: number;
} {
  const basePrice = PRICING_CONFIG.basePrices[clothingType as keyof typeof PRICING_CONFIG.basePrices] || 381;
  const printCost = PRICING_CONFIG.printCosts[printStyle as keyof typeof PRICING_CONFIG.printCosts] || 0;
  const colorMultiplier = PRICING_CONFIG.colorMultipliers[color as keyof typeof PRICING_CONFIG.colorMultipliers] || 1.0;
  const sizeMultiplier = PRICING_CONFIG.sizeMultipliers[size as keyof typeof PRICING_CONFIG.sizeMultipliers] || 1.0;

  // Combine base price, print cost, and color surcharge into one base price
  const basePriceWithColorAndPrint = (basePrice + printCost) * colorMultiplier;
  const sizeSurcharge = basePriceWithColorAndPrint * (sizeMultiplier - 1);
  const total = (basePrice + printCost) * colorMultiplier * sizeMultiplier;

  return {
    basePrice: Math.round(basePriceWithColorAndPrint),
    sizeSurcharge: Math.round(sizeSurcharge),
    total: Math.round(total),
  };
}

// Get available colors for a specific clothing type
export function getAvailableColors(clothingType: string): string[] {
  return PRICING_CONFIG.availableColors[clothingType as keyof typeof PRICING_CONFIG.availableColors] || ['white', 'black'];
}

// Get all clothing types organized by category
export function getClothingTypesByCategory(): {
  mens: string[];
  womens: string[];
  unisex: string[];
} {
  return {
    mens: [
      "men-half-sleeves-t-shirt",
      "men-full-sleeves-t-shirt", 
      "men-polo-half-sleeves",
      "men-dry-fit-polo",
      "men-acid-wash-t-shirt",
      "men-stripe-polo-t-shirt"
    ],
    womens: [
      "women-half-sleeves-t-shirt",
      "women-crop-top",
      "women-cropped-hoodies", 
      "women-t-shirt-dress"
    ],
    unisex: [
      "unisex-hip-hop-oversized-t-shirt",
      "unisex-hoodies",
      "unisex-sweatshirt"
    ]
  };
}
