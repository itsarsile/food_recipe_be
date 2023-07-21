const express = require('express')
const router = express.Router()
const recipeController = require('../controllers/recipe.controller')
const { upload } = require('../middleware/upload')

router
  .get('/', recipeController.getAllRecipes)
  .get('/:recipeId', recipeController.getRecipesById)
  .post('/',
    upload.single('recipeImage'),
    recipeController.createRecipe)
  .put('/:recipeId', recipeController.updateRecipe)

module.exports = router
