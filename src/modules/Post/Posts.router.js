const express = require("express");
const router = express.Router();
const isAuthenticated = require("../../middleware/authentication.middeleware.js");
const isAuthorized = require("../../middleware/authoriztion.middelware.js");
const { validation } = require("../../middleware/validation.middleware.js");

const { fileUpload, fileValidation } = require("../../utils/fileUpload.js");

const {
  createNewPost,
  updatePost,
  deletePost,
  getPostById,
  postLikesHandler,
  dateFilter,
} = require("./Posts.validators.js");

const {
  GetAllPostsWithTheirComments,
  AddNewPost,
  UpdatePost,
  DeletePost,
  GetPostById,
  PostLikesHandler,
  DateFilter,
} = require("./Posts.controller.js");

router
  .route("/")
  .get(GetAllPostsWithTheirComments)
  .post(
    isAuthenticated,
    isAuthorized("User"),
    fileUpload(fileValidation.imageAndimage).fields([
      { name: "images", maxCount: 5 },
      { name: "videos", maxCount: 2 },
    ]),  
   validation(createNewPost),
    AddNewPost
  );

router
  .route("/:id") 
  .get(validation(getPostById), GetPostById)
  .put(
    isAuthenticated,
    isAuthorized("User"),
    fileUpload(fileValidation.imageAndimage).fields([
      { name: "images", maxCount: 5 },
      { name: "videos", maxCount: 2 },
    ]),
    validation(updatePost),
    UpdatePost
  )
  .delete(
    isAuthenticated,
    isAuthorized("User"),
    validation(deletePost),
    DeletePost
  );

router.patch(
  "/likes/:id",
  isAuthenticated,
  isAuthorized("User"),
  validation(postLikesHandler),
  PostLikesHandler
);

router.get("/date/filter", validation(dateFilter), DateFilter);

module.exports = router;
