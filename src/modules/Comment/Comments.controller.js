const commentModel = require("../../../Database/models/Comment.model.js");
const postModel = require("../../../Database/models/Post.model.js");
const { deleteOneById, getOneById } = require("../../utils/Reuseable.js");
const http = require("../../folderS,F,E/S,F,E.JS");
const { First, Second, Third } = require("../../utils/httperespons.js");

// ceateNewComment
const CeateNewComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const isExistPost = await postModel.findById(id);
    if (!isExistPost) return First(res, "Invaild Post Id", 404, http.FAIL);

    req.body.createdBy = req.user._id;
    req.body.postId = isExistPost._id;

    const comment = await commentModel.create(req.body);

    isExistPost.comments.push(comment._id);
    isExistPost.save();

    return Second(res, ["Done", comment], 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

// updateComment
const UpdateComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const isExistcomment = await commentModel.findById(id);
    if (!isExistcomment)
      return First(res, "Invaild comment Id", 404, http.FAIL);

    const isAuth = await commentModel.findOneAndUpdate(
      { _id: id, createdBy: req.user._id },
      req.body,
      { new: true }
    );

    if (!isAuth) return First(res, "Not Auth To update This", 401, http.FAIL);

    return res.status(200).json({ message: "Done", isExistcomment });
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

// deleteComment
const DeleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    // const isExistComment = await commentModel.findOneAndDelete({_id:id, createdBy:req.user._id});
    const isExistComment = await commentModel.findById(id);
    if (!isExistComment)
      return First(res, "This Comment Is Not Exist", 401, http.FAIL);

    const isAuth = await commentModel.findOneAndDelete({
      _id: id,
      createdBy: req.user._id,
    });

    if (!isAuth) return First(res, "Not Auth To delete This", 401, http.FAIL);

    return Second(res, "Deleted Successfully", 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

//commentsLikesHandler
const CommentsLikesHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await commentModel.findById(id);
    if (!comment) {
      return First(res, "This comment is Not Exist", 404, http.FAIL);
    }

    // i will use save() method and we can handle it by addtoset and pull
    if (!comment.likes.includes(req.user._id)) {
      comment.likes.push(req.user._id);
      comment.save();
    } else {
      comment.likes.pop(req.user._id);
      comment.save();
    }

    return Second(res, ["Done", comment], 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

// getCommentById
const GetCommentById = getOneById(commentModel);

// getAllComments
const GetAllComments = async (req, res, next) => {
  try {
    const allComments = await commentModel.find({});
    if (!allComments) {
      return First(
        res,
        "No Comments found or Comments still pending",
        404,
        http.FAIL
      );
    }
    return Second(res, ["Done", allComments], 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

module.exports = {
  GetAllComments,
  GetCommentById,
  CeateNewComment,
  CommentsLikesHandler,
  DeleteComment,
  UpdateComment,
};
