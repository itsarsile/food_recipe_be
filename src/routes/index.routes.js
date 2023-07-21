const express = require('express')
const userRouter = require('./user.routes')
const recipeRouter = require('./recipe.routes')
const router = express.Router()

router.use('/recipes', recipeRouter)
router.use('/users', userRouter)

module.exports = router
