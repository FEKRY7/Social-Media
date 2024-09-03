const joi = require("joi");
const {
  isValidObjectId,
} = require("../../middleware/validation.middleware.js");

const createNewComment = joi
  .object({
    commentBody: joi.string().required(),
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();

const updateComment = joi
  .object({
    commentBody: joi.string(),
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();

const deleteComment = joi
  .object({
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();

const getCommentById = joi
  .object({
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();

const commentLikesHandler = joi
  .object({
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();

module.exports = {
  getCommentById,
  createNewComment,
  commentLikesHandler,
  deleteComment,
  updateComment,
};
