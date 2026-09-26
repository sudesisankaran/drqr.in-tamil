const rawServerUrl =
  (import.meta.env.VITE_SERVER_URL as string | undefined) ||
  "http://localhost:5000/api";

const _env = {
  SERVER_URL: rawServerUrl.endsWith("/api")
    ? rawServerUrl
    : `${rawServerUrl.replace(/\/$/, "")}/api`,
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
};

export default _env;
