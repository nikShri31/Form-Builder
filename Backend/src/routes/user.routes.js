import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
} from "../controllers/authControllers.js";

import { upload } from "../middlewares/multer.middleware.js";
import { varifyJWT } from "../middlewares/auth.middleware.js";

//-----------------------------------------------------------------------------------

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(varifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/current-user").get(varifyJWT, getCurrentUser);

router.route("/update-account").patch(varifyJWT, updateAccountDetails);
router
  .route("/avatar")
  .patch(varifyJWT, upload.single("avatar"), updateUserAvatar);

export default router;
