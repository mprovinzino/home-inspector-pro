/**
 * Calculate the maximum suggested offer price
 * @param {number} arv - After Repair Value
 * @param {number} rehabCost - Total rehab cost
 * @returns {number} Maximum suggested offer price
 */
export const calculateMaxOffer = (arv, rehabCost) => {
  // 70% ARV formula
  return Math.round(arv * 0.7 - rehabCost);
};

/**
 * Calculate quick rehab estimate based on property details and rehab level
 * @param {object} property - Property details
 * @param {string} rehabLevel - "light", "mid", or "full"
 * @returns {object} Rehab estimate details
 */
export const calculateQuickEstimate = (property, rehabLevel) => {
  let baseRateSqft = 0;
  let description = "";
  
  // Base rates - adjusted lower as requested
  switch(rehabLevel) {
    case "light":
      baseRateSqft = 15;
      description = "Paint, flooring, light fixtures, minor repairs";
      break;
    case "mid":
      baseRateSqft = 30;
      description = "Kitchen refresh, bathroom updates, some system repairs";
      break;
    case "full":
      baseRateSqft = 50;
      description = "Complete renovation including kitchen, baths, and all systems";
      break;
    default:
      baseRateSqft = 30;
  }
  
  // ARV multiplier - higher ARV properties require higher quality finishes
  let arvMultiplier = 1.0;
  if (property.estARV < 300000) {
    arvMultiplier = 0.85; // Lower-end finishes for lower-value properties
  } else if (property.estARV >= 300000 && property.estARV < 600000) {
    arvMultiplier = 1.0; // Standard finishes for mid-value properties
  } else if (property.estARV >= 600000 && property.estARV < 900000) {
    arvMultiplier = 1.2; // Higher-end finishes for higher-value properties
  } else if (property.estARV >= 900000) {
    arvMultiplier = 1.4; // Luxury finishes for luxury properties
  }
  
  // Apply ARV multiplier to base rate
  const adjustedRateSqft = baseRateSqft * arvMultiplier;
  
  // Base cost by square footage
  let estimatedCost = property.sqft * adjustedRateSqft;
  
  // Additional costs for bathrooms (beyond 1)
  if (property.baths > 1) {
    estimatedCost += (property.baths - 1) * 4000;
  }
  
  // Add 10% if the property is older than 1980
  if (property.yearBuilt < 1980) {
    estimatedCost *= 1.1;
  }
  
  // Get ARV tier description
  let arvTier = "";
  if (property.estARV < 300000) {
    arvTier = "Standard";
  } else if (property.estARV >= 300000 && property.estARV < 600000) {
    arvTier = "Mid-grade";
  } else if (property.estARV >= 600000 && property.estARV < 900000) {
    arvTier = "High-end";
  } else if (property.estARV >= 900000) {
    arvTier = "Luxury";
  }
  
  return {
    cost: Math.round(estimatedCost),
    description: description,
    arvTier: arvTier,
    adjustedRate: adjustedRateSqft.toFixed(2)
  };
};

