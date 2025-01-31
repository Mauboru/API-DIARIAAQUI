import { Router } from "express";
import * as UserController from "../controllers/userController";
const router = Router();

router.post("/login", UserController.login); 
router.post("/registerUser", UserController.registerUser); 
router.put("/updateUser", UserController.updateUser); 

router.get("/users", UserController.getUserData); 
router.put("/updatePassword", UserController.updatePassword); 

export default router;
