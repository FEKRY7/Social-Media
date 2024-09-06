const express = require("express");

const userRouter = require("./src/modules/auth/auth.router.js");
const postRouter = require("./src/modules/Post/Posts.router.js");
const commentRouter = require("./src/modules/Comment/Comments.router.js");
const commentReplayRouter = require("./src/modules/CommentReplay/commentReplay.router.js");
const mongodbconnect = require("./Database/dbConnection.js");

const AppRouter = (app) => {
  mongodbconnect();

  //convert Buffer Data
  // Middleware to parse JSON
  app.use(express.json());

  // Routes
  app.use("/api/user", userRouter);
  app.use("/api/post", postRouter);
  app.use("/api/comment", commentRouter);
  app.use("/api/commentReplay", commentReplayRouter);
};

module.exports = AppRouter;

