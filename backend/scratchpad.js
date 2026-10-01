const { createClient } = require('@supabase/supabase-js');
const url = 'https://tvwzkchcekyzuxiqwdyu.supabase.co';
const key = 'sb_publishable_yeoviHmssX3715gggJds1w_xNtCz-Jn';
const supabase = createClient(url, key);

(async () => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'test_rls_' + Date.now() + '@example.com',
    password: 'password123'
  });
  if (authError) { console.error('SignUp Error:', authError); return; }
  
  const token = authData.session.access_token;
  const userId = authData.user.id;
  console.log('User created:', userId);

  // insert into users table
  await supabase.from('users').insert([{ id: userId, email: authData.user.email, role: 'patient', password: 'abc' }]);

  // Now mimic auth.middleware.ts
  const authSupabase = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: userData, error: userError } = await authSupabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
    
  console.log('Auth middleware fetch result:', { userData, userError });
})();
