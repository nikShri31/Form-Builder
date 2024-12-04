import {Response} from "../models/response.model.js";
import {Form} from "../models/form.model.js";
import {Question} from "../models/question.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new response
const createResponse = asyncHandler(async (req, res) => {
  const { form, responses, submittedBy } = req.body;

  if (!form || !responses || responses.length === 0) {
    throw new ApiError(400, "Form ID and responses are required.");
  }

  // Validate that all questions in the responses belong to the given form
  const questionIds = responses.map((r) => r.question);
  const validQuestions = await Question.find({
    _id: { $in: questionIds },
    form: form,
  });

  if (validQuestions.length !== questionIds.length) {
    throw new ApiError(400, "One or more questions do not belong to the specified form.");
  }

  // Create and save the response
  const newResponse = new Response({
    form,
    responses,
    submittedBy: submittedBy || null,
  });

  const savedResponse = await newResponse.save();

  return res
    .status(201)
    .json(new ApiResponse(201, savedResponse, "Response created successfully"));
});

// response by ID with populated form and question details
const getResponseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const response = await Response.findById(id)
    .populate("form", "title headerImage")
    .populate("responses.question", "questionText type image")
    .exec();

  if (!response) {
    throw new ApiError(404, "Response not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Response fetched successfully"));
});

// all responses for a specific form using aggregation pipeline
const getResponsesByForm = asyncHandler(async (req, res) => {
  const { formId } = req.params;

  const responses = await Response.aggregate([
    { $match: { form: mongoose.Types.ObjectId(formId) } }, // Match by form ID
    {
      $lookup: {
        from: "questions", // Question collection name
        localField: "responses.question",
        foreignField: "_id",
        as: "questionDetails",
      },
    },
    {
      $lookup: {
        from: "forms", // Form collection name
        localField: "form",
        foreignField: "_id",
        as: "formDetails",
      },
    },
    { $unwind: "$formDetails" }, // Unwind form details
    {
      $project: {
        form: 1,
        submittedBy: 1,
        submissionTime: 1,
        responses: 1,
        questionDetails: 1,
        "formDetails.title": 1,
        "formDetails.headerImage": 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, responses, "Responses fetched successfully"));
});

//Update a response by ID
const updateResponse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { responses } = req.body;

  if (!responses || responses.length === 0) {
    throw new ApiError(400, "Responses are required to update.");
  }

  const responseToUpdate = await Response.findById(id);

  if (!responseToUpdate) {
    throw new ApiError(404, "Response not found");
  }

  // Validate that updated questions belong to the same form
  const questionIds = responses.map((r) => r.question);
  const validQuestions = await Question.find({
    _id: { $in: questionIds },
    form: responseToUpdate.form,
  });

  if (validQuestions.length !== questionIds.length) {
    throw new ApiError(
      400,
      "One or more questions do not belong to the specified form."
    );
  }

  // Update the responses
  responseToUpdate.responses = responses;
  const updatedResponse = await responseToUpdate.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedResponse, "Response updated successfully"));
});

//Delete a response by ID
const deleteResponse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedResponse = await Response.findByIdAndDelete(id);

  if (!deletedResponse) {
    throw new ApiError(404, "Response not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedResponse, "Response deleted successfully"));
});

// all responses submitted by a specific user using aggregation pipeline
const getResponsesByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const responses = await Response.aggregate([
    { $match: { submittedBy: mongoose.Types.ObjectId(userId) } }, // Match by user ID
    {
      $lookup: {
        from: "forms", // Form collection name
        localField: "form",
        foreignField: "_id",
        as: "formDetails",
      },
    },
    {
      $lookup: {
        from: "questions", // Question collection name
        localField: "responses.question",
        foreignField: "_id",
        as: "questionDetails",
      },
    },
    { $unwind: "$formDetails" }, // Unwind form details
    {
      $project: {
        form: 1,
        responses: 1,
        submissionTime: 1,
        questionDetails: 1,
        "formDetails.title": 1,
        "formDetails.headerImage": 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, responses, "Responses fetched successfully"));
});

export {
  createResponse,
  getResponseById,
  getResponsesByForm,
  updateResponse,
  deleteResponse,
  getResponsesByUser,
};
