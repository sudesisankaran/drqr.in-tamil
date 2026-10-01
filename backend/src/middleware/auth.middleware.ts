import { Request, Response, NextFunction } from "express";
import supabase from "../config/supabase";
import { createClient } from "@supabase/supabase-js";

export const protect = async (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !authData.user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const authSupabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: userData, error: userError } = await authSupabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (userError || !userData) {
      return res.status(401).json({ message: "User profile not found" });
    }

    req.user = userData;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const optionalProtect = async (
  req: any,
  _res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    const { data: authData } = await supabase.auth.getUser(token);
    if (authData?.user) {
      const authSupabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!, {
        global: { headers: { Authorization: `Bearer ${token}` } }
      });
      const { data: userData } = await authSupabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();
      
      req.user = userData || null;
    } else {
      req.user = null;
    }
  } catch {
    req.user = null;
  }

  next();
};

export const authorize = (...roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
