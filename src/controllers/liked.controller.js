const { supabase } = require('../config/db')
const commonHelper = require('../helper/common')

const likedRecipeController = {
  addLikeRecipe: async (req, res) => {
    try {
      const { recipeId, userId } = req.params
      const { data: existingLikedRecipe, error: existingLikedRecipeError } = await supabase
        .from('likes')
        .select('*')
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)

      if (existingLikedRecipeError) {
        throw new Error(existingLikedRecipeError.message)
      }

      if (existingLikedRecipe && existingLikedRecipe.length > 0) {
        return commonHelper.response(res, null, 400, 'Recipe already liked')
      }

      const { data, error } = await supabase
        .from('likes')
        .insert({ user_id: userId, recipe_id: recipeId })

      if (error) {
        throw new Error(error.message)
      }

      commonHelper.response(res, data, 201, 'Recipe liked successfully')
    } catch (error) {
      commonHelper.response(res, error, 201, 'Error while liking recipe')
    }
  },
  getLikedRecipesByUserId: async (req, res) => {
    try {
      const { userId } = req.params

      const { data, error } = await supabase
        .from('likes')
        .select('recipe_id')
        .eq('user_id', userId)

      if (error) {
        throw new Error(error.message)
      }

      const recipesIds = data.map((likedRecipes) => likedRecipes.recipe_id)

      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes')
        .select('*')
        .in('id', recipesIds)

      if (recipesError) {
        throw new Error(recipesError.message)
      }

      const recipes = recipesData || []

      commonHelper.response(res, recipes, 200, 'Success getting liked recipes by User ID')
    } catch (error) {
      commonHelper.response(res, error, 500, 'Error getting liked recipes by User ID')
    }
  },
  deleteLikedRecipe: async (req, res) => {
    try {
      const { recipeId, userId } = req.params

      const { data: existingRecipe, error: existingRecipeError } = await supabase
        .from('likes')
        .select('*')
        .eq('recipe_id', recipeId)

      if (existingRecipeError) {
        throw new Error(existingRecipeError.message)
      }

      if (!existingRecipe || existingRecipe.length === 0) {
        return commonHelper.response(res, null, 404, 'Saved recipe not found')
      }

      const { data, error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)

      if (error) {
        throw new Error(error.message)
      }

      commonHelper.response(res, data, 200, 'Recipe deleted from liked recipes')
    } catch (error) {
      commonHelper.response(res, error, 200, 'Error while deleting recipe from liked recipes')
    }
  }
}

module.exports = likedRecipeController
