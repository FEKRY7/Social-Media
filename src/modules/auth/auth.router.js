const express = require("express");
const router = express.Router();
const isAuthenticated = require("../../middleware/authentication.middeleware.js");
const isAuthorized = require("../../middleware/authoriztion.middelware.js");
const { validation } = require("../../middleware/validation.middleware.js");

const { fileUpload, fileValidation } = require("../../utils/fileUpload.js");

const {
  SignUp,
  activateAcountSchema,
  confirmUser,
  SignIn,
  GetProfileById,
  ForgetPassword,
  ResetPassword,
  updatePassword,
} = require("./auth.validators.js");

const {
  signUP,
  ConfirmUser,
  signIn,
  getAllUsers,
  getProfileById,
  getloggedInProfile,
  softDelete,
  forgetPassword,
  resetPassword,
  UpdatePassword,
  UpdateProfile,
  AddProfileCoverImage,
  AddProfileImage,
  SendFriendRequest,
  CancelFriendRequest,
} = require("./auth.controller.js");

router.post("/signup", validation(SignUp), signUP);
router.get("/", getAllUsers);
router.put("/confirmEmail", validation(confirmUser), ConfirmUser);
router.post("/signIn", validation(SignIn), signIn);
router.post(
  "/profile",
  isAuthenticated,
  isAuthorized("User"),
  getloggedInProfile
);
router.patch(
  "/profile/delete",
  isAuthenticated,
  isAuthorized("User"),
  softDelete
);
router.post("/profile/:id", validation(GetProfileById), getProfileById);
// router.patch("/profile/delete", auth(endpoint.delete), getProfileById);
router.post("/forgetPassword", validation(ForgetPassword), forgetPassword);
router.patch("/resetpassword", validation(ResetPassword), resetPassword);
router.patch(
  "/updatepassword",
  isAuthenticated,
  isAuthorized("User"),
  validation(updatePassword),
  UpdatePassword
);

router.patch(
  "/updateProfile",
  isAuthenticated,
  isAuthorized("User"),
  UpdateProfile
);

// // Cloudinary

router.patch(
  "/profileimage",
  isAuthenticated,
  isAuthorized("User"),
  fileUpload(fileValidation.image).single("image"),
  AddProfileImage
);

router.patch(
  "/profilecoverimage",
  isAuthenticated,
  isAuthorized("User"),
  fileUpload(fileValidation.image).single("image"),
  AddProfileCoverImage
);

//Send And Cancel Friends Requests
router.patch(
  "/sendrequest/:id",
  isAuthenticated,
  isAuthorized("User"),
  SendFriendRequest
);

router.patch(
  "/cancelrequest/:id",
  isAuthenticated,
  isAuthorized("User"),
  CancelFriendRequest
);

module.exports = router;
