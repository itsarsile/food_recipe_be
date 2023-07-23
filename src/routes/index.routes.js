const express = require('express')
const userRouter = require('./user.routes')
const recipeRouter = require('./recipe.routes')
const commentRouter = require('./comments.routes')
const router = express.Router()

router.use('/recipes', recipeRouter)
router.use('/users', userRouter)
router.use('/comment', commentRouter)

module.exports = router
