/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_RAZORPAY_KEY_ID: string;
  readonly VITE_RESEND_API_KEY?: string;
  readonly RESEND_API_KEY?: string;
  readonly VITE_ADMIN_EMAIL?: string;
  readonly VITE_FROM_EMAIL?: string;
  readonly VITE_ADMIN_DEV_KEY?: string;
  readonly VITE_ADMIN_ACCESS_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
