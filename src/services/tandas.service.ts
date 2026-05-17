import { supabase,supabaseAdmin } from "../config/supabase";

const generarCodigoInvitacion = () => {
  const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let codigo = "";

  for (let i = 0; i < 5; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }

  return codigo;
};

export const createTanda = async (data: any, userId: string) => {
  const {
    nombre,
    monto_total,
    cantidad_participantes,
    pago_por_participante,
    periodo_pago,
    fecha_inicio
  } = data;

  const codigo = generarCodigoInvitacion();

  // =========================
  // CREAR TANDA
  // =========================
  const { data: tanda, error } = await supabaseAdmin
    .from("tandas")
    .insert([
      {
        nombre,
        monto_total,
        cantidad_participantes,
        pago_por_participante,
        periodo_pago,
        fecha_inicio,
        created_by: userId,
        estado: "activa",
        codigo_invitacion: codigo
      }
    ])
    .select(`
      id,
      nombre,
      codigo_invitacion,
      monto_total,
      cantidad_participantes
    `)
    .single();

  if (error || !tanda) {
    throw new Error(error?.message || "No se pudo crear la tanda");
  }

  // =========================
  // INSERTAR ADMIN
  // =========================
  const { error: participantError } = await supabaseAdmin
    .from("tanda_participantes")
    .insert([
      {
        tanda_id: tanda.id,
        user_id: userId,
        turno: 1,
        role: "admin"
      }
    ]);

  if (participantError) {
    throw new Error(participantError.message);
  }

  // =========================
  // 🔥 CREAR PAGO PARA ADMIN (FIX CLAVE)
  // =========================
  const { error: pagoError } = await supabaseAdmin
    .from("pagos_tanda")
    .insert([
      {
        tanda_id: tanda.id,
        user_id: userId,
        turno: 1,
        pagado: false,
        fecha_pago: null
 
      }
    ]);

  if (pagoError) {
    throw new Error(pagoError.message);
  }

  // =========================
  // RETURN
  // =========================
  return tanda;
};


/*////////////////////// usuario se une a tanda
export const joinTanda = async (tandaId: string, userId: string) => {

  // Verificar que la tanda exista
  const { data: tanda, error: tandaError } = await supabaseAdmin
    .from("tandas")
    .select("*")
    .eq("id", tandaId)
    .single();

  if (tandaError || !tanda) {
    throw new Error("La tanda no existe");
  }

  // Verificar que esté activa
  if (tanda.estado !== "activa") {
    throw new Error("La tanda no está activa");
  }

  // Verificar si ya está inscrito
  const { data: existing } = await supabaseAdmin
    .from("tanda_participantes")
    .select("*")
    .eq("tanda_id", tandaId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    throw new Error("Ya estás inscrito en esta tanda");
  }

  // Contar participantes actuales
  const { count, error: countError } = await supabaseAdmin
    .from("tanda_participantes")
    .select("*", { count: "exact", head: true })
    .eq("tanda_id", tandaId);

  if (countError) {
    throw new Error(countError.message);
  }

  // Verificar que no esté llena
  if ((count ?? 0) >= tanda.cantidad_participantes) {
    throw new Error("La tanda ya está llena");
  }

  // Asignar turno automático
  const turnoAsignado = (count ?? 0) + 1;

  // Insertar participación
  const { data: participante, error: insertError } = await supabaseAdmin
    .from("tanda_participantes")
    .insert([
      {
        tanda_id: tandaId,
        user_id: userId,
        turno: turnoAsignado,
      },
    ])
    .select()
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  //Crear registro de pago para este participante
  const { error: pagoError } = await supabaseAdmin
    .from("pagos_tanda")
    .insert({
      tanda_id: tandaId,
      user_id: userId,
      turno: turnoAsignado,
      pagado: false
    });

  if (pagoError) {
    throw new Error(pagoError.message);
  }

  return participante;
};
*/

//////////////////////////////// usuario se une a tanda por código
export const joinTandaByCode = async (codigo: string, userId: string) => {

  // Buscar tanda por código
  const { data: tanda, error } = await supabaseAdmin
    .from("tandas")
    .select("id")
    .eq("codigo_invitacion", codigo)
    .single();

  if (error || !tanda) {
    throw new Error("Código de invitación inválido");
  }

  // reutilizamos la lógica existente
  return await joinTanda(tanda.id, userId);
};

