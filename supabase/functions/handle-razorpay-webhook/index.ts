import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// Helper function to verify Razorpay signature using Web Crypto API
async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const bodyData = encoder.encode(body)

  const hmacKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify', 'sign']
  )

  const signatureData = new Uint8Array(
    signature.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  )

  return await crypto.subtle.verify(
    'HMAC',
    hmacKey,
    signatureData,
    bodyData
  )
}

serve(async (req) => {
  try {
    const signature = req.headers.get('x-razorpay-signature')
    const body = await req.text()

    console.log('[WEBHOOK_RECEIVE] Headers:', req.headers);
    console.log('[WEBHOOK_RECEIVE] Secret Configured:', !!RAZORPAY_WEBHOOK_SECRET);

    if (!signature || !RAZORPAY_WEBHOOK_SECRET) {
      console.error('[WEBHOOK_ERROR] Missing signature or secret');
      throw new Error('Invalid signature or secret missing')
    }

    // Verify Signature using built-in crypto
    const isValid = await verifySignature(body, signature, RAZORPAY_WEBHOOK_SECRET)
    
    if (!isValid) {
      console.error('[WEBHOOK_ERROR] Invalid Webhook Signature');
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
    }

    const payload = JSON.parse(body)
    const event = payload.event
    const payment = payload.payload.payment.entity
    const orderId = payment.order_id

    console.log(`[WEBHOOK_EVENT] Event: ${event}, Order ID: ${orderId}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

      // 1. Find the transaction
      const { data: transaction, error: fetchError } = await supabase
        .from('fee_transactions')
        .select('id, fee_id')
        .eq('transaction_ref', orderId)
        .single()

      if (fetchError || !transaction) {
        console.error('[WEBHOOK_ERROR] Transaction not found for Order ID:', orderId);
        return new Response('Transaction not found', { status: 404 })
      }

      console.log(`[WEBHOOK_SUCCESS] Found Transaction: ${transaction.id}. Updating DB...`);

      // 2. Update Transaction to VERIFIED
      const { error: txUpdateError } = await supabase
        .from('fee_transactions')
        .update({ 
            status: 'VERIFIED',
            verified_at: new Date().toISOString()
        })
        .eq('id', transaction.id)

      if (txUpdateError) console.error('[WEBHOOK_ERROR] fee_transactions update failed:', txUpdateError.message);

      // 3. Update Fee to PAID
      const { error: feeUpdateError } = await supabase
        .from('fees')
        .update({ status: 'PAID' })
        .eq('id', transaction.fee_id)
        
      if (feeUpdateError) console.error('[WEBHOOK_ERROR] fees update failed:', feeUpdateError.message);

      console.log('[WEBHOOK_DONE] Payment verified and database updated for Fee:', transaction.fee_id)
    }

    return new Response(JSON.stringify({ received: true }), { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
    })
  } catch (error) {
    console.error('[WEBHOOK_INTERNAL_ERROR]', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
