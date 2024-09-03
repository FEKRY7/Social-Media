const joi = require("joi");
const {
  isValidObjectId,
} = require("../../middleware/validation.middleware.js");

const createNewPost = joi
  .object({
    content: joi.string().required(), // Ensure 'content' is a required string
    privacy: joi.string(), // Optional privacy field with allowed values and a default
    images: joi.array().items(joi.string().uri()).max(5), // Ensure images is an array of valid URIs and limit to 5
    videos: joi.array().items(joi.string().uri()).max(2), // Ensure videos is an array of valid URIs and limit to 2
  })
  .required();

const updatePost = joi
  .object({
    content: joi.string(),
    privacy: joi.string(),
    images: joi.array().items(joi.string().uri()).max(5),
    videos: joi.array().items(joi.string().uri()).max(2),
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();

const deletePost = joi
  .object({
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();
 
const getPostById = joi
  .object({
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();

const postLikesHandler = joi
  .object({
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();

const dateFilter = joi
  .object({
    date: joi.string(),
    startDateRange: joi.string(),
    endDateRange: joi.string(),
  })
  .required();

module.exports = {
  createNewPost,
  updatePost,
  deletePost,
  getPostById,
  postLikesHandler,
  dateFilter,
};
