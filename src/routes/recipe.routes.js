const express = require('express')
const router = express.Router()
const recipeController = require('../controllers/recipe.controller')

router
  .get('/', recipeController.getAllRecipes)
  .get('/:recipeId', recipeController.getRecipesById)
  .post('/', recipeController.createRecipe)
  .put('/:recipeId', recipeController.updateRecipe)

module.exports = router
