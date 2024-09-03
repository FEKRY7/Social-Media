const userModel = require("../../../Database/models/User.model.js");
const CryptoJS = require("crypto-js");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const { createHTML, sendEmail } = require("../../utils/sendEmail.js");
const jwt = require("jsonwebtoken");
const tokenModel = require("../../../Database/models/token.model.js");
const cloudinary = require("../../utils/cloud.js");
const { ApiFeatures } = require("../../utils/api.features.js");
const {
  URL,
  checkUserBasices,
  getOneById,
  generateOTPWithExpireDate,
} = require("../../utils/Reuseable.js");
const http = require("../../folderS,F,E/S,F,E.JS");
const { First, Second, Third } = require("../../utils/httperespons.js");

//signUP
const signUP = async (req, res, next) => {
  try {
    //Receive Data from body
    let { name, email, password, phone, age } = req.body;

    //Check ih this email existing in db or not
    const isEmailExist = await userModel.findOne({ email });
    if (isEmailExist)
      return First(res, "This Email Already In Use", 409, http.FAIL);
    //Hash Password
    const Hashpassword = await bcrypt.hash(password, 5);
    //Encrypt Phone
    phone = CryptoJS.AES.encrypt(phone, process.env.CRYPTOKEY).toString();

    //Send Confimation Mail ////

    // Generate random number
    const OTP = generateOTPWithExpireDate();

    // Insert otp number into html page that will send by mail
    const html = createHTML(OTP);

    if (
      !sendEmail({
        to: email,
        subject: "Confirmation Email",
        text: "Please Click The Below Link To Confirm Your Email",
        html,
      })
    ) {
      return First(
        res,
        "There is someting Wrong with Email Sender",
        404,
        http.FAIL
      );
    }

    //Create New User Using Constroctor to handle it in mongoose MiddleWare
    const newUser = new userModel({
      name,
      email,
      password: Hashpassword,
      phone,
      age,
      OTP,
    });
    const user = await newUser.save();

    return Second(res, ["Done", user], 201, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

//confirmUser
const ConfirmUser = async (req, res, next) => {
  try {
    const { email, OTP } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return First(res, "This Email Is Not Exist", 404, http.FAIL);
    }
    if (user.confirmEmail)
      return First(
        res,
        "This Email Already Confimred ... Go To Login In Page",
        404,
        http.FAIL
      );
    if (!user.OTP) {
      return First(res, "In Vaild OTP", 404, http.FAIL);
    }
    const newOTP = otpGenerator.generate(10);
    const confirmUser = await userModel.findOneAndUpdate(
      { email },
      { confirmEmail: true, OTP: newOTP },
      { new: true }
    );
    return Second(res, ["Done", confirmUser], 201, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

// //signIn
// // refresh token
const signIn = async (req, res, next) => {
  try {
    // Receive Data from body
    const { email, password } = req.body;

    // Check if email exists
    const user = await userModel.findOne({ email });
    if (!user) return First(res, "Email is incorrect", 401, http.FAIL);

    // Check if the password is valid
    const isValidPassword = bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return First(res, "Password is incorrect", 401, http.FAIL);

    // Check if email is confirmed, user is not deleted, and user status is valid
    const basicsCheckResponse = checkUserBasices(user, res);
    if (basicsCheckResponse) {
      return; // Exit if the response is already sent
    }

    // Create payload and generate JWT token
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    // Save the token (optional step)
    await tokenModel.create({ token, user: user._id });

    // Update user status to 'Online'
    await userModel.findOneAndUpdate(
      { email: user.email },
      { status: "Online" }
    );

    // Send response with token
    return Second(res, ["Success", token], 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const apiFeatures = new ApiFeatures(userModel.find(), req.query)
      .pagination(userModel)
      .filter();
    const users = await apiFeatures.mongooseQuery;
    const data = {
      totalDocuments: apiFeatures.queryData.totalDocuments,
      totalPages: apiFeatures.queryData.totalPages,
      nextPage: apiFeatures.queryData.next,
      prevPage: apiFeatures.queryData.previous,
      currentPage: apiFeatures.queryData.currentPage,
      resultsPerPage: users.length,
    };

    if (!apiFeatures) {
      return First(
        res,
        "No users found or users still pending",
        404,
        http.FAIL
      );
    }

    return Second(res, ["Done", data, users], 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

//Get User Profile By Id  (Send Id in Params)
const getProfileById = getOneById(userModel);

//Get Loggin Profile
const getloggedInProfile = async (req, res, next) => {
  try {
    const userProfile = await userModel.findById(req.user._id);

    if (!userProfile) {
      return First(
        res,
        "No userProfile found or userProfile still pending",
        404,
        http.FAIL
      );
    }

    return Second(res, ["Done", userProfile], 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

// update Profile
const softDelete = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return First(res, "User ID is required", 400, http.FAIL);
    }

    const result = await userModel.findByIdAndUpdate(
      req.user._id,
      { status: "SoftDeleted" },
      { new: true } // Returns the updated document
    );

    if (!result) {
      return First(res, "User not found", 404, http.FAIL);
    }

    return Second(res, "Done", 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

// SoftDelete

//forget password
const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if the email exists in the database
    const user = await userModel.findOne({ email });
    if (!user) return First(res, "Email is incorrect", 404, http.FAIL);

    // Perform additional user checks (email confirmed, isDeleted, status)
    const basicsCheckResponse = checkUserBasices(user, res);
    if (basicsCheckResponse) {
      return; // Exit if the response is already sent
    }

    // Check if the maximum OTP limit has been reached
    if (user.OTPNumber >= process.env.MAXOTPSMS)
      return First(res, "OTP already sent, check your email", 403, http.FAIL);

    // Generate OTP and send email
    const OTP = otpGenerator.generate(process.env.OTPNUMBERS, {
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const emailSent = sendEmail({
      to: email,
      subject: "Forget Password Mail",
      text: `Your Password Reset Code is: ${OTP}. Click this link to reset your password: ${URL(
        req
      )}/api/user/resetpassword`,
    });

    if (!emailSent) {
      return First(
        res,
        "There is something wrong with the email sender",
        500,
        http.FAIL
      );
    }

    // Save OTP to user document and increment OTPNumber
    user.OTP = {
      OTPCode: OTP,
      expireDate: new Date(Date.now() + 2 * 60 * 1000),
    }; // Setting expire date to 2 minutes from now
    user.OTPNumber += 1;
    await user.save();

    // Change OTP after 2 minutes
    setTimeout(async () => {
      const userInDb = await userModel.findById(user._id);
      if (userInDb && userInDb.OTP.OTPCode === OTP) {
        // Only change if the OTP hasn't been updated in the meantime
        const newOTP = otpGenerator.generate(process.env.OTPNUMBERS, {
          upperCaseAlphabets: false,
          specialChars: false,
        });
        userInDb.OTP = {
          OTPCode: newOTP,
          expireDate: new Date(Date.now() + 2 * 60 * 1000),
        };
        await userInDb.save();
        console.log("OTP has been changed");
      }
    }, 2 * 60 * 1000);

    return Second(res, "Check your email for the OTP", 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

//Reset Password
const resetPassword = async (req, res, next) => {
  try {
    let { email, OTP, newPassword } = req.body;

    // Check if email exists
    const isEmailExist = await userModel.findOne({ email });
    if (!isEmailExist) return First(res, "Email is incorrect", 404, http.FAIL);

    // Check if OTP is valid and not expired
    if (!isEmailExist.OTP || isEmailExist.OTP.OTPCode !== OTP) {
      return First(res, "Invalid or expired OTP", 400, http.FAIL);
    }

    // Hash the new password
    newPassword = await bcrypt.hash(newPassword, 5);

    // Generate a new OTP (if needed for further operations, else nullify it)
    const newOTP = otpGenerator.generate(process.env.OTPNUMBERS, {
      upperCaseAlphabets: false,
      specialChars: false,
    });

    // Update the user's password and reset OTP-related fields
    await userModel.findOneAndUpdate(
      { email },
      {
        password: newPassword,
        OTP: { OTPCode: newOTP }, // New OTP with 2 minutes expiry
        OTPNumber: 0,
      }
    );

    return Second(res, "Your new password has been set", 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

//updatePassword User Must Be Loggin  old !== new
const UpdatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Find the user by ID (assuming req.user._id contains the user's ID)
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return First(res, "User not found", 404, http.FAIL);
    }

    // Check if the old password is correct
    const isValidOldPassword = bcrypt.compare(oldPassword, user.password);
    if (!isValidOldPassword) {
      return First(res, "Old password is incorrect", 400, http.FAIL);
    }

    // Check if the new password is the same as the old password
    const isSameAsOldPassword = bcrypt.compare(newPassword, user.password);
    if (isSameAsOldPassword) {
      return First(
        res,
        "New password cannot be the same as the old password",
        409,
        http.FAIL
      );
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 5);

    // Update the user's password in the database
    user.password = hashedNewPassword;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

const UpdateProfile = async (req, res, next) => {
  try {
    const { name, age, phone, email } = req.body;
    let OTP;

    // Check if email is provided and is different from the current email
    if (email && email !== req.user.email) {
      const checkEmail = await userModel.findOne({ email });
      if (checkEmail) {
        return First(res, "This Email is Already in Use", 409, http.FAIL);
      }

      // Generate OTP
      OTP = otpGenerator.generate(process.env.OTPNUMBERS, {
        upperCaseAlphabets: false,
        specialChars: false,
      });

      // Send OTP email
      const emailSent = await sendEmail({
        to: email,
        subject: "Email Confirmation",
        text: `Your confirmation code is: ${OTP}. Click this link to confirm your email: ${URL(
          req
        )}/api/user/confirmEmail`,
      });

      if (!emailSent) {
        return First(
          res,
          "There was an issue with sending the email.",
          400,
          http.FAIL
        );
      }
    }

    // Update user information
    const updateUserInfo = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name,
        age,
        phone,
        email,
        confirmEmail: false,
        OTP: OTP ? { OTPCode: OTP } : undefined,
      },
      { new: true }
    );

    return Second(
      res,
      ["Profile updated successfully", updateUserInfo],
      200,
      http.SUCCESS
    );
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

// Upload Profile Pic And In Case There Is Old Pic Will Delete Then Add New
const AddProfileImage = async (req, res, next) => {
  try {
    if (req.file) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        { folder: `SocialMedia/${req.user._id}/profileImage` }
      );
      req.body.image = { secure_url, public_id };
      if (req.user.profileImage.public_id) {
        await cloudinary.uploader.destroy(req.user.profileImage.public_id);
      }
    }

    const user = await userModel.findByIdAndUpdate(
      req.user._id,
      { profileImage: req.body.image },
      { new: true }
    );

    return Second(res, ["Done", user], 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

// Upload Profile Cover Pic And In Case There Is Old Pic Will Add To Z Array As Object And Can Select Between Then
const AddProfileCoverImage = async (req, res, next) => {
  try {
    if (req.file) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        { folder: `SocialMedia/${req.user._id}/profileCoverImage` }
      );
      req.body.image = { secure_url, public_id };
    }
    const user = await userModel.findByIdAndUpdate(
      req.user._id,
      { $push: { profileCover: req.body.image } },
      { new: true }
    );

    return Second(res, ["Done", user], 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

// Add Video for Post
//Done in Post Apis

//Send Friend Request

const SendFriendRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if the target user ID exists
    const targetUser = await userModel.findById(id);
    if (!targetUser) {
      return First(res, "This profile ID does not exist", 404, http.FAIL);
    }

    // Check if the target user is the same as the requester
    if (id === req.user._id.toString()) {
      return First(
        res,
        "You cannot send a friend request to yourself",
        400,
        http.FAIL
      );
    }

    // Add the friend request
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { friendRequests: id } }, // Ensure no duplicate requests
      { new: true } // Return the updated document
    );

    return Second(res, ["Friend request sent", updatedUser], 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

const CancelFriendRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if the target user ID exists
    const targetUser = await userModel.findById(id);
    if (!targetUser) {
      return First(res, "This profile ID does not exist", 404, http.FAIL);
    }

    // Check if the friend request exists
    const user = await userModel.findById(req.user._id);
    if (!user.friendsRequests.includes(id)) {
      return First(res, "Friend request not found", 400, http.FAIL);
    }

    // Remove the friend request
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      { $pull: { friendsRequests: id } }, // Remove the specific request
      { new: true } // Return the updated document
    );

    return Second(
      res,
      ["Friend request canceled", updatedUser],
      200,
      http.SUCCESS
    );
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

module.exports = {
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
};
