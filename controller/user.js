const User = require("../model/user");

const getAllUsers = async (req, res) => {
  try {
    const usersList = await User.find({})
      .then((users) => {
        const filterList = users.map((user) => {
          return {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
          };
        });
        return filterList;
      })
      .catch((error) => {
        res.status(403).json({
          msg: "Something went wrong. Please try again.",
          Code: "100",
        });
      });

    res.status(200).json({ msg: "Success.", Code: "201", usersList });
  } catch (error) {
    res.status(403).json({
      msg: "Something went wrong. Please try again.",
      Code: "100",
    });
  }
};

module.exports = { getAllUsers };
