const express = require('express')
const router = express.Router()
const recipeController = require('../controllers/recipe.controller')
const { upload } = require('../middleware/upload')

router
  .get('/', recipeController.getAllRecipes)
  .get('/:recipeId', recipeController.getRecipesById)
  .post('/',
    upload.fields([
      { name: 'recipeImage', maxCount: 1 },
      { name: 'recipeVideo', maxCount: 1 }
    ]),
    recipeController.createRecipe)
  .put('/:recipeId', upload.fields([
    { name: 'recipeImage', maxCount: 1 },
    { name: 'recipeVideo', maxCount: 1 }
  ]), recipeController.updateRecipe)

module.exports = router
