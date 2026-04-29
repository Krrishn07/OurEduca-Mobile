import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, currency = 'INR', receipt } = await req.json()

    console.log(`[ORDER_CREATE] Amount: ${amount}, Currency: ${currency}, Receipt: ${receipt}`);

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error('[CONFIG_ERROR] Razorpay keys missing in environment');
      return new Response(
        JSON.stringify({ error: 'Razorpay API keys are not configured in Supabase Secrets' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    if (!amount) {
      return new Response(
        JSON.stringify({ error: 'Amount is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Razorpay expect amount in paise (multiply by 100)
    const amountInPaise = Math.round(amount * 100)

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt
      })
    })

    const order = await response.json()
    console.log(`[RAZORPAY_RESPONSE] Status: ${response.status}`, order);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: order.error?.description || 'Failed to create Razorpay order', details: order.error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify(order),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      },
    )
  } catch (error) {
    console.error('[INTERNAL_ERROR]', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      },
    )
  }
})
