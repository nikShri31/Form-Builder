import mongoose, { Schema } from "mongoose";

const FormSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    headerImage: { type: String }, // URL for the form's header image
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Form = mongoose.model("Form", FormSchema);
module.exports = Form;
