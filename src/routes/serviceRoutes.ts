import { Router } from "express";
import * as ServiceController from "../controllers/serviceController";

const router = Router();

router.post("/register", ServiceController.registerService);
router.get("/get", ServiceController.getService);

export default router;