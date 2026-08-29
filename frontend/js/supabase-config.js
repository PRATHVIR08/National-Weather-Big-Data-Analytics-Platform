// Supabase Public Configuration
// Fill in your project URL and Anon Key from your Supabase Dashboard
const SUPABASE_URL = "https://vfqaajtwzyazgninxgtm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmcWFhanR3enlhemduaW54Z3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5NjcwMjQsImV4cCI6MjEwMzU0MzAyNH0.PbN-N-Yr2EENkBdeEOSTDgkuCRi8neHGXbutkwS_QLw";

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
