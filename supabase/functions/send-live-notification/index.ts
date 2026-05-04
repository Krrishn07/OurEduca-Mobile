import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

serve(async (req) => {
  try {
    const { record } = await req.json();

    // 1. Only trigger for NEW Live sessions
    if (record.type !== 'LIVE' || record.status !== 'active') {
      return new Response("Not a live trigger", { status: 200 });
    }

    // 2. Initialize Supabase Admin (Use Service Role Key for bypass RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 3. Find all students in this teacher's institutional circle
    // We fetch users who have a push token and are part of the same school
    const { data: recipients, error: recipientError } = await supabaseAdmin
      .from('users')
      .select('expo_push_token')
      .eq('school_id', record.school_id)
      .eq('role', 'student')
      .not('expo_push_token', 'is', null);

    if (recipientError || !recipients || recipients.length === 0) {
      return new Response("No recipients with tokens found", { status: 200 });
    }

    // 4. Prepare the Notification Payload
    const notifications = recipients.map((user) => ({
      to: user.expo_push_token,
      sound: "default",
      title: `🎬 Institutional Live: ${record.subject || 'General'}`,
      body: `${record.title} is now broadcasting. Tap to join.`,
      data: { sessionId: record.id, type: 'LIVE_SESSION' },
    }));

    // 5. Send to Expo Push Service
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notifications),
    });

    const result = await response.json();
    console.log(`[PUSH_SERVICE] Sent to ${notifications.length} devices.`, result);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
