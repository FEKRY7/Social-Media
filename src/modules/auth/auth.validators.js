const joi = require("joi");
const {
  isValidObjectId,
} = require("../../middleware/validation.middleware.js");

const SignUp = joi
  .object({
    name: joi.string().min(2).max(20).required(),
    email: joi.string().email().required(),
    password: joi.string().min(5).max(30).required(),
    cPassword: joi.string().required(joi.ref("password")).required(),
    age: joi.number().positive().integer().required(),
    phone: joi.string().required(),
  })
  .required();

const confirmUser = joi
  .object({
    email: joi.string().email().required(),
    OTP: joi.string().required(),
  })
  .required();

const SignIn = joi
  .object({
    email: joi.string().required().email().messages({
      "any.required": "Email is required",
      "string.email": "Email must be a valid email",
    }),
    password: joi.string().required(),
  })
  .required();

const GetProfileById = joi
  .object({
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();

const ForgetPassword = joi
  .object({
    email: joi.string().required().email().messages({
      "any.required": "Email is required",
      "string.email": "Email must be a valid email",
    }),
  })
  .required();

const ResetPassword = joi
  .object({
    email: joi.string().required().email(),
    OTP: joi.string().required(),
    newPassword: joi.string().min(5).max(30).required(),
  })
  .required();

const updatePassword = joi
  .object({
    oldPassword: joi.string().required(),
    newPassword: joi.string().min(5).max(30).required(),
    confirmNewPassword: joi.ref("newPassword"),
  })
  .required();

module.exports = {
  SignUp,
  confirmUser,
  SignIn,
  GetProfileById,
  ForgetPassword,
  ResetPassword,
  updatePassword,
};
