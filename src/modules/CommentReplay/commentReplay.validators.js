const joi = require("joi");
const {
  isValidObjectId,
} = require("../../middleware/validation.middleware.js");

const createNewCommentReplay = joi
  .object({
    replyBody: joi.string().required(),
    postId: joi.string().custom(isValidObjectId).required(),
    commentId: joi.string().custom(isValidObjectId).required(),
  })
  .required();

const updateCommentReplay = joi
  .object({
    replyBody: joi.string(),
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();

const deleteCommentReplay = joi
  .object({
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();

const getCommentReplayById = joi
  .object({
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();

const commentReplayLikesHandler = joi
  .object({
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();

module.exports = {
  getCommentReplayById,
  createNewCommentReplay,
  commentReplayLikesHandler,
  deleteCommentReplay,
  updateCommentReplay,
};
