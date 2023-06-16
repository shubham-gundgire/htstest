const User = require("../model/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Refesh = require("../model/refresh");
const sanitizeHtml = require("sanitize-html");

const signUp = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      let message = "";

      if (!first_name) {
        message = message + " first_name ,";
      }
      if (!last_name) {
        message = message + " last_name ,";
      }
      if (!email) {
        message = message + " email ,";
      }
      if (!password) {
        message = message + " password ";
      }

      return res.status(403).json({
        msg: message + " Feild required.",
        code: "501",
      });
    }
    const emailValidationRegEX =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const isValidEmail = emailValidationRegEX.test(email.toLowerCase());

    if (!isValidEmail) {
      return res.status(403).json({
        msg: "Invalid Email address. Please enter valid email address.",
        Code: "502",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      return res.status(403).json({
        msg: "Email address already present. Please enter diffrent email address.",
        code: "503",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      first_name: sanitizeHtml(first_name),
      last_name: sanitizeHtml(last_name),
      email: email.toLowerCase(),
      password: hashPassword,
    })
      .then((data) => {
        return data;
      })
      .catch((e) => {
        res.status(403).json({
          msg: "Unable to sign-up. Please try again.",
          code: "504",
        });
      });

    const refreshToken = await jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "10d" }
    );

    const accessToken = await jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "5m" }
    );

    const refesharray = await Refesh.create({ refreshtoken: refreshToken });

    res.cookie("refreshToken", refreshToken, {
      maxAge: 5000,
    });
    res.cookie("accessToken", accessToken, {
      maxAge: 5000,
    });

    res.status(200).json({ msg: "User sign-Up Successfully.", code: 201 });
  } catch (error) {
    res.status(403).json({
      msg: "Something went wrong. Please try again.",
      Code: "100",
    });
  }
};

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      let message = "";

      if (!email) {
        message = message + " email ,";
      }
      if (!password) {
        message = message + " password ";
      }

      return res.status(403).json({
        msg: message + " Feild required.",
        code: "501",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(403).json({
        msg: "Invalid Email or Password!",
        code: "502",
      });
    }

    const isValidPass = await bcrypt.compare(password, user.password);

    if (!isValidPass) {
      return res.status(403).json({
        msg: "Invalid Email or Password!",
        code: "502",
      });
    }

    const refreshToken = await jwt.sign(
      { id: user._id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "10d" }
    );

    const accessToken = await jwt.sign(
      { id: user._id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "5m" }
    );

    const refesharray = await Refesh.create({ refreshtoken: refreshToken });

    res.cookie("refreshToken", refreshToken, {
      maxAge: 5000,
    });
    res.cookie("accessToken", accessToken, {
       maxAge: 5000,
    });

    res
      .status(200)
      .json({
        msg: "User Login Successfully.",
        code: 201,
        userInfo: {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
        },
      });
  } catch (error) {
    console.log(error);
    res.status(403).json({
      msg: "Something went wrong. Please try again.",
      Code: "100",
    });
  }
};

module.exports = { signUp, signIn };
