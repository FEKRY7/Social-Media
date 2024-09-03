const postModel = require("../../../Database/models/Post.model.js");
const {
  dateHandler,
  deleteOneById,
  getOneById,
} = require("../../utils/Reuseable.js");
const { ApiFeatures } = require("../../utils/api.features.js");
const cloudinary = require("../../utils/cloud.js");
const http = require("../../folderS,F,E/S,F,E.JS");
const { First, Second, Third } = require("../../utils/httperespons.js");

// getAllPostsWithTheirComments (Child - Parent)
const GetAllPostsWithTheirComments = async (req, res, next) => {
  // user that has isDeleted equal true can’t get posts cannot login and here we can add where condition to hide his posts in allposts Api
  // Try This To Handle Filter(createdAt) http://localhost:3000/post/?page=1&size=5&createdAt[gte]=2023-09-27&createdAt[lt]=2023-09-29
try{
  const apiFeatures = new ApiFeatures(
    postModel.find({}).populate([
      {
        path: "createdBy",
        // select:"firstName lastName email status isDeleted -_id"
      },
      {
        path: "comments",
        // select:"firstName lastName email status isDeleted -_id"
      },
    ]),
    req.query
  )
    .pagination(postModel)
    .filter();
  let posts = await apiFeatures.mongooseQuery;

  const data = {
    totalDocuments: apiFeatures.queryData.totalDocuments,
    totalPages: apiFeatures.queryData.totalPages,
    nextPage: apiFeatures.queryData.next,
    prevPage: apiFeatures.queryData.previous,
    currentPage: apiFeatures.queryData.currentPage,
    resultsPerPage: posts.length,
  };
  
  if (!apiFeatures) {
    return First(
      res,
      "No Posts found or Posts still pending",
      404,
      http.FAIL
    );
  }

  return res.status(200).json({ message: "Done", data, posts });

}catch (error) {
  console.error(error);
  return Third(res, "Internal Server Error", 500, http.ERROR);
}
};

// Add new Post
const AddNewPost = async (req, res, next) => {
  try {
    //Handle createdby field in BD
    req.body.createdBy = req.user._id;
    //Handle post images and videos upload options
    console.log(req.files);
    if (req.files) {
      //If there is an images
      if (req.files.images) {
        const images = [];
        for (let i = 0; i < req.files.images.length; i++) {
          const { secure_url, public_id } = await cloudinary.uploader.upload(
            req.files.images[i].path,
            { folder: `SocialMedia/${req.user._id}/Posts/images` }
          );
          images.push({ secure_url, public_id });
          req.body.images = images;
        }
      }
      //If there is a videos
      if (req.files.videos) {
        const videos = [];
        for (let i = 0; i < req.files.videos.length; i++) {
          const { secure_url, public_id } = await cloudinary.uploader.upload(
            req.files.videos[i].path,
            { folder: `SocialMedia/${req.user._id}/Posts/videos` }
          );
          videos.push({ secure_url, public_id });
          req.body.videos = videos;
        }
      }
    }

    //create Post
    const post = await postModel.create(req.body);
    return Second(res, ["Done", post], 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

//Update Post And Instead of create new endpoint for update privacy we can do in here
const UpdatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isExistPost = await postModel.findById(id);
    if (!isExistPost) return First(res, "This Post Is Not Exist", 404, http.FAIL);
    //check Is Authurazition or not to do call this endpoint (owner only do that)
    if (isExistPost.createdBy.toString() !== req.user._id.toString())
      return First(res, "This Post Is Not Exist", 401, http.FAIL);
    if (req.files.images) {
      const images = [];
      for (let i = 0; i < req.files.images.length; i++) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          req.files.images[i].path,
          { folder: `SocialMedia/${req.user._id}/Posts/images` }
        );
        images.push({ secure_url, public_id });
      }
      req.body.images = images;
      if (isExistPost.images) {
        for (let i = 0; i < isExistPost.images.length; i++) {
          await cloudinary.uploader.destroy(isExistPost.images[i].public_id);
        }
      }
    }

    if (req.files.videos) {
      const videos = [];
      for (let i = 0; i < req.files.videos.length; i++) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          req.files.videos[i].path,
          { folder: `SocialMedia/${req.user._id}/Posts/videos` }
        );
        videos.push({ secure_url, public_id });
      }
      req.body.videos = videos;

      if (isExistPost.videos) {
        for (let i = 0; i < isExistPost.videos.length; i++) {
          await cloudinary.uploader.destroy(isExistPost.videos[i].public_id);
        }
      }
    }

    const post = await postModel.findByIdAndUpdate(id, req.body, { new: true });

    return Second(res, ["Done", post], 200, http.SUCCESS);
  }catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

