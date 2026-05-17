import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase"; // ← solo necesitas supabaseAdmin

export const authMiddleware = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token requerido" });
    }

    const token = authHeader.split(" ")[1];
    console.log("TOKEN RECIBIDO EN MIDDLEWARE:", token);

    // ✅ supabaseAdmin valida sin conflictos de sesión
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    console.log("RESULTADO SUPABASE:", { data, error });

    if (error || !data?.user) {
      return res.status(401).json({ error: "Token inválido o expirado" });
    }

    const user = data.user;

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: profile.role,
    };

    next();

  } catch (err) {
    return res.status(500).json({ error: "Error de autenticación" });
  }
};