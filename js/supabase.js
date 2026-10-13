
const SUPABASE_URL = "https://ztijvrztpgzkujaqrssi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_QOU8mQsi5i1G_n3hIUMkbw_ZbeB3aLY";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

console.log("InsightXine Supabase connection loaded!");

