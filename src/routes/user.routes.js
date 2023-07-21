const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')

router
    .get('/', userController.getAllUsers)
    .post('/register', userController.registerUser)
    .post('/login', userController.loginUser)
    .get('/:id', userController.profileUser)

module.exports = router