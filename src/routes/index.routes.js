const express = require('express')
const userRouter = require('./user.routes')
const recipeRouter = require('./recipe.routes')
const router = express.Router()
const { protect } = require('../middleware/auth')

router.use('/recipes', protect, recipeRouter)
router.use('/users', protect, userRouter)

module.exports = router
