import { Router } from "express";
import * as UserController from "../controllers/userController";
import * as ServiceController from "../controllers/serviceController";
const router = Router();

router.post("/login", UserController.login); 
router.post("/registerUser", UserController.registerUser); 
router.put("/updateUser", UserController.updateUser); 

router.post("/sendVerificationCode", UserController.sendVerificationCode); 

router.get("/users", UserController.getUserData); 
router.put("/updatePassword", UserController.updatePassword); 

router.post("/registerService", ServiceController.registerService); 
router.get("/getService", ServiceController.getService); 

export default router;
