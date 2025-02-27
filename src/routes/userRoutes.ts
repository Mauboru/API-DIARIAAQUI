import { Router } from "express";
import * as UserController from "../controllers/userController";
import * as userValidator from "../validators/userValidator";

const router = Router();

router.post("/register", userValidator.validateUserData, UserController.register);
router.post("/login", userValidator.validateLoginData, UserController.login);
router.get("/get", UserController.get);
router.put('/update', userValidator.validateUpdateUserData, UserController.update);


export default router;
