import dotenv from "dotenv";
dotenv.config();

import express from "express";
import profileRoutes from './routes/profile.routes';
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import tandasRoutes from "./routes/tandas.routes";
import pagosRoutes from "./routes/pagos.routes";

const app = express(); 

app.use(cors());
app.use(express.json());
app.use('/api', profileRoutes);


app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/tandas", tandasRoutes);
app.use("/api", pagosRoutes);



app.listen(3000, () => {
  console.log("Servidor ejecutándose en puerto 3000");
});
console.log("URL:", process.env.SUPABASE_URL);
console.log("ANON:", process.env.SUPABASE_ANON_KEY?.slice(0, 20));
console.log("SERVICE:", process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20));
