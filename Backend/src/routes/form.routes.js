
import { Router } from "express";
import {
  createForm,
  getFormById,
  getUserForms,
  updateForm,
  deleteForm,
  getAllForms,
} from "../controllers/formController.js";

import { varifyJWT } from "../middlewares/auth.middleware.js";

//----------------------------------------------------------------------------------------

const router = Router();

//  form (secured routes)
router.route("/").post(varifyJWT, createForm);

router.route("/").get(getAllForms);

router.route("/my-forms").get(varifyJWT, getUserForms);

router.route("/:id").get(varifyJWT, getFormById);

router.route("/:id").patch(varifyJWT, updateForm);

router.route("/:id").delete(varifyJWT, deleteForm);

export default router;
