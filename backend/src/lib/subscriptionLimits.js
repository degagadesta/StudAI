export const SUBSCRIPTION_LIMITS = {
  FREE: 5,
  PRO: 10,
  UNLIMITED: null,
};

export function canUploadMore(plan, count) {
  const limit = SUBSCRIPTION_LIMITS[plan];
  if (limit === null) return true;
  return count < limit;
}
