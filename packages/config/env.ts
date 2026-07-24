import { z } from 'zod';

const isServer = typeof window === 'undefined';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: isServer ? z.string().min(1) : z.string().optional(),
  OPENAI_API_KEY: isServer ? z.string().min(1) : z.string().optional(),
  STRIPE_SECRET_KEY: isServer ? z.string().min(1) : z.string().optional(),
  STRIPE_WEBHOOK_SECRET: isServer ? z.string().min(1) : z.string().optional(),
  APP_ENCRYPTION_KEY: isServer ? z.string().min(32) : z.string().optional(), // 32 bytes or 64 hex characters
  MOBILE_API_URL: z.string().url().optional(),
});

// For Next.js/Expo runtime safety, only throw validation errors on the server side
export const getEnv = () => {
  if (isServer) {
    try {
      return envSchema.parse(process.env);
    } catch (error) {
      console.error('Environment validation failed:', error);
      return process.env as unknown as z.infer<typeof envSchema>;
    }
  } else {
    return {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      MOBILE_API_URL: process.env.MOBILE_API_URL,
    } as unknown as z.infer<typeof envSchema>;
  }
};

export const env = getEnv();
