const { supabase } = require('../config/db')
const commonHelper = require('../helper/common')

const savedRecipeController = {
  addSaveRecipe: async (req, res) => {
    try {
      const { recipeId, userId } = req.params

      const { data: existingSavedRecipe, error: existingSavedRecipeError } = await supabase
        .from('saved_recipes')
        .select('*')
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)

      if (existingSavedRecipeError) {
        throw new Error(existingSavedRecipeError.message)
      }

      if (existingSavedRecipe && existingSavedRecipe.length > 0) {
        return commonHelper.response(res, null, 400, 'Recipe already saved')
      }

      const { data, error } = await supabase
        .from('saved_recipes')
        .insert({ user_id: userId, recipe_id: recipeId })

      if (error) {
        throw new Error(error.message)
      }

      commonHelper.response(res, data, 201, 'Recipes saved successfully')
    } catch (error) {
      commonHelper.response(res, error, 201, 'Error while saving')
    }
  },
  getSavedRecipesByUserId: async (req, res) => {
    try {
      const { userId } = req.params

      // Get all saved recipes for a specific user by userId
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('recipe_id') // Only fetch the recipe_id for saved recipes
        .eq('user_id', userId)

      if (error) {
        throw new Error(error.message)
      }

      const recipeIds = data.map((savedRecipe) => savedRecipe.recipe_id)

      // Fetch the full recipe details for the retrieved recipeIds
      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes')
        .select('*')
        .in('id', recipeIds)

      if (recipesError) {
        throw new Error(recipesError.message)
      }

      const recipes = recipesData || []

      commonHelper.response(res, recipes, 200, 'Success getting saved recipes by User ID')
    } catch (error) {
      commonHelper.response(res, error, 500, 'Error getting saved recipes by user ID')
    }
  },
  deleteSavedRecipe: async (req, res) => {
    try {
      const { recipeId, userId } = req.params

      const { data: existingRecipe, error: existingRecipeError } = await supabase
        .from('saved_recipes')
        .select('*')
        .eq('recipe_id', recipeId)
      if (existingRecipeError) {
        throw new Error(existingRecipeError.message)
      }

      if (!existingRecipe || existingRecipe.length === 0) {
        // Recipe does not exist
        return commonHelper.response(res, null, 404, 'Saved recipe not found')
      }

      const { data, error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)

      if (error) {
        throw new Error(error.message)
      }

      commonHelper.response(res, data, 200, 'Recipe deleted from saved recipes')
    } catch (error) {
      commonHelper.response(res, error, 500, 'Error while deleting saved recipe')
    }
  }
}

module.exports = savedRecipeController
