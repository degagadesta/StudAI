/**
 * Subscription Plan Limits
 * Updated plan structure: FREE -> STUDENT -> PRO
 * All limits are per billing period (monthly) unless specified
 */
export const PLAN_LIMITS = {
  FREE: {
    // Feature usage limits (monthly)
    PDF_UPLOADS: 5,
    SUMMARY: 10,
    FLASHCARDS: 50,
    CHAT_MESSAGES: 100,
    QUIZ_GENERATION: 10,
    NOTES_GENERATION: 10,
    EXPLAIN_TOPIC: 15,
    
    // Course limits
    MAX_COURSES: 6,
    
    // Previous exam access
    EXAM_YEARS_ACCESS: 2, // Last 2 years only
    
    // AI Configuration
    CHAT_CONTEXT_TOKENS: 3500,
    CHAT_HISTORY_TOKENS: 800,
    CHAT_MAX_OUTPUT_TOKENS: 700,
    EXPLAIN_MAX_OUTPUT_TOKENS: 500,
  },
  
  STUDENT: {
    // Feature usage limits (monthly)
    PDF_UPLOADS: 25,
    SUMMARY: null, // unlimited
    FLASHCARDS: null, // unlimited
    CHAT_MESSAGES: 1000,
    QUIZ_GENERATION: null, // unlimited
    NOTES_GENERATION: null, // unlimited
    EXPLAIN_TOPIC: null, // unlimited
    
    // Course limits
    MAX_COURSES: 10,
    
    // Previous exam access
    EXAM_YEARS_ACCESS: null, // All years
    
    // AI Configuration
    CHAT_CONTEXT_TOKENS: 6000,
    CHAT_HISTORY_TOKENS: 1500,
    CHAT_MAX_OUTPUT_TOKENS: 1000,
    EXPLAIN_MAX_OUTPUT_TOKENS: 700,
  },
  
  PRO: {
    // Everything unlimited
    PDF_UPLOADS: null,
    SUMMARY: null,
    FLASHCARDS: null,
    CHAT_MESSAGES: null,
    QUIZ_GENERATION: null,
    NOTES_GENERATION: null,
    EXPLAIN_TOPIC: null,
    
    // Course limits
    MAX_COURSES: null,
    
    // Previous exam access
    EXAM_YEARS_ACCESS: null, // All years + AI solutions
    
    // AI Configuration (Premium)
    CHAT_CONTEXT_TOKENS: 10000,
    CHAT_HISTORY_TOKENS: 2500,
    CHAT_MAX_OUTPUT_TOKENS: 1500,
    EXPLAIN_MAX_OUTPUT_TOKENS: 1000,
  },
  
  // Legacy support (map old STANDARD to new STUDENT)
  STANDARD: {
    PDF_UPLOADS: 25,
    SUMMARY: null,
    FLASHCARDS: null,
    CHAT_MESSAGES: 1000,
    QUIZ_GENERATION: null,
    NOTES_GENERATION: null,
    EXPLAIN_TOPIC: null,
    MAX_COURSES: 10,
    EXAM_YEARS_ACCESS: null,
    CHAT_CONTEXT_TOKENS: 6000,
    CHAT_HISTORY_TOKENS: 1500,
    CHAT_MAX_OUTPUT_TOKENS: 1000,
    EXPLAIN_MAX_OUTPUT_TOKENS: 700,
  },
};

export const MIN_RELEVANCE_SCORE = 0.55;

/**
 * Plan pricing in Ethiopian Birr (ETB)
 */
export const PLAN_PRICING = {
  FREE: {
    monthly: 0,
    yearly: 0,
  },
  STUDENT: {
    monthly: 149,
    yearly: 1200, // Save 588 ETB (33% discount)
  },
  PRO: {
    monthly: 249,
    yearly: 2400, // Save 600 ETB (24% discount)
  },
};

/**
 * Get limit for specific feature and plan
 * @param {string} plan - Subscription plan (FREE, STUDENT, PRO)
 * @param {string} feature - Feature name
 * @returns {number|null} Limit value or null for unlimited
 */
export function getFeatureLimit(plan, feature) {
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;
  return limits[feature] ?? null;
}

/**
 * Check if feature is unlimited for plan
 * @param {string} plan - Subscription plan
 * @param {string} feature - Feature name
 * @returns {boolean} True if unlimited
 */
export function isUnlimited(plan, feature) {
  return getFeatureLimit(plan, feature) === null;
}
