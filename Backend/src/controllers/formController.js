import {Form} from "../models/form.model.js";
import {Question} from "../models/question.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// create new form
const createForm = asyncHandler(async (req, res) => {
  const { title, headerImage, questions } = req.body;

  if (!title) {
    throw new ApiError(400, "Form title is required");
  }

  const newForm = new Form({
    title,
    headerImage: headerImage || null,
    questions: questions || [],
    createdBy: req.user?._id,
  });

  const savedForm = await newForm.save();

  return res
    .status(201)
    .json(new ApiResponse(201, savedForm, "Form created successfully"));
});

// Get a single form by ID with populated questions
const getFormById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const form = await Form.findById(id)
    .populate("questions") 
    .populate("createdBy", "fullName email avatar");

  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  return res.status(200).json(new ApiResponse(200, form, "Form fetched successfully"));
});

// Get all forms created by the logged-in user
const getUserForms = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const forms = await Form.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(userId) } }, 
    {
      $lookup: {
        from: "questions", 
        localField: "questions",
        foreignField: "_id",
        as: "questionsDetails", 
      },
    },
    {
      $project: {
        title: 1,
        headerImage: 1,
        questionsDetails: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, forms, "Forms fetched successfully"));
});

// Update a form by ID
const updateForm = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, headerImage, questions } = req.body;

  const updatedForm = await Form.findByIdAndUpdate(
    id,
    {
      $set: {
        title: title || undefined,
        headerImage: headerImage || undefined,
        questions: questions || undefined,
      },
    },
    { new: true, runValidators: true }
  ).populate("questions");

  if (!updatedForm) {
    throw new ApiError(404, "Form not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedForm, "Form updated successfully"));
});

// Delete a form by ID
const deleteForm = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedForm = await Form.findByIdAndDelete(id);

  if (!deletedForm) {
    throw new ApiError(404, "Form not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedForm, "Form deleted successfully"));
});

//Get all forms
const getAllForms = asyncHandler(async (req, res) => {
  const forms = await Form.aggregate([
    {
      $lookup: {
        from: "users", 
        localField: "createdBy",
        foreignField: "_id",
        as: "creatorDetails",
      },
    },
    {
      $unwind: {
        path: "$creatorDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "questions", // Name of the Question collection
        localField: "questions",
        foreignField: "_id",
        as: "questionsDetails",
      },
    },
    {
      $project: {
        title: 1,
        headerImage: 1,
        questionsDetails: 1,
        creatorDetails: { fullName: 1, email: 1, avatar: 1 },
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return res.status(200).json(new ApiResponse(200, forms, "All forms fetched"));
});

export {
  createForm,
  getFormById,
  getUserForms,
  updateForm,
  deleteForm,
  getAllForms,
};