//////////////////////// verificar código de tanda
export const verificarCodigoTanda = async (codigo: string) => {

  const { data: tanda, error } = await supabaseAdmin
    .from("tandas")
    .select("id, nombre, cantidad_participantes")
    .eq("codigo_invitacion", codigo)
    .single();

  if (error || !tanda) {
    throw new Error("Código inválido");
  }

  return tanda;
};

//////////////////////////////////////// admin agrega usuario
export const addUserToTanda = async (
  tandaId: string,
  userIdToAdd: string,
  currentUserId: string
) => {

  // Verificar si es ADMIN
  const { data: adminCheck } = await supabase
    .from("tanda_participantes")
    .select("*")
    .eq("tanda_id", tandaId)
    .eq("user_id", currentUserId)
    .eq("role", "admin")
    .maybeSingle();

  if (!adminCheck) {
    throw new Error("No tienes permisos para agregar usuarios");
  }

  // Insertar nuevo miembro
  const { error } = await supabase
    .from("tanda_participantes")
    .insert([
      {
        tanda_id: tandaId,
        user_id: userIdToAdd,
        turno: 0, // luego puedes calcularlo
        role: "member"
      }
    ]);

  if (error) throw new Error(error.message);
};



/////////////////////////////////// admin elimina usuario
export const removeParticipanteService = async (
  tandaId: string,
  userId: string,
  currentUserId: string  // 👈 agrega este parámetro
) => {

  // ✅ Verificar que quien elimina es admin de ESTA tanda
  const { data: adminCheck } = await supabaseAdmin
    .from("tanda_participantes")
    .select("role")
    .eq("tanda_id", tandaId)
    .eq("user_id", currentUserId)
    .single();

  if (!adminCheck || adminCheck.role !== "admin") {
    throw new Error("No tienes permisos para realizar esta acción");
  }

  // Buscar participante
  const { data: participante, error: findError } = await supabaseAdmin
    .from("tanda_participantes")
    .select("id, turno")
    .eq("tanda_id", tandaId)
    .eq("user_id", userId)
    .single();

  if (findError || !participante) throw new Error("Participante no encontrado");

  const turnoEliminado = Number(participante.turno);

  // Eliminar participante
  const { error: deleteError } = await supabaseAdmin
    .from("tanda_participantes")
    .delete()
    .eq("id", participante.id);

  if (deleteError) throw new Error(deleteError.message);

  // Obtener participantes que deben bajar turno
  const { data: participantesRestantes, error: fetchError } = await supabaseAdmin
    .from("tanda_participantes")
    .select("id, turno")
    .eq("tanda_id", tandaId)
    .gt("turno", turnoEliminado);

  if (fetchError) throw new Error(fetchError.message);

  // Reordenar turnos
  for (const p of participantesRestantes || []) {
    await supabaseAdmin
      .from("tanda_participantes")
      .update({ turno: p.turno - 1 })
      .eq("id", p.id);
  }

  return { message: "Participante eliminado y turnos actualizados" };
};


////////////////////////////////////////////eliminar tanda
export const deleteTandaService = async (tandaId: string) => {
  const { data, error } = await supabase
    .from("tandas")
    .delete()
    .eq("id", tandaId)
    .select(); // 

  if (error) {
    throw new Error(error.message);
  }

  // Si no eliminó nada, es porque RLS bloqueó o no existe
  if (!data || data.length === 0) {
    throw new Error("No tienes permiso para eliminar esta tanda");
  }

  return { message: "Tanda eliminada correctamente" };
};


