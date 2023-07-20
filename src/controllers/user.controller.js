const { createUser, findUser, updateUser } = require("../models/user.models");
const { supabase } = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authHelper = require("../helper/auth");
const commonHelper = require("../helper/common");

let userController = {
  registerUser: async (req, res) => {
    try {
      const { name, email, photo, phone, password } = req.body;
      // const photo = req.file.filename;
      const passwordHash = bcrypt.hashSync(password);
      const { data, error } = await supabase
        .from("users")
        .insert({ name, email, photo, phone, password: passwordHash });
      if (error) {
        commonHelper.response(res, data, 201, "Users created successfully!");
      }

      commonHelper.response(res, data, 201, "Users created successfully!");
      // await createUser(data)
      //   .then((result) =>
      //     commonHelper.response(res, result.rows, 201, "created")
      //   )
      //   .catch((err) => res.send(err));
    } catch (error) {
      console.log(error.message);
      commonHelper.response(res, error, 500, "Error creating users!");
    }
  },
  loginUser: async (req, res) => {
    const { email, password } = req.body;

    // Find user email
    const user = await authHelper.findEmail(email);

    if (!user) {
      return commonHelper.response(res, null, 404, "Email doesn't exist");
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return commonHelper.response(res, null, 404, "Incorrect password!");
    }
    delete user.password;
    const payload = {
      email: user.email,
      password: user.password,
    };
    user.token = authHelper.generateToken(payload);
    user.refreshToken = authHelper.refreshToken(payload);

    commonHelper.response(res, { user }, 201, "login is successful", null, {
      accessToken: user.token,
      refreshToken: user.refreshToken,
    });
  },
  profileUser: async (req, res) => {
    const email = req.payload.email;
    const {
      rows: [user],
    } = await findUser(email);
    delete user.password;
    commonHelper.response(res, user, 200);
  },
  refreshToken: (req, res) => {
    const refreshToken = req.body.refreshToken;
    const decoded = jwt.verify(refreshToken, process.env.SECRETE_KEY_JWT);
    const payload = {
      email: decoded.email,
      password: decoded.password,
    };
    const result = {
      token: authHelper.generateToken(payload),
      refreshToken: authHelper.refreshToken(payload),
    };
    commonHelper.response(res, result, 200, "Token already generate!");
  },
};

module.exports = userController;
