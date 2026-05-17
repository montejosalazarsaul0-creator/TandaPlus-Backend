import { Request, Response } from "express";
import { registerUser, loginUser, getMyProfile } from "../services/auth.service";
import { supabase, supabaseAdmin } from "../config/supabase"; 
/* ===============================
REGISTER
=============================== */
export const register = async (req: Request, res: Response) => {
  try {

    const { name, email, phone, password } = req.body;

    const user = await registerUser({
      name,
      email,
      phone,
      password
    });

    return res.status(201).json(user);

  } catch (error: any) {

    return res.status(400).json({
      error: error.message
    });

  }
};



export const login = async (req: Request, res: Response) => {
  try {

    const { email, password } = req.body;

    
    const data = await loginUser(email, password);

 
    return res.json(data);

  } catch (error: any) {

    return res.status(401).json({
      error: error.message
    });

  }
};



export const getProfile = async (req: any, res: Response) => {
  try {

    const userId = req.user.id;

    const profile = await getMyProfile(userId);

    return res.json({
      profile
    });

  } catch (error: any) {

    return res.status(400).json({
      error: error.message
    });

  }
};

export const savePushToken = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    await supabaseAdmin
      .from("profiles")
      .update({ push_token: token })
      .eq("id", userId);

    res.json({ message: "Token guardado" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};