const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SCHOOL_ID = "83b41c73-e356-4252-b2c1-398f1ef5c9e1";
const HEADMASTER_ID = "b6f2082b-f6e3-42ae-b8bd-b3953b8d6d0a";
const TEACHER_ID = "d7fe4967-5be2-4716-ae45-46fc88837c9c";

const dummyNotices = [
    {
        title: "[URGENT] Mid-Term Revision Policy",
        message: "All students must review the new examination guidelines. Late entry to the hall will not be permitted.",
        audience: "ALL",
        school_id: SCHOOL_ID,
        sender_id: HEADMASTER_ID
    },
    {
        title: "[EVENT] Spring Festival 2026",
        message: "Join us for the annual Spring Festival this Saturday. Food stalls and cultural performances start from 10:00 AM.",
        audience: "ALL",
        school_id: SCHOOL_ID,
        sender_id: HEADMASTER_ID
    },
    {
        title: "[ACADEMIC] Holiday Notice: Wednesday",
        message: "The institution will remain closed on Wednesday for regional festivities. Classes resume Thursday.",
        audience: "STUDENT",
        school_id: SCHOOL_ID,
        sender_id: HEADMASTER_ID
    },
    {
        title: "[ACADEMIC] Research Paper Guidelines",
        message: "The deadline for the Physics research proposal has been moved to next Friday.",
        audience: "STUDENT",
        school_id: SCHOOL_ID,
        sender_id: TEACHER_ID
    },
    {
        title: "[STAFF] Faculty Development Session",
        message: "Mandatory training session for all subject teachers at 3:00 PM in the Main Conference Hall.",
        audience: "STAFF",
        school_id: SCHOOL_ID,
        sender_id: HEADMASTER_ID
    },
    {
        title: "Campus Maintenance: North Wing",
        message: "The North Wing elevators will be undergoing maintenance for the next 48 hours.",
        audience: "ALL",
        school_id: SCHOOL_ID,
        sender_id: HEADMASTER_ID
    }
];

async function seedNotices() {
    console.log("🚀 Purging old notices and seeding identified notices...");
    
    // Cleanup old ones to avoid duplicates
    await supabase.from('announcements').delete().eq('school_id', SCHOOL_ID);
    
    for (const notice of dummyNotices) {
        const { error } = await supabase
            .from('announcements')
            .insert(notice);
        
        if (error) {
            console.error(`❌ Error inserting "${notice.title}":`, error.message);
        } else {
            console.log(`✅ Inserted: ${notice.title} (By: ${notice.sender_id === HEADMASTER_ID ? 'Headmaster' : 'Teacher'})`);
        }
    }
    
    console.log("✨ Seeding complete!");
}

seedNotices();
