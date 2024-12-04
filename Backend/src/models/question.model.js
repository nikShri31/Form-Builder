import mongoose, { Schema } from "mongoose";

const QuestionSchema = new Schema(
  {
    form: {
      type: Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Categorize", "Cloze", "Comprehension"],
    }, // Question type
    questionText: {
      type: String,
      required: true,
    },
    image: { type: String }, // URL for question-specific image
    options: [String], // For Categorize: array of items to categorize
    categories: [String],
    correctAnswer: Schema.Types.Mixed,
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", QuestionSchema);
module.exports = Question;
