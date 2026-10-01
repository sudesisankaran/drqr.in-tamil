const { createClient } = require('@supabase/supabase-js');
const url = 'https://tvwzkchcekyzuxiqwdyu.supabase.co';
const key = 'sb_publishable_yeoviHmssX3715gggJds1w_xNtCz-Jn';
const supabase = createClient(url, key);

(async () => {
  const { data: authData } = await supabase.auth.signUp({
    email: 'test_rls3_' + Date.now() + '@example.com',
    password: 'password123'
  });
  
  const token = authData.session.access_token;
  const userId = authData.user.id;
  const { error: insertError } = await supabase.from('users').insert([{ id: userId, email: authData.user.email, role: 'patient', password: 'abc', full_name: 'Test' }]);
  if (insertError) {
    console.error("Insert Error:", insertError);
  }

  // The correct way in Supabase JS v2
  const authSupabase = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: userData1 } = await authSupabase.from('users').select('*').eq('id', userId).single();
  
  const authSupabase2 = createClient(url, key, {
    accessToken: async () => token
  });
  const { data: userData2 } = await authSupabase2.from('users').select('*').eq('id', userId).single();

  console.log('Result 1 (global headers):', userData1?.id);
  console.log('Result 2 (accessToken):', userData2?.id);
})();
