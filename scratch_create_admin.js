import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://zfmttodctylwjrtqkcud.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_rKnGWDYjb21HAK01k3EGrA_lqFWMOID";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const ADMIN_EMAIL = 'admin@mail.com';
const INTERNAL_PASS = 'AdminMTsN2Cilacap2026!';

async function main() {
  console.log("Registering admin user on Supabase...");
  
  let { data, error } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: INTERNAL_PASS
  });

  if (error) {
    console.log("Creating new user account on Supabase...");
    const signupRes = await supabase.auth.signUp({
      email: ADMIN_EMAIL,
      password: INTERNAL_PASS,
      options: {
        data: {
          full_name: 'Administrator MTsN 2 Cilacap'
        }
      }
    });

    if (signupRes.error) {
      console.error("Sign up error:", signupRes.error);
    } else {
      console.log("Admin account successfully created on Supabase!");
      data = signupRes.data;
    }
  } else {
    console.log("Admin user signed in successfully!");
  }

  if (data?.user) {
    console.log("User ID:", data.user.id);
    
    // Assign admin role in user_roles table
    const { error: roleError } = await supabase.from('user_roles').upsert({
      user_id: data.user.id,
      role: 'admin'
    }, { onConflict: 'user_id,role' });

    if (roleError) {
      console.log("Role assignment warning:", roleError.message);
    } else {
      console.log("SUCCESS: Admin role successfully assigned in Supabase database!");
    }
  }
}

main();
