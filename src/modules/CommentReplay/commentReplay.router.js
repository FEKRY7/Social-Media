const express = require("express");
const router = express.Router();
const isAuthenticated = require("../../middleware/authentication.middeleware.js");
const isAuthorized = require("../../middleware/authoriztion.middelware.js");
const { validation } = require("../../middleware/validation.middleware.js");

const {
  getCommentReplayById,
  createNewCommentReplay,
  commentReplayLikesHandler,
  deleteCommentReplay,
  updateCommentReplay,
} = require("./commentReplay.validators.js");

const {
  GetAllcommentReplays,
  GetCommentReplayById,
  CeateNewCommentReplay,
  CommentsReplayLikesHandler,
  DeleteCommentReplay,
  UpdateCommentReplay,
} = require("./commentReplay.controller.js");

router
  .route("/")
  .get(GetAllcommentReplays)
  .post(
    isAuthenticated,
    isAuthorized("User"),
    validation(createNewCommentReplay),
    CeateNewCommentReplay
  );

router
  .route("/:id")
  .get(validation(getCommentReplayById), GetCommentReplayById)
  .put(
    isAuthenticated,
    isAuthorized("User"),
    validation(updateCommentReplay),
    UpdateCommentReplay
  )
  .delete(
    isAuthenticated,
    isAuthorized("User"),
    validation(deleteCommentReplay),
    DeleteCommentReplay
  )
  .patch(
    isAuthenticated,
    isAuthorized("User"),
    validation(commentReplayLikesHandler),
    CommentsReplayLikesHandler
  );

module.exports = router;
