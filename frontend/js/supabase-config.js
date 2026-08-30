// Supabase Public Configuration
// Fill in your project URL and Anon Key from your Supabase Dashboard
const SUPABASE_URL = "https://ipwmwgvzylfwmqdrvyre.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwd213Z3Z6eWxmd21xZHJ2eXJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwOTQzODgsImV4cCI6MjEwMzY3MDM4OH0.uMHY8a_H36WUrup_qugziIjv6kj7oFmfcp9zTcwrqgA";

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
