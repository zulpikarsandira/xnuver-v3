const https = require('https');

const SUPABASE_URL = 'https://ejqrvmkjypdfqiiwyxkp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqcXJ2bWtqeXBkZnFpaXd5eGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MzM0NDEsImV4cCI6MjA4MzUwOTQ0MX0.sDOLfczDLK4RNIHFLP-kG1_rnZNWhE4XFImruLBr8oA';
const SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1`;

const checkData = {
    device_id: 'TEST_DEBUG_DEVICE', // Use a dedicated test ID
    name: 'Debug Device',
    controller_id: 'DEBUG_CONTROLLER',
    is_online: true,
    last_seen: new Date().toISOString(),
    status: 'ACTIVE',
    model: 'NodeJS Script'
};

async function testConnection() {
    console.log('Testing Supabase Connection...');

    // 1. TEST READ
    try {
        console.log('--- ATTEMPTING READ ---');
        const readRes = await fetch(`${SUPABASE_REST_URL}/devices?select=*&limit=1`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        console.log('Read Status:', readRes.status);
        const readBody = await readRes.text();
        console.log('Read Body:', readBody);

    } catch (e) {
        console.error('READ ERROR:', e.message);
    }

    // 2. TEST WRITE (INSERT)
    try {
        console.log('\n--- ATTEMPTING WRITE (INSERT) ---');
        const writeRes = await fetch(`${SUPABASE_REST_URL}/devices`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(checkData)
        });

        console.log('Write Status:', writeRes.status);
        const writeBody = await writeRes.text();
        console.log('Write Body:', writeBody);
    } catch (e) {
        console.error('WRITE ERROR:', e.message);
    }
}

testConnection();
