const mongoose = require("mongoose");

const { Types } = mongoose;

const commentReplaySchema = new mongoose.Schema(
  {
    replyBody: { type: String, required: true },
    createdBy: { type: Types.ObjectId, ref: "User" },
    postId: { type: Types.ObjectId, ref: "Post" },
    commentId: { type: Types.ObjectId, ref: "Comment" },
    replies: [{ type: Types.ObjectId, ref: "CommentReplay" }],
    likes: [{ type: Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

const commentReplayModel = mongoose.model("CommentReplay", commentReplaySchema);
module.exports = commentReplayModel;
