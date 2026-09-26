import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const connectDB = async () => {
  try {
    // Just a simple query to test the connection
    const { error } = await supabase.from("users").select("id").limit(1);
    
    // Ignore error if table doesn't exist, we just want to ensure we don't get a connection refused
    if (error && error.code !== '42P01' && error.code !== 'PGRST205') { 
        throw error;
    }
    console.log("✅ Connected to Supabase Successfully");
  } catch (error) {
    console.error("❌ Supabase Connection Failed:", error);
    process.exit(1);
  }
};

export default supabase;
