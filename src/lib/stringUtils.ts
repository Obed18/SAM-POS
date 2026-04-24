/**
 * Safely capitalize a string, handling null/undefined values.
 */
export const safeCapitalize = (str: string | null | undefined): string => {
  if (!str || typeof str !== 'string' || str.length === 0) {
    return '';
  }
  try {
    return str.charAt(0).toUpperCase() + str.slice(1);
  } catch {
    return '';
  }
};

/**
 * Safely format a role string for display.
 */
export const formatRole = (role: string | null | undefined): string => {
  return safeCapitalize(role);
};
