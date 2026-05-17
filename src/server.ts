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

// ✅ Puerto dinámico para Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});