// deletePost
const DeletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    // const isExistPost = await postModel.findByIdAndDelete({_id:id, createdBy:req.user._id});
    const isExistPost = await postModel.findById(id);
    if (!isExistPost) return First(res, "This Post Is Not Exist", 404, http.FAIL);
    if (isExistPost.createdBy.toString() !== req.user._id.toString())
      return First(res, "Not Auth To update This Post", 401, http.FAIL);

    if (isExistPost.images) {
      for (let i = 0; i < isExistPost.images.length; i++) {
        await cloudinary.uploader.destroy(isExistPost.images[i].public_id);
      }
    }
    if (isExistPost.videos) {
      for (let i = 0; i < isExistPost.videos.length; i++) {
        await cloudinary.uploader.destroy(isExistPost.videos[i].public_id);
      }
    }

    await postModel.findByIdAndDelete(id);
    return Second(res, "Deleted Successfully", 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

//Get Post By ID
const GetPostById = getOneById(postModel);

//Only Logged In Users Can => (Like-Unlike)
const PostLikesHandler = async (req, res, next) => {
try{
  const { id } = req.params;
  const post = await postModel.findById(id);
  if (!post) {
    return First(res, "This Post is Not Exist", 404, http.FAIL);
  }

  // i will user save() method and we can handle it by addtoset and pull
  if (!post.likes.includes(req.user._id)) {
    post.likes.addToSet(req.user._id);
    post.save();
  } else {
    post.likes.pull(req.user._id);
    post.save();
  }
  return Second(res, ["Done", post], 200, http.SUCCESS);
}catch (error) {
  console.error(error);
  return Third(res, "Internal Server Error", 500, http.ERROR);
}
};

// Send Date(today,yesterday,last7days,last30days) in body or (startDateRange,startDateRange) to get data in specific date or range data
const DateFilter = async (req, res, next) => {
  try {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    let startDateRange = new Date(req.body.startDateRange);
    let endDateRange = new Date(req.body.endDateRange);

    // Adjust the date range based on the `date` parameter
    switch (req.body.date) {
      case "Today":
        startDateRange = today;
        endDateRange = tomorrow;
        break;
      case "Yesterday":
        startDateRange = yesterday;
        endDateRange = today;
        break;
      case "Last 7 Days":
        startDateRange = last7Days;
        endDateRange = today;
        break;
      case "Last 30 Days":
        startDateRange = last30Days;
        endDateRange = today;
        break;
      default:
        // Ensure that provided `startDateRange` and `endDateRange` are valid dates
        if (isNaN(startDateRange.getTime()) || isNaN(endDateRange.getTime())) {
          return First(res, "Invalid date range provided", 400, http.FAIL);
        }
    }

    // Handle the date filtering function
    const date = dateHandler(startDateRange, endDateRange);

    // Query for posts within the specified date range
    const postDateFilter = await postModel.find({
      createdAt: { $gte: date.startDate, $lt: date.endtDate },
    });

    return Second(res, ["Done", postDateFilter], 200, http.SUCCESS);
  }catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

module.exports = {
  GetAllPostsWithTheirComments,
  AddNewPost,
  UpdatePost,
  DeletePost,
  GetPostById,
  PostLikesHandler,
  DateFilter,
};
