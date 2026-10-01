const { createClient } = require('@supabase/supabase-js');
const url = 'https://tvwzkchcekyzuxiqwdyu.supabase.co';
const key = 'sb_publishable_yeoviHmssX3715gggJds1w_xNtCz-Jn';

(async () => {
  const supabase = createClient(url, key);
  const { data: authData } = await supabase.auth.signUp({
    email: 'test_rls2_' + Date.now() + '@example.com',
    password: 'password123'
  });
  
  const token = authData.session.access_token;
  const userId = authData.user.id;
  await supabase.from('users').insert([{ id: userId, email: authData.user.email, role: 'patient', password: 'abc' }]);

  // Fix: use accessToken configuration
  const authSupabase = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });
  
  // Or even better, try to just fetch using normal fetch API to verify PostgREST works with token
  const res = await fetch(`${url}/rest/v1/users?id=eq.${userId}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${token}`
    }
  });
  console.log("Raw fetch:", await res.json());

})();
