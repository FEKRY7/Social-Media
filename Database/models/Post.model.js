const mongoose = require('mongoose')

const {Types} = mongoose

const commentReplayModel = require('./CommentReplay.model.js')
const commentModel = require('./Comment.model.js')

const postSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    images: [{}],
    videos: [{}],
    likes: [{ type: Types.ObjectId, ref: "User" }],
    createdBy: { type: Types.ObjectId, ref: "User" },
    comments: [{ type: Types.ObjectId, ref: "Comment" }],
    privacy: {
      type: String,
      enum: ["Public", "Only Me", "Private"],
      default: "Public",
    },
  },
  {
    timestamps: true,
  }
);


postSchema.post('findOneAndDelete',async function(doc){
  const comments = await commentModel.deleteMany({postId:doc._id})
  const commentsReplay = await commentReplayModel.deleteMany({commentId:comments._id})
})

const postModel = mongoose.model("Post", postSchema) 
module.exports = postModel