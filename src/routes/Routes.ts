import { Router } from "express";
import userRoutes from "./userRoutes";
import serviceRoutes from "./serviceRoutes";

const router = Router();

router.use("/users", userRoutes);
router.use("/services", serviceRoutes);

export default router;
