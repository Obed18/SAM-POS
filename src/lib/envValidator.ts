/**
 * Validates that all required environment variables are set.
 * Throws an error if any are missing.
 */
export const validateEnvironment = () => {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY',
  ];

  const missing = required.filter((key) => !import.meta.env[key as keyof ImportMetaEnv]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      `Please set these in your Netlify environment variables.`
    );
  }
};

/**
 * Gets Supabase configuration with validation
 */
export const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase configuration missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY environment variables.'
    );
  }

  return { url, key };
};
