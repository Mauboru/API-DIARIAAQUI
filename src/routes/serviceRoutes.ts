import { Router } from "express";
import * as ServiceController from "../controllers/serviceController";

const router = Router();

router.post("/register", ServiceController.registerService);
router.get("/get", ServiceController.getService);
router.get("/getSubscriptionByUser", ServiceController.getSubscriptionByUser); //talvez deva ser do user
router.post("/subscribe", ServiceController.subscribe);
router.delete("/unsubscribe/:id", ServiceController.unsubscribe);

export default router;