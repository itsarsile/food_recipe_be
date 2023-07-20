const { createUser, findUser, updateUser } = require("../models/user.models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authHelper = require("../helper/auth");
const commonHelper = require("../helper/common");

let usersController = {
  registerUser: async (req, res) => {
    try {
      const { name, email, phone, password } = req.body;
      const photo = req.file.filename;
      const { rowCount } = await findUser(email);
      if (rowCount) {
        return res.json({ message: "Email is already taken" });
      }

      const passwordHash = bcrypt.hashSync(password);
      const data = {
        id,
        name,
        email,
        phone,
        photo: ``
      };
      // console.log(data)
      await createUser(data)
        .then((result) =>
          commonHelper.response(res, result.rows, 201, "created")
        )
        .catch((err) => res.send(err));
    } catch (error) {
      console.log(error);
    }
  },
  loginUser: async (req, res) => {
    const { email, password } = req.body;
    const {
      rows: [user],
    } = await findUser(email);
    if (!user) {
      return res.json({ message: "Email is incorrect!" });
    }
    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.json({ message: "Wrong password!" });
    }
    delete user.password;
    const payload = {
      email: user.email,
      password: user.password,
    };
    user.token = authHelper.generateToken(payload);
    user.refreshToken = authHelper.refreshToken(payload)
    
    commonHelper.response(res, user, 201, "login is successful");
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
    const decoded = jwt.verify(refreshToken, process.env.SECRETE_KEY_JWT)
    const payload ={
      email : decoded.email,
      password : decoded.password
    }
    const result = {
      token : authHelper.generateToken(payload),
      refreshToken : authHelper.refreshToken(payload)
    }
    commonHelper.response(res,result,200, "Token already generate!")
  }
};

module.exports = usersController;