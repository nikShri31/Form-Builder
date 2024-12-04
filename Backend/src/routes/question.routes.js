
import { Router } from "express";
import {
  createQuestion,
  getQuestionById,
  getQuestionsByForm,
  updateQuestion,
  deleteQuestion,
  getAllQuestions,
} from "../controllers/questionController.js";

import { varifyJWT } from "../middlewares/auth.middleware.js";

//------------------------------------------------------------------------------

const router = Router();

// question (secured routes)
router.route("/").post(varifyJWT, createQuestion);

router.route("/:id").get(varifyJWT, getQuestionById);
router.route("/form/:formId").get(varifyJWT, getQuestionsByForm);
router.route("/").get(varifyJWT, getAllQuestions);

router.route("/:id").patch(varifyJWT, updateQuestion);

router.route("/:id").delete(varifyJWT, deleteQuestion);

export default router;
