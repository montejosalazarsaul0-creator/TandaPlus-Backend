import { Request, Response } from "express";
import { supabase,supabaseAdmin } from "../config/supabase.js";

export const deleteProfile = async (req: Request, res: Response) => {
  try {

    const userId = req.params.id;

    const { error } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (error) throw new Error(error.message);

    res.json({ message: "Perfil eliminado correctamente" });

  } catch (error: any) {

    res.status(400).json({
      error: error.message
    });

  }
};