const Joi = require('joi')
const { supabase } = require('../config/db')
const commonHelper = require('../helper/common')
const { uploadToCloudinary } = require('../middleware/upload')

const DEFAULT_PAGE_SIZE = 10

const recipeSchema = Joi.object({
  title: Joi.string().required(),
  deatils: Joi.string().required(),
  userid: Joi.string().required()
})

const recipeController = {
  createRecipe: async (req, res) => {
    try {
      const { error: validationError } = recipeSchema.validate(req.body)

      if (validationError) {
        return commonHelper.response(res, null, 400, validationError.details[0].message)
      }
      const { title, details, userid } = req.body
      const imageUrlResponse = await uploadToCloudinary(req.files.recipeImage[0].path)
      const videoUrlResponse = await uploadToCloudinary(req.files.recipeVideo[0].path)

      const { error } = await supabase
        .from('recipes')
        .insert({ title, details, photo: imageUrlResponse, video: videoUrlResponse, userid })

      console.error(error)
      if (error) {
        throw new Error(error)
      }

      const recipeData = {
        title,
        details,
        image: imageUrlResponse,
        video: videoUrlResponse
      }

      commonHelper.response(res, recipeData, 201, 'Recipe created successfully')
    } catch (error) {
      console.error(error.message)
      console.error(error)
      commonHelper.response(res, null, 500, 'Error creating recipe')
    }
  },
  updateRecipe: async (req, res) => {
    try {
      const { recipeId } = req.params
      const { title, details, userid } = req.body

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

      let imageUrl = existingRecipe[0].photo
      let videoUrl = existingRecipe[0].video

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
        recipeData: updatedRecipe[0],
        userData: null
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
        .select('name, photo')
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
  },
  getRecipesByUserId: async (req, res) => {
    try {
      const { userId } = req.params

      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .select('*')
        .eq('userid', userId)

      if (recipeError) {
        return commonHelper.response(recipeError.hint, null, recipeError.code, recipeError.details)
      }

      const recipes = recipeData || []

      commonHelper.response(res, recipes, 200, 'Success getting recipes by User ID')
    } catch (error) {
      commonHelper.response(res, error, 500, 'Error getting recipes by user ID')
    }
  },
  deleteRecipe: async (req, res) => {
    try {
      const { recipeId } = req.params

      const { data: existingRecipe, error: existingRecipeError } = await supabase
        .from('recipes')
        .select('id')
        .eq('id', recipeId)

      if (existingRecipeError) {
        throw new Error(existingRecipeError.message)
      }

      if (!existingRecipe || existingRecipe.length === 0) {
        return commonHelper.response(res, null, 404, 'Recipe not found')
      }

      const { error: deleteError } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      commonHelper.response(res, null, 200, 'Recipe deleted successfully')
    } catch (error) {
      commonHelper.response(res, error, 500, 'Error while deleting recipe')
    }
  }
}

module.exports = recipeController
