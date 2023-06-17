const User = require("../model/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Refesh = require("../model/refresh");
const sanitizeHtml = require("sanitize-html");

// user signup api controller function
const signUp = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    //first check all parameters exists and not null
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

    // then check for provided email address is valid using regular expression
    const emailValidationRegEX =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    const isValidEmail = emailValidationRegEX.test(email.toLowerCase());

    if (!isValidEmail) {
      return res.status(403).json({
        msg: "Invalid Email address. Please enter valid email address.",
        Code: "502",
      });
    }
    // then check email id already exists in database. email should be unique for all users. if email already exists we reurn below response.
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      return res.status(403).json({
        msg: "Email address already present. Please enter diffrent email address.",
        code: "503",
      });
    }

    // hash user password. we can not store user password in plain text.
    const hashPassword = await bcrypt.hash(password, 10);

    // then create user account with provided information
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

    // genrate refresh and access token. this is not included in provided document but i added it for best practices.
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

    //store refresh token in database
    const refesharray = await Refesh.create({ refreshtoken: refreshToken });

    // set cookie which contains refresh and access token
    res.cookie("refreshToken", refreshToken, {
      maxAge: 5000,
    });
    res.cookie("accessToken", accessToken, {
      maxAge: 5000,
    });
    // return response after all validation
    res.status(200).json({ msg: "User sign-Up Successfully.", code: 201 });
  } catch (error) {
    res.status(403).json({
      msg: "Something went wrong. Please try again.",
      Code: "100",
    });
  }
};


// user login function
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    //check email and password feild should be provideda and not null
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

    // check email exists or not in database
    const user = await User.findOne({ email: email.toLowerCase() });

    // if email does not exists in database return below response
    if (!user) {
      return res.status(403).json({
        msg: "Invalid Email or Password!",
        code: "502",
      });
    }

    //check provided password matches with user's password
    const isValidPass = await bcrypt.compare(password, user.password);

    if (!isValidPass) {
      return res.status(403).json({
        msg: "Invalid Email or Password!",
        code: "502",
      });
    }

    // genrate refresh and access token.
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

    //store refresh token in database
    const refesharray = await Refesh.create({ refreshtoken: refreshToken });

    // set cookie which contains refresh and access token
    res.cookie("refreshToken", refreshToken, {
      maxAge: 5000,
    });
    res.cookie("accessToken", accessToken, {
      maxAge: 5000,
    });

    res.status(200).json({
      msg: "User Login Successfully.",
      code: 201,
      userInfo: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(403).json({
      msg: "Something went wrong. Please try again.",
      Code: "100",
    });
  }
};

module.exports = { signUp, signIn };
