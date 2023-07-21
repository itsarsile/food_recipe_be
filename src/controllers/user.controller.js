const Joi = require('joi');
const { supabase } = require('../config/db')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const authHelper = require('../helper/auth')
const commonHelper = require('../helper/common')

const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  photo: Joi.string().optional(),
  phone: Joi.string().optional(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const userController = {
  registerUser: async (req, res) => {
    try {
      const { error, value } = userSchema.validate(req.body);

      if (error) {
        return commonHelper.response(res, null, 400, error.details[0].message);
      }

      const { name, email, photo, phone, password } = value;
      const passwordHash = bcrypt.hashSync(password);
      
      const { data, error: insertError } = await supabase
        .from('users')
        .insert({ name, email, photo, phone, password: passwordHash });

      if (insertError) {
        return commonHelper.response(res, null, 500, 'Error creating users!');
      }

      commonHelper.response(res, data, 201, 'User created successfully!');
    } catch (error) {
      console.error('Error creating user:', error);
      commonHelper.response(res, null, 500, 'Error creating users!');
    }
  },
  loginUser: async (req, res) => {
    try {
      const { error, value } = loginSchema.validate(req.body);

      if (error) {
        return commonHelper.response(res, null, 400, error.details[0].message);
      }

      const { email, password } = value;

      const user = await authHelper.findEmail(email);

      if (!user) {
        return commonHelper.response(res, null, 404, "Email doesn't exist");
      }

      const isValidPassword = bcrypt.compareSync(password, user.password);
      if (!isValidPassword) {
        return commonHelper.response(res, null, 404, 'Incorrect password!');
      }
      delete user.password;
      const payload = {
        email: user.email,
        password: user.password,
      };
      user.token = authHelper.generateToken(payload);
      user.refreshToken = authHelper.refreshToken(payload);

      commonHelper.response(res, { user }, 201, 'login is successful', null, {
        accessToken: user.token,
        refreshToken: user.refreshToken,
      });
    } catch (error) {
      console.error('Error logging in user:', error);
      commonHelper.response(res, null, 500, 'Error logging in user!');
    }
  },
  getAllUsers: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
  
      if (error) {
        throw new Error(error.message);
      }

      commonHelper.response(res, data, 200, 'Successfully fetched all users');
    } catch (error) {
      console.error('Error fetching all users:', error);
      commonHelper.response(res, null, { message: 'An error occurred while fetching all users' }, 500);
    }
  },
  profileUser: async (req, res) => {
    try {
      const { userId } = req.params;
  
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !userData) {
        return commonHelper.response(res, null, 404, 'User not found');
      }

      commonHelper.response(res, userData, 200, 'Successfully fetched user');
    } catch (error) {
      console.error('Error getting user:', error);
      commonHelper.response(res, { message: 'An error occurred while getting user data' }, 500);
    }
  },
  refreshToken: (req, res) => {
    const refreshToken = req.body.refreshToken
    const decoded = jwt.verify(refreshToken, process.env.SECRETE_KEY_JWT)
    const payload = {
      email: decoded.email,
      password: decoded.password
    }
    const result = {
      token: authHelper.generateToken(payload),
      refreshToken: authHelper.refreshToken(payload)
    }
    commonHelper.response(res, result, 200, 'Token already generate!')
  }
}

module.exports = userController
