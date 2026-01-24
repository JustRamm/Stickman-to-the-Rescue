import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://juajkyjgqmwxowslpslh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1YWpreWpncW13eG93c2xwc2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxODUxNDQsImV4cCI6MjA4NDc2MTE0NH0.Vxo4Jp0BR4SBRV7OcLOJIS85UUl7TXO84g2FYw56RLY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    try {
        const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        if (error) {
            console.error('Supabase Error:', error);
        } else {
            console.log('Connection successful, count:', data);
        }
    } catch (err) {
        console.error('Network or other error:', err);
    }
}

testConnection();