/////////////////////////////////////// 
export const getMisTandas = async (userId: string) => {
  const { data, error } = await supabase
    .from("tanda_participantes")
    .select(`
      turno,
      role,
      tandas (
        id,
        nombre,
        monto_total,
        cantidad_participantes,
        estado
      )
    `)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

//////////////////////////////////////////// 
export const getTandaByIdService = async (
  tandaId: string,
  userId: string
) => {

  const { data: participante, error: participanteError } =
    await supabaseAdmin
      .from("tanda_participantes")
      .select("turno, role")
      .eq("tanda_id", tandaId)
      .eq("user_id", userId)
      .single();

  if (participanteError || !participante) {
    throw new Error("No perteneces a esta tanda");
  }

  const { data: tanda, error: tandaError } =
    await supabaseAdmin
      .from("tandas")
      .select(`
        id,
        nombre,
        codigo_invitacion,
        monto_total,
        cantidad_participantes,
        estado,
        fecha_inicio,
        periodo_pago
      `)
      .eq("id", tandaId)
      .single();

  if (tandaError || !tanda) {
    throw new Error("No se pudo obtener la tanda");
  }

  const { data: participantesBase, error: participantesError } =
    await supabaseAdmin
      .from("tanda_participantes")
      .select("turno, role, user_id")
      .eq("tanda_id", tandaId)
      .order("turno", { ascending: true });

  if (participantesError) {
    throw new Error(participantesError.message);
  }

  const userIds = participantesBase?.map(p => p.user_id) || [];

  const { data: profiles, error: profilesError } =
    await supabaseAdmin
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const { data: pagos, error: pagosError } =
    await supabaseAdmin
      .from("pagos_tanda")
      .select("*")
      .eq("tanda_id", tandaId);

  if (pagosError) {
    throw new Error(pagosError.message);
  }

  console.log("PAGOS ENCONTRADOS:", JSON.stringify(pagos)); // 👈
  console.log("PARTICIPANTES BASE:", JSON.stringify(participantesBase)); // 👈

  const participantesFinal =
    participantesBase?.map(p => {

      const profile = profiles?.find(pr => pr.id === p.user_id);
      const pago = pagos?.find(pg => pg.user_id === p.user_id);

      const resultado = {
        id: profile?.id ?? null,
        nombre: profile?.full_name ?? null,
        turno: p.turno,
        role: p.role,
        pago_id: pago?.id ?? null,
        pagado: pago?.pagado ?? false
      };

      console.log(`PARTICIPANTE ${p.user_id} → pago_id: ${resultado.pago_id}`); // 👈

      return resultado;

    }) || [];

  const pagosPagados = participantesFinal.filter(p => p.pagado).length;
  const progreso = Math.round((pagosPagados / tanda.cantidad_participantes) * 100);

  if (pagosPagados === tanda.cantidad_participantes && tanda.estado === "activa") {
    await supabaseAdmin
      .from("tandas")
      .update({ estado: "finalizada" })
      .eq("id", tandaId);
    tanda.estado = "finalizada";
  }

  return {
    id: tanda.id,
    nombre: tanda.nombre,
    codigo_invitacion: tanda.codigo_invitacion,
    monto_total: tanda.monto_total,
    cantidad_participantes: tanda.cantidad_participantes,
    estado: tanda.estado,
    fecha_inicio: tanda.fecha_inicio,
    periodo_pago: tanda.periodo_pago,
    mi_turno: participante.turno,
    role: participante.role,
    participantes: participantesFinal,
    progreso,
    pagos_pagados: pagosPagados
  };

};

///////////////////////// calcular turno actual
export const calcularTurnoActual = (fechaInicio: string, periodo: string) => {

const inicio = new Date(fechaInicio);
const ahora = new Date();

const diff = ahora.getTime() - inicio.getTime();

const dias = diff / (1000 * 60 * 60 * 24);

switch(periodo){

case "semanal":
return Math.floor(dias / 7) + 1;

case "quincenal":
return Math.floor(dias / 15) + 1;

case "mensual":
return Math.floor(dias / 30) + 1;

default:
return 1;

}

};



/* check list para el join por código */

// Cuando alguien se une por código → estado pendiente
export const joinTanda = async (tandaId: string, userId: string) => {

  // Verificar que la tanda exista
  const { data: tanda, error: tandaError } = await supabaseAdmin
    .from("tandas")
    .select("*")
    .eq("id", tandaId)
    .single();

  if (tandaError || !tanda) throw new Error("La tanda no existe");
  if (tanda.estado !== "activa") throw new Error("La tanda no está activa");

  // Verificar si ya está inscrito
  const { data: existing } = await supabaseAdmin
    .from("tanda_participantes")
    .select("*")
    .eq("tanda_id", tandaId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) throw new Error("Ya estás inscrito en esta tanda");

  // Contar participantes activos (no pendientes)
  const { count, error: countError } = await supabaseAdmin
    .from("tanda_participantes")
    .select("*", { count: "exact", head: true })
    .eq("tanda_id", tandaId)
    .eq("estado", "activo"); // 👈 solo contar activos

  if (countError) throw new Error(countError.message);

  if ((count ?? 0) >= tanda.cantidad_participantes) {
    throw new Error("La tanda ya está llena");
  }

  const turnoAsignado = (count ?? 0) + 1;

  // Insertar con estado pendiente
  const { data: participante, error: insertError } = await supabaseAdmin
    .from("tanda_participantes")
    .insert([{
      tanda_id: tandaId,
      user_id: userId,
      turno: turnoAsignado,
      estado: "pendiente", // 👈 pendiente hasta que admin acepte
      role: "member"
    }])
    .select()
    .single();

  if (insertError) throw new Error(insertError.message);

  // ⚠️ NO crear pago — se crea cuando el admin acepte

  return participante;
};

// Obtener solicitudes pendientes de una tanda
export const getSolicitudes = async (tandaId: string, currentUserId: string) => {

  // Verificar que es admin de la tanda
  const { data: adminCheck } = await supabaseAdmin
    .from("tanda_participantes")
    .select("role")
    .eq("tanda_id", tandaId)
    .eq("user_id", currentUserId)
    .single();

    console.log("ADMIN CHECK:", adminCheck); // 👈

  if (!adminCheck || adminCheck.role !== "admin") {
    throw new Error("No tienes permisos");
  }

  // Obtener pendientes
  const { data: pendientes, error } = await supabaseAdmin
    .from("tanda_participantes")
    .select("user_id, turno")
    .eq("tanda_id", tandaId)
    .eq("estado", "pendiente");

    console.log("PENDIENTES:", pendientes, "ERROR:", error); // 👈


  if (error) throw new Error(error.message);

  const userIds = pendientes?.map(p => p.user_id) || [];

  if (userIds.length === 0) return [];

  // Traer perfiles
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email")
    .in("id", userIds);

  return pendientes?.map(p => ({
    user_id: p.user_id,
    turno: p.turno,
    nombre: profiles?.find(pr => pr.id === p.user_id)?.full_name ?? "Desconocido",
    email: profiles?.find(pr => pr.id === p.user_id)?.email ?? ""
  }));
};

// Aceptar solicitud
export const aceptarSolicitud = async (tandaId: string, userId: string, currentUserId: string) => {

  // Verificar admin
  const { data: adminCheck } = await supabaseAdmin
    .from("tanda_participantes")
    .select("role")
    .eq("tanda_id", tandaId)
    .eq("user_id", currentUserId)
    .single();

  if (!adminCheck || adminCheck.role !== "admin") {
    throw new Error("No tienes permisos");
  }

  // Cambiar estado a activo
  const { data: participante, error } = await supabaseAdmin
    .from("tanda_participantes")
    .update({ estado: "activo" })
    .eq("tanda_id", tandaId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Ahora sí crear el pago
  const { error: pagoError } = await supabaseAdmin
    .from("pagos_tanda")
    .insert({
      tanda_id: tandaId,
      user_id: userId,
      turno: participante.turno,
      pagado: false
    });

  if (pagoError) throw new Error(pagoError.message);

  return { message: "Solicitud aceptada" };
};

// Rechazar solicitud
export const rechazarSolicitud = async (tandaId: string, userId: string, currentUserId: string) => {

  // Verificar admin
  const { data: adminCheck } = await supabaseAdmin
    .from("tanda_participantes")
    .select("role")
    .eq("tanda_id", tandaId)
    .eq("user_id", currentUserId)
    .single();

  if (!adminCheck || adminCheck.role !== "admin") {
    throw new Error("No tienes permisos");
  }

  // Eliminar la solicitud
  const { error } = await supabaseAdmin
    .from("tanda_participantes")
    .delete()
    .eq("tanda_id", tandaId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  return { message: "Solicitud rechazada" };
};