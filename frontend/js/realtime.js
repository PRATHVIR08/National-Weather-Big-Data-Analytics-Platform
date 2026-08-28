// Supabase Realtime Listener for Live Dashboard Updates
function initRealtimeSubscription(onNewReportCallback) {
    if (typeof supabaseClient !== "undefined" && supabaseClient) {
        console.log("[*] Subscribing to Supabase Realtime changes on `reports` table...");
        
        const channel = supabaseClient
            .channel('public:reports')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'reports' },
                (payload) => {
                    console.log('[⚡ Realtime Event Received]:', payload);
                    if (onNewReportCallback && typeof onNewReportCallback === "function") {
                        onNewReportCallback(payload.new);
                    }
                }
            )
            .subscribe((status) => {
                console.log(`[Realtime Channel Status]: ${status}`);
            });
            
        return channel;
    } else {
        console.log("[i] Supabase Realtime inactive. Starting polling fallback (every 10s)...");
        setInterval(() => {
            if (onNewReportCallback && typeof onNewReportCallback === "function") {
                onNewReportCallback(null);
            }
        }, 10000);
    }
}
