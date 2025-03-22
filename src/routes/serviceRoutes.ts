import { Router } from "express";
import * as ServiceController from "../controllers/serviceController";

const router = Router();

router.post("/register", ServiceController.registerService);
router.get("/get", ServiceController.getService);
router.post("/subscribe", ServiceController.subscribe);
router.delete("/unsubscribe/:id", ServiceController.unsubscribe);

router.get("/getSubscribedService", ServiceController.getSubscribedService); //talvez deva ser do user
router.get("/getUnsubscribedService", ServiceController.getUnsubscribedService); //talvez deva ser do user
router.get("/getMyServices", ServiceController.getMyServices); //talvez deva ser do user

export default router;