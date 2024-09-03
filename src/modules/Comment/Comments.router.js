const express = require("express");
const router = express.Router();
const isAuthenticated = require("../../middleware/authentication.middeleware.js");
const isAuthorized = require("../../middleware/authoriztion.middelware.js");
const { validation } = require("../../middleware/validation.middleware.js");

const {
  getCommentById,
  createNewComment,
  commentLikesHandler,
  deleteComment,
  updateComment,
} = require("./Comments.validators.js");

const {
  GetAllComments,
  GetCommentById,
  CeateNewComment,
  CommentsLikesHandler,
  DeleteComment,
  UpdateComment,
} = require("./Comments.controller.js");

router.route("/").get(GetAllComments);
router
  .route("/:id")
  .get(validation(getCommentById), GetCommentById)
  .post(
    isAuthenticated,
    isAuthorized("User"),
    validation(createNewComment),
    CeateNewComment
  )
  .patch(
    isAuthenticated,
    isAuthorized("User"),
    validation(commentLikesHandler),
    CommentsLikesHandler
  )
  .delete(
    isAuthenticated,
    isAuthorized("User"),
    validation(deleteComment),
    DeleteComment
  )
  .put(
    isAuthenticated,
    isAuthorized("User"),
    validation(updateComment),
    UpdateComment
  );

module.exports = router;
