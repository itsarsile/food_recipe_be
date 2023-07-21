const { supabase } = require('../config/db')
const commonHelper = require('../helper/common')
const { uploadToCloudinary } = require('../middleware/upload')

const DEFAULT_PAGE_SIZE = 10

const recipeController = {
  createRecipe: async (req, res) => {
    try {
      const { title, details, userid } = req.body
      console.log(req.files.recipeVideo[0].path, req.files.recipeImage[0].path)

      const imageUrlResponse = await uploadToCloudinary(req.files.recipeImage[0].path)
      const videoUrlResponse = await uploadToCloudinary(req.files.recipeVideo[0].path)

      const imageUrl = imageUrlResponse.url
      const videoUrl = videoUrlResponse.url

      const { error } = await supabase
        .from('recipes')
        .insert({ title, details, photo: imageUrl, video: videoUrl, userid })
      if (error) {
        throw new Error(error.message)
      }

      const recipeData = {
        title,
        details,
        image: imageUrl,
        video: videoUrl
      }

      commonHelper.response(res, recipeData, 201, 'Recipe created successfully')
    } catch (error) {
      commonHelper.response(res, null, 500, 'Error creating recipe')
    }
  },
  updateRecipe: async (req, res) => {
    try {
      const { recipeId } = req.params
      const { title, details, userid } = req.body

      // Check if the recipe exists in the database
      const { data: existingRecipe, error: existingRecipeError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)

      if (existingRecipeError) {
        return commonHelper.response(res, existingRecipeError.message, 404, 'Recipe not found')
      }

      if (!existingRecipe || existingRecipe.length === 0) {
        return commonHelper.response(res, null, 404, 'Recipe not found')
      }

      // Handle video and image updates similar to createRecipe
      let imageUrl = existingRecipe[0].photo // Keep the existing image URL if not updated
      let videoUrl = existingRecipe[0].video // Keep the existing video URL if not updated

      if (req.files) {
        if (req.files.recipeImage) {
          const imageUrlResponse = await uploadToCloudinary(req.files.recipeImage[0].path)
          imageUrl = imageUrlResponse.url
        }

        if (req.files.recipeVideo) {
          const videoUrlResponse = await uploadToCloudinary(req.files.recipeVideo[0].path)
          videoUrl = videoUrlResponse.url
        }
      }

      // Update the recipe with the provided data and new video/image URLs
      const { error } = await supabase
        .from('recipes')
        .update({ title, details, photo: imageUrl, video: videoUrl, userid })
        .eq('id', recipeId)

      if (error) {
        return commonHelper.response(res, error, 500, 'Error updating recipe')
      }

      // Fetch the updated recipe from the database
      const { data: updatedRecipe, error: updatedRecipeError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)

      if (updatedRecipeError) {
        return commonHelper.response(res, updatedRecipeError.message, 500, 'Error getting updated recipe')
      }

      const data = {
        recipeData: updatedRecipe[0], // Since we queried by ID, we only expect one recipe
        userData: null // Since we are not updating the user data, set it to null
      }

      commonHelper.response(res, data, 200, 'Recipe updated successfully')
    } catch (error) {
      commonHelper.response(res, error, 500, 'Error updating recipe')
    }
  },
  getAllRecipes: async (req, res) => {
    try {
      const { page, limit } = req.query
      const currentPage = parseInt(page, 10) || 1
      const pageSize = parseInt(limit, 10) || DEFAULT_PAGE_SIZE
      const start = (currentPage - 1) * pageSize
      const end = start + pageSize - 1

      const { data, error } = await supabase
        .from('recipes')
        .select('\'*\'')
        .range(start, end)

      if (error) {
        throw new Error(error.message)
      }

      const { error: countError, count } = await supabase
        .from('recipes')
        .select('*', { count: 'exact' })

      if (countError) {
        throw new Error(countError.message)
      }

      const totalRecords = count

      const totalPages = Math.ceil(totalRecords / pageSize)

      const pagination = {
        currentPage,
        totalPages,
        totalRecords
      }

      commonHelper.response(res, data, 200, 'Success getting all recipes', pagination)
    } catch (error) {
      commonHelper.response(res, null, 500, 'Error retrieving all recipes')
    }
  },
  getRecipesById: async (req, res) => {
    try {
      const { recipeId } = req.params
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)

      if (recipeError) {
        return commonHelper.response(res, recipeError.message, 404, 'Recipes not found')
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name')
        .eq('id', recipeData[0].userid)

      if (userError) {
        return commonHelper.response(res, userError.message, 404, 'Recipes not found')
      }

      const data = {
        recipeData,
        userData
      }

      commonHelper.response(res, data, 200, 'Success getting recipe')
    } catch (error) {
      commonHelper.response(res, error, 500, 'Error getting recipe')
    }
  }
}

module.exports = recipeController
