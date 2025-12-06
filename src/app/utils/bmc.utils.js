/**
 * BMC Utils Module
 * Helper functions for BMC data processing and validation
 */

// Valid BMC tags (snake_case) - matches the enum in bmc.model.js
export const VALID_BMC_TAGS = [
  'customer_segments',
  'value_propositions',
  'channels',
  'customer_relationships',
  'revenue_streams',
  'key_resources',
  'key_activities',
  'key_partnerships',
  'cost_structure',
];

/**
 * Normalize a tag to snake_case format
 * Converts camelCase/PascalCase to snake_case and validates against VALID_BMC_TAGS
 * @param {string} tag - The tag to normalize
 * @returns {string} - The normalized tag (snake_case if valid, original otherwise)
 */
export function normalizeTag(tag) {
  if (!tag || typeof tag !== 'string') return tag;
  
  // Convert camelCase/PascalCase to snake_case
  const snakeCase = tag
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase();
  
  // Return snake_case if it's a valid tag, otherwise return original
  return VALID_BMC_TAGS.includes(snakeCase) ? snakeCase : tag;
}

/**
 * Normalize all tags in a BMC data array
 * @param {Array} bmcData - Array of BMC items with tag and content
 * @returns {Array} - Array with normalized tags
 */
export function normalizeBmcData(bmcData) {
  if (!Array.isArray(bmcData)) return bmcData;
  
  return bmcData.map((item) => ({
    ...item,
    tag: normalizeTag(item.tag),
  }));
}

/**
 * Validate BMC data structure
 * @param {unknown} bmcData - Data to validate
 * @returns {{ valid: boolean, errors: string[] }} - Validation result
 */
export function validateBmcData(bmcData) {
  const errors = [];
  
  // Check if bmcData is an array
  if (!Array.isArray(bmcData)) {
    return { valid: false, errors: ['BMC data must be an array'] };
  }
  
  // Check if array is empty
  if (bmcData.length === 0) {
    return { valid: false, errors: ['BMC data array cannot be empty'] };
  }
  
  // Validate each item
  bmcData.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      errors.push(`Item at index ${index} must be an object`);
      return;
    }
    
    // Check tag exists and is valid
    if (!item.tag) {
      errors.push(`Item at index ${index} is missing tag`);
    } else {
      const normalizedTag = normalizeTag(item.tag);
      if (!VALID_BMC_TAGS.includes(normalizedTag)) {
        errors.push(`Item at index ${index} has invalid tag: ${item.tag}`);
      }
    }
    
    // Check content exists and is non-empty
    if (!item.content) {
      errors.push(`Item at index ${index} is missing content`);
    } else if (typeof item.content !== 'string') {
      errors.push(`Item at index ${index} content must be a string`);
    } else if (item.content.trim() === '') {
      errors.push(`Item at index ${index} content cannot be empty`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
