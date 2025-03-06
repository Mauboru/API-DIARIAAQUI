import { Router } from "express";
import * as UserController from "../controllers/userController";
import * as userValidator from "../validators/userValidator";

const router = Router();

router.post("/register", userValidator.validateUserData, UserController.register);
router.post("/login", userValidator.validateLoginData, UserController.login);
router.get("/get", UserController.get);
router.get("/get/:id", UserController.getById);
router.put('/update', userValidator.validateUpdateUserData, UserController.update);
router.put('/updatePassword', UserController.updatePassword);
router.patch('/deactivate/:id', UserController.deactivate);

export default router;