import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL || "https://example.supabase.co";
const supabaseKey =
  process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY || "anon-placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const ensureAnonymousSession = async () => {
  try {
    const hasConfig = Boolean(
      process.env.REACT_APP_SUPABASE_URL &&
        process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY,
    );

    if (!hasConfig) {
      return { configured: false, userId: null, error: null };
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      return { configured: true, userId: null, error: sessionError };
    }

    if (session?.user?.id) {
      return { configured: true, userId: session.user.id, error: null };
    }

    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      return {
        configured: true,
        userId: null,
        error: {
          ...error,
          friendlyMessage:
            error?.status === 422
              ? "Anonymous sign-in is disabled in Supabase Auth. Enable 'Anonymous' in Authentication > Providers."
              : error?.message || "Anonymous sign-in failed.",
        },
      };
    }

    return {
      configured: true,
      userId: data.user?.id ?? null,
      error: null,
    };
  } catch (error) {
    return {
      configured: true,
      userId: null,
      error: {
        ...error,
        friendlyMessage: error?.message || "Anonymous sign-in failed.",
      },
    };
  }
};
