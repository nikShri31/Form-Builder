import mongoose, { Schema } from "mongoose";

const ResponseSchema = new Schema({
  form: {
    type: Schema.Types.ObjectId,
    ref: "Form",
    required: true,
  },

  responses: [
    {
      question: {
        type: Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
      answer: Schema.Types.Mixed, // User's response to the question
    },
  ],

  submittedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  submissionTime: { type: Date, default: Date.now },
});

const Response = mongoose.model("Response", ResponseSchema);
module.exports = Response;
