
import { Router } from "express";
import {
  createResponse,
  getResponseById,
  getResponsesByForm,
  updateResponse,
  deleteResponse,
  getResponsesByUser,
} from "../controllers/responseController.js";

import { varifyJWT } from "../middlewares/auth.middleware.js";

//----------------------------------------------------------------------------------------------

const router = Router();

// Create a new response (secured routes)
router.use(varifyJWT);

router.route("/").post( createResponse);

router.route("/:id").get( getResponseById);
router.route("/form/:formId").get( getResponsesByForm);
router.route("/user/:userId").get( getResponsesByUser);

router.route("/:id").patch( updateResponse);
router.route("/:id").delete( deleteResponse);

export default router;
