const mongoose = require('mongoose')

const {Types} = mongoose

const commentReplayModel = require('./CommentReplay.model.js')

const commentSchema = new mongoose.Schema(
  {
    commentBody: { type: String, required: true },
    createdBy: { type: Types.ObjectId, ref: "User" },
    postId: { type: Types.ObjectId, ref: "Post" },
    replies: [{ type: Types.ObjectId, ref: "CommentReplay" }],
    likes: [{ type: Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);


commentSchema.post('findOneAndDelete',async function(doc){
  await commentReplayModel.deleteMany({commentId:doc._id})
})


const commentModel = mongoose.model("Comment", commentSchema) 
module.exports = commentModel