import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let body;
    try {
        body = await req.json();
    } catch (e) {
        throw new Error("Invalid JSON in request body");
    }

    const { fee_id, student_id, school_id, amount, payment_method = 'Simulated Digital' } = body

    if (!fee_id || !student_id || !school_id || !amount) {
      throw new Error(`Missing fields: fee_id=${!!fee_id}, stu=${!!student_id}, sch=${!!school_id}, amt=${!!amount}`)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Create Simulated Ref
    const mockOrderId = `sim_order_${Math.random().toString(36).substring(7)}`

    // 2. Insert Transaction
    const { data: transaction, error: txError } = await supabaseClient
      .from('fee_transactions')
      .insert({
        fee_id,
        student_id,
        school_id,
        amount,
        payment_method,
        transaction_ref: mockOrderId,
        status: 'VERIFIED',
        verified_at: new Date().toISOString()
      })
      .select()
      .single()

    if (txError) {
        // RETURN 200 but with error payload to bypass generic masking
        return new Response(
            JSON.stringify({ success: false, error: `DB_TX_ERROR: ${txError.message}`, hint: txError.hint, detail: txError.details }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
    }

    // 3. Update Fee status
    const { error: feeError } = await supabaseClient
      .from('fees')
      .update({ status: 'PAID' })
      .eq('id', fee_id)

    if (feeError) {
        return new Response(
            JSON.stringify({ success: false, error: `DB_FEE_ERROR: ${feeError.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        transactionId: transaction.id, 
        orderId: mockOrderId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  }
})
