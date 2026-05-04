const { createClient } = require('@supabase/supabase-js');

// Load environment from somewhere or just assume env vars are set?
// I'll try to find the .env file first.
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const supabaseUrl = envContent.match(/EXPO_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const supabaseAnonKey = envContent.match(/EXPO_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkReminders() {
    console.log('--- Institutional Audit: Debt Reminders ---');
    
    // 1. Check pending/overdue fees
    const { data: fees, error: feeError } = await supabase
        .from('fees')
        .select('student_id, title, status, due_date')
        .in('status', ['PENDING', 'OVERDUE']);
    
    if (feeError) {
        console.error('Error fetching fees:', feeError);
        return;
    }

    const uniqueStudents = [...new Set(fees.map(f => f.student_id))];
    console.log(`Total outstanding fees found: ${fees.length}`);
    console.log(`Unique students with debt: ${uniqueStudents.length}`);
    
    // 2. Check recently sent messages
    const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('receiver_id, content, created_at, receiver:receiver_id(name)')
        .ilike('content', '%[OUREDUCA FINANCE]%')
        .order('created_at', { ascending: false })
        .limit(10);

    if (msgError) {
        console.error('Error fetching messages:', msgError);
        return;
    }

    console.log(`\nRecently sent institutional alerts: ${messages.length}`);
    messages.forEach((m, i) => {
        const studentName = m.receiver ? m.receiver.name : m.receiver_id;
        console.log(`[${i+1}] To: ${studentName} | Content: ${m.content.substring(0, 50)}...`);
    });
}

checkReminders();
