import { Router } from "express";
import * as UserController from "../controllers/userController";
import * as userValidator from "../validators/userValidator";

const router = Router();

router.post("/register", userValidator.validateUserData, UserController.register);
router.post("/login", userValidator.validateLoginData, UserController.login);

// router.get("/profile/:id", UserController.getUserProfile);
// router.put("/update/:id", UserController.updateUser);
// router.delete("/delete/:id", UserController.deleteUser);

export default router;
