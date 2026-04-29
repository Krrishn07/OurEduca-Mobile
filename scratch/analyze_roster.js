const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env file manually
const envContent = fs.readFileSync('.env', 'utf8');
const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : null;
};

const supabaseUrl = getEnv('EXPO_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    try {
        const { data: schools } = await supabase.from('schools').select('id, name').eq('name', 'University of Penssylvania');
        if (!schools || schools.length === 0) {
            console.log('School not found');
            return;
        }
        const schoolId = schools[0].id;
        console.log('School ID:', schoolId);

        const { data: classes } = await supabase.from('classes').select('id, name, subject, school_id').eq('school_id', schoolId);
        const classIds = classes.map(c => c.id);
        console.log('Class IDs in school:', classIds);

        const { data: roster } = await supabase.from('class_roster').select('role_in_class, class_id, section, subject, user_id, users(name)').in('class_id', classIds);
        
        console.log('Total Roster entries:', roster.length);
        
        // Group by class_id and see teachers per class
        const classGroups = {};
        roster.forEach(r => {
            if (!classGroups[r.class_id]) classGroups[r.class_id] = { teachers: [], students: [] };
            if (r.role_in_class === 'teacher' || r.role_in_class === 'mentor') {
                classGroups[r.class_id].teachers.push({ name: r.users?.name, subject: r.subject });
            } else if (r.role_in_class === 'student') {
                classGroups[r.class_id].students.push(r.users?.name);
            }
        });

        console.log('Class-wise Breakdown:');
        Object.keys(classGroups).forEach(cid => {
            console.log(`Class ID: ${cid}`);
            console.log(`  Teachers:`, classGroups[cid].teachers);
            console.log(`  Students:`, classGroups[cid].students.slice(0, 5), `(Total: ${classGroups[cid].students.length})`);
        });

    } catch (e) { console.error('Error:', e); }
}
check();
