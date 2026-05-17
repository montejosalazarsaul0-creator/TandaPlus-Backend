import { Request, Response } from "express";
import {joinTandaByCode,createTanda,joinTanda,addUserToTanda,removeParticipanteService,
  deleteTandaService,getMisTandas,getTandaByIdService,verificarCodigoTanda,getSolicitudes,aceptarSolicitud,rechazarSolicitud} from "../services/tandas.service.js";


export const createTandaController = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const tanda = await createTanda(req.body, userId);

    res.status(201).json({
      message: "Tanda creada correctamente",
      tanda
    });

  } catch (error: any) {
    res.status(400).json({
      error: error.message
    });
  }
};


///////////////////////
export const joinTandaController = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const tandaId = req.params.id;

    const user = await joinTanda(tandaId, userId);

    res.status(201).json({
      message: "Te uniste a la tanda correctamente",
      user,
    });

  } catch (error: any) {
    res.status(400).json({
      error: error.message,
    });
  }
};
/////////////////////////////
export const addUserToTandaController = async (req: any, res: Response) => {
  try {
    const tandaId = req.params.id;
    const { userId } = req.body;

    const participante = await addUserToTanda(tandaId, userId, req.user.id);

    res.status(201).json({
      message: "Usuario agregado correctamente",
      participante,
    });

  } catch (error: any) {
    res.status(400).json({
      error: error.message,
    });
  }
};

////////////////////////////////////////////
export const removeParticipante = async (req: any, res: Response) => {
  try {
    const { tandaId, userId } = req.params;
    const currentUserId = req.user.id; 

    const result = await removeParticipanteService(tandaId, userId, currentUserId);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};


/////////////////////////////////////////////
export const deleteTandaController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const result = await deleteTandaService(id);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/////////////////////////////////////////////////
export const getMisTandasController = async (req: any, res: Response) => {
  try {
    const userId = req.user.id; // viene del middleware

    const tandas = await getMisTandas(userId);

    res.json(tandas);
  } catch (error: any) {
    res.status(400).json({
      error: error.message,
    });
  }
};

export const getTandaByIdController = async (req: any, res: Response) => {
  try {
    const tandaId = req.params.id;
    const userId = req.user?.id;

    console.log("TANDA ID:", tandaId); 
    console.log("USER ID:", userId);   

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const tanda = await getTandaByIdService(tandaId, userId);

    res.json(tanda);
  } catch (error: any) {
    console.log("ERROR EN getTandaById:", error.message); // 
    res.status(400).json({
      error: error.message,
    });
  }
};
///////////////////////////////////////////// unirse por codigo
export const joinByCodeController = async (req: any, res: Response) => {
  try {

    const userId = req.user.id;
    const { codigo } = req.body;

    const result = await joinTandaByCode(codigo, userId);

    res.json({
      message: "Te uniste a la tanda correctamente",
      result
    });

  } catch (error: any) {

    res.status(400).json({
      error: error.message
    });

  }
};
/////////////////////////////////////// verificar codigo
export const verificarCodigoController = async (req: any, res: Response) => {
  try {

    const { codigo } = req.params;

    const tanda = await verificarCodigoTanda(codigo);

    res.json({
      valid: true,
      tanda
    });

  } catch (error: any) {
    res.status(404).json({
      valid: false,
      error: error.message
    });
  }
};
/*------------------------------------------------------------------------------ Solicitudes de unión a tanda (aceptar/rechazar) */


export const getSolicitudesController = async (req: any, res: Response) => {
  try {
    const { tandaId } = req.params;
    const currentUserId = req.user.id;
    console.log("GET SOLICITUDES - tandaId:", tandaId, "userId:", currentUserId); // 
    const solicitudes = await getSolicitudes(tandaId, currentUserId);
    res.json(solicitudes);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const aceptarSolicitudController = async (req: any, res: Response) => {
  try {
    const { tandaId, userId } = req.params;
    const currentUserId = req.user.id;
    const result = await aceptarSolicitud(tandaId, userId, currentUserId);
    res.json(result);
  } catch (error: any) {
    console.log("ERROR SOLICITUDES:", error.message); // 
    res.status(400).json({ error: error.message });
  }
};

export const rechazarSolicitudController = async (req: any, res: Response) => {
  try {
    const { tandaId, userId } = req.params;
    const currentUserId = req.user.id;
    const result = await rechazarSolicitud(tandaId, userId, currentUserId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};