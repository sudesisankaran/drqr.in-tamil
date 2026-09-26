"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase environment variables");
    process.exit(1);
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
const connectDB = async () => {
    try {
        // Just a simple query to test the connection
        const { error } = await supabase.from("users").select("id").limit(1);
        // Ignore error if table doesn't exist, we just want to ensure we don't get a connection refused
        if (error && error.code !== '42P01' && error.code !== 'PGRST205') {
            throw error;
        }
        console.log("✅ Connected to Supabase Successfully");
    }
    catch (error) {
        console.error("❌ Supabase Connection Failed:", error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
exports.default = supabase;
