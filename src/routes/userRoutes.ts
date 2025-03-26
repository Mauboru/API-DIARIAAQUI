import { Router } from "express";
import * as UserController from "../controllers/userController";
import * as userValidator from "../validators/userValidator";

const router = Router();

router.post("/registerUser", userValidator.validateUserData, UserController.registerUser);
router.post("/login", userValidator.validateLoginData, UserController.login);
router.get("/getAllUser", UserController.getAllUser);
router.get("/getUserById/:id", UserController.getUserById);
router.put('/updateUser', userValidator.validateUpdateUserData, UserController.updateUser);
router.put('/updateUserPassword', UserController.updateUserPassword);
router.patch('/deactivateUser/:id', UserController.deactivateUser);

router.post('/verificationUserPhoneCode', UserController.verificationUserPhoneCode);
router.post('/resendUserVerificationCodeService', UserController.resendUserVerificationCodeService);

export default router;