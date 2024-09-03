const commentModel = require("../../../Database/models/Comment.model.js");
const postModel = require("../../../Database/models/Post.model.js");
const commentReplayModel = require("../../../Database/models/CommentReplay.model.js");
const { deleteOneById, getOneById } = require("../../utils/Reuseable.js");
const http = require("../../folderS,F,E/S,F,E.JS");
const { First, Second, Third } = require("../../utils/httperespons.js");

// ceateNewcommentReplayController
const CeateNewCommentReplay = async (req, res, next) => {
  try {
    const { postId, commentId } = req.body;

    const isExistPost = await postModel.findById(postId);
    if (!isExistPost) return First(res, "Invaild Post Id", 404, http.FAIL);

    const isExistComment = await commentModel.findById(commentId);
    if (!isExistComment)
      return First(res, "Invaild Comment Id", 404, http.FAIL);

    req.body.createdBy = req.user._id;
    req.body.commentId = isExistComment._id;
    req.body.postId = isExistComment.postId;

    const commentReplay = await commentReplayModel.create(req.body);
    isExistComment.replies.push(commentReplay._id);
    isExistComment.save();

    return Second(res, ["Done", commentReplay], 201, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

// updatecommentReplay
const UpdateCommentReplay = async (req, res, next) => {
  try {
    // commentId
    const { id } = req.params;

    const isExistcommentReplay = await commentReplayModel.findById(id);
    if (!isExistcommentReplay)
      return First(res, "This commentReplay Is Not Exist", 404, http.FAIL);
    if (isExistcommentReplay.createdBy.toString() !== req.user._id.toString())
      return First(res, "Not Auth To update This Comment", 401, http.FAIL);

    isExistcommentReplay.replyBody = req.body.replyBody;
    isExistcommentReplay.save();

    return Second(res, ["Done", isExistcommentReplay], 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

// deletecommentReplay
const DeleteCommentReplay = async (req, res, next) => {
  try {
    const { id } = req.params;
    // const isExistcommentReplay = await commentReplayModel.findOneAndDelete({_id:id, createdBy:req.user._id});
    const isExistcommentReplay = await commentReplayModel.findById(id);
    if (!isExistcommentReplay)
      return First(res, "This commentReplay Is Not Exist", 404, http.FAIL);
    const isAuth = await commentReplayModel.findOneAndDelete({
      _id: id,
      createdBy: req.user._id,
    });
    if (!isAuth) return First(res, "Not Auth To delete This", 401, http.FAIL);

    return Second(res, ["Deleted Successfully"], 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

//commentReplaysLikesHandler
const CommentsReplayLikesHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const commentReplay = await commentReplayModel.findById(id);
    if (!commentReplay) {
      return First(res, "This commentReplay is Not Exist", 404, http.FAIL);
    }

    // i will use save() method and we can handle it by addtoset and pull
    if (!commentReplay.likes.includes(req.user._id)) {
      commentReplay.likes.push(req.user._id);
      commentReplay.save();
    } else {
      commentReplay.likes.pop(req.user._id);
      commentReplay.save();
    }
    return Second(res, ["Done", commentReplay], 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

// getcommentReplayById
const GetCommentReplayById = getOneById(commentReplayModel);

// getAllcommentReplays
const GetAllcommentReplays = async (req, res, next) => {
  try {
    const allcommentReplays = await commentReplayModel.find({});
    if (!allcommentReplays) {
      return First(
        res,
        "No CommentReplays found or CommentReplays still pending",
        404,
        http.FAIL
      );
    }
    return Second(res, ["Done", allcommentReplays], 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

module.exports = {
  GetAllcommentReplays,
  GetCommentReplayById,
  CeateNewCommentReplay,
  CommentsReplayLikesHandler,
  DeleteCommentReplay,
  UpdateCommentReplay,
};
