import { createClient } from '@supabase/supabase-js';

let standardClient;
let adminClient;

function getRequiredSupabaseEnv(admin = false) {
  const env = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  const missing = [
    !env.supabaseUrl && 'NEXT_PUBLIC_SUPABASE_URL',
    !env.supabaseAnonKey && !admin && 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    !env.supabaseServiceKey && admin && 'SUPABASE_SERVICE_ROLE_KEY',
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(
      `Missing Supabase environment variable${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}. ` +
      'Add them in Vercel Project Settings > Environment Variables, then redeploy.'
    );
  }

  return env;
}

export function getSupabaseClient() {
  if (!standardClient) {
    const { supabaseUrl, supabaseAnonKey } = getRequiredSupabaseEnv(false);
    standardClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return standardClient;
}

export function getSupabaseAdminClient() {
  if (!adminClient) {
    const { supabaseUrl, supabaseServiceKey } = getRequiredSupabaseEnv(true);
    adminClient = createClient(supabaseUrl, supabaseServiceKey);
  }

  return adminClient;
}

function createLazyClient(getClient) {
  return new Proxy({}, {
    get(_target, prop) {
      const client = getClient();
      const value = client[prop];
      return typeof value === 'function' ? value.bind(client) : value;
    },
  });
}

// Standard client bound by RLS. It is created lazily so builds do not crash
// before Vercel environment variables are available.
export const supabase = createLazyClient(getSupabaseClient);

// Administrative client that bypasses RLS. Only access this from server routes.
export const supabaseAdmin = createLazyClient(getSupabaseAdminClient);
