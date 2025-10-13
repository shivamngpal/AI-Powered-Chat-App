const UserModel = require("../models/userModel");

async function getUsersForSidebar(req, res) {
  try {
    const loggedInUser = req.user._id;

    // Find all users except the one who is logged in
    // The "ne" in $ne stands for "not equal"
    const allUsers = await UserModel.find({
      _id: { $ne: loggedInUser },
    }).select("-password");

    res.status(200).json(allUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getUsersForSidebar };
