const express = require('express')
const recipeRouter = require('./recipe.routes')
const router = express.Router()

router.use('/recipes', recipeRouter)

module.exports = router
