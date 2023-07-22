const express = require('express')
const router = express.Router()
const recipeController = require('../controllers/recipe.controller')
const { upload } = require('../middleware/upload')
const savedRecipeController = require('../controllers/saved.controller')
const likedRecipeController = require('../controllers/liked.controller')

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

router
  .get('/user/:userId', recipeController.getRecipesByUserId)

router
  .post('/saved/:recipeId/user/:userId', savedRecipeController.addSaveRecipe)
  .get('/saved/user/:userId', savedRecipeController.getSavedRecipesByUserId)
  .delete('/saved/:recipeId/user/:userId', savedRecipeController.deleteSavedRecipe)

router
  .post('/liked/:recipeId/user/:userId', likedRecipeController.addLikeRecipe)
  .get('/liked/user/:userId', likedRecipeController.getLikedRecipesByUserId)
  .delete('/liked/:recipeId/user/:userId', likedRecipeController.deleteLikedRecipe)
module.exports = router
