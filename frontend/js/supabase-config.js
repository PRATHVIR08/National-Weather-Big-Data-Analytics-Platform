// Supabase Public Configuration
// Fill in your project URL and Anon Key from your Supabase Dashboard
const SUPABASE_URL = "https://your-supabase-project.supabase.co";
const SUPABASE_ANON_KEY = "your-supabase-anon-key";

let supabaseClient = null;

// Initialize Supabase Client if library is available
if (typeof supabase !== "undefined" && SUPABASE_URL && !SUPABASE_URL.includes("your-supabase-project")) {
    try {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("[✓] Supabase Client initialized successfully.");
    } catch (err) {
        console.warn("[!] Supabase Client initialization warning:", err);
    }
} else {
    console.log("[i] Supabase config placeholder active. Local API fallback mode enabled.");
}
