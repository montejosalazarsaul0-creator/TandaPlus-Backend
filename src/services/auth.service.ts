import { supabaseAdmin,supabase } from "../config/supabase";



type RegisterData = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

/* ===============================
REGISTER
=============================== */

export const registerUser = async (data: RegisterData) => {

  const { name, email, phone, password } = data;

  const { data: authData, error } = await supabaseAdmin.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!authData.user) {
    throw new Error("No se pudo crear el usuario");
  }

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .insert({
      id: authData.user.id,
      email,
      full_name: name,
      phone
    });

  if (profileError) {
    throw new Error(profileError.message);
  }

  return {
    message: "Usuario registrado correctamente",
    user: authData.user
  };

};


/* ===============================
LOGIN
=============================== */

export const loginUser = async (email: string, password: string) => {

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new Error(error.message);
  }

  return data; 

};


/* ===============================
GET PROFILE
=============================== */

export const getMyProfile = async (userId: string) => {

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;

};


