import { Request, Response } from "express";
import { supabase, supabaseAdmin } from "../config/supabase";

export const marcarPago = async (
  req: Request,
  res: Response
) => {

  try {

    const pagoId = req.params.pagoId as string;
    console.log("PAGO ID RECIBIDO EN BACKEND:", pagoId);

    const { error } = await supabaseAdmin
      .from("pagos_tanda")
      .update({
        pagado: true,
        fecha_pago: new Date()
      })
      .eq("id", pagoId);

    if (error) {
      throw new Error(error.message);
    }

    res.json({
      message: "Pago marcado correctamente"
    });

  } catch (error: any) {

    res.status(400).json({
      error: error.message
    });

  }

};