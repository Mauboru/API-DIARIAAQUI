import { Router } from "express";
import * as UserController from "../controllers/userController";
import { validateUserData } from "../validators/userValidator";

const router = Router();

router.post("/register", validateUserData, UserController.registerUser);

// router.post("/login", UserController.loginUser);
// router.get("/profile/:id", UserController.getUserProfile);
// router.put("/update/:id", UserController.updateUser);
// router.delete("/delete/:id", UserController.deleteUser);

export default router;
