import Question from "../models/Question.js";
import Form from "../models/Form.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new question
const createQuestion = asyncHandler(async (req, res) => {
  const { form, type, questionText, image, options, categories, correctAnswer } = req.body;

  // Validate required fields
  if (!form || !type || !questionText) {
    throw new ApiError(400, "Form ID, question type, and question text are required.");
  }

  const newQuestion = new Question({
    form,
    type,
    questionText,
    image: image || null,
    options: options || [],
    categories: categories || [],
    correctAnswer: correctAnswer || null,
  });

  const savedQuestion = await newQuestion.save();

  // Add the question ID to the corresponding form
  await Form.findByIdAndUpdate(
    form,
    { $push: { questions: savedQuestion._id } },
    { new: true }
  );

  return res
    .status(201)
    .json(new ApiResponse(201, savedQuestion, "Question created successfully"));
});

// Get a question by ID with populated form details
const getQuestionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const question = await Question.findById(id)
    .populate("form", "title headerImage createdBy") // Populate form details
    .exec();

  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, question, "Question fetched successfully"));
});

// Get all questions for a specific form using aggregation pipeline
const getQuestionsByForm = asyncHandler(async (req, res) => {
  const { formId } = req.params;

  const questions = await Question.aggregate([
    { $match: { form: mongoose.Types.ObjectId(formId) } }, // Match questions by form ID
    {
      $lookup: {
        from: "forms", // Form collection name
        localField: "form",
        foreignField: "_id",
        as: "formDetails",
      },
    },
    {
      $unwind: "$formDetails", // Unwind to deconstruct array
    },
    {
      $project: {
        type: 1,
        questionText: 1,
        image: 1,
        options: 1,
        categories: 1,
        correctAnswer: 1,
        "formDetails.title": 1,
        "formDetails.headerImage": 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, questions, "Questions fetched successfully"));
});

// Update a question by ID
const updateQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, questionText, image, options, categories, correctAnswer } =
    req.body;

  const updatedQuestion = await Question.findByIdAndUpdate(
    id,
    {
      $set: {
        type: type || undefined,
        questionText: questionText || undefined,
        image: image || undefined,
        options: options || undefined,
        categories: categories || undefined,
        correctAnswer: correctAnswer || undefined,
      },
    },
    { new: true, runValidators: true }
  ).populate("form", "title headerImage createdBy");

  if (!updatedQuestion) {
    throw new ApiError(404, "Question not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedQuestion, "Question updated successfully"));
});

//Delete a question by ID
 const deleteQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedQuestion = await Question.findByIdAndDelete(id);

  if (!deletedQuestion) {
    throw new ApiError(404, "Question not found");
  }

  // Remove the question ID from the associated form
  await Form.findByIdAndUpdate(deletedQuestion.form, {
    $pull: { questions: deletedQuestion._id },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, deletedQuestion, "Question deleted successfully"));
});

// Get all questions with aggregation for admin or analytics
const getAllQuestions = asyncHandler(async (req, res) => {
  const questions = await Question.aggregate([
    {
      $lookup: {
        from: "forms", // Form collection name
        localField: "form",
        foreignField: "_id",
        as: "formDetails",
      },
    },
    {
      $unwind: "$formDetails", // Unwind to get single form document
    },
    {
      $project: {
        type: 1,
        questionText: 1,
        image: 1,
        options: 1,
        categories: 1,
        correctAnswer: 1,
        "formDetails.title": 1,
        "formDetails.headerImage": 1,
        "formDetails.createdBy": 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, questions, "All questions fetched successfully"));
});

export {
  createQuestion,
  getQuestionById,
  getQuestionsByForm,
  updateQuestion,
  deleteQuestion,
  getAllQuestions,
};
