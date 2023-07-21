const { supabase } = require('../config/db')
const commonHelper = require('../helper/common')
const { uploadToCloudinary } = require('../middleware/upload')

const DEFAULT_PAGE_SIZE = 10

const recipeController = {
  createRecipe: async (req, res) => {
    try {
      const { title, details, video, userid } = req.body
      const imageUrl = await uploadToCloudinary(req.file.path)
      const { data, error } = await supabase
        .from('recipes')
        .insert({ title, details, photo: imageUrl.url, video, userid })
      if (error) {
        throw new Error(error.message)
      }

      commonHelper.response(res, data, 201, 'Recipe created successfully')
    } catch (error) {
      commonHelper.response(res, null, 500, 'Error creating recipe')
    }
  },
  updateRecipe: async (req, res) => {
    try {
      const { recipeId } = req.params
      const { title, details, photo, video } = req.body
      const { data, error } = await supabase
        .from('recipes')
        .update({ title, details, photo, video })
        .eq('id', recipeId)

      if (error) {
        return commonHelper.response(res, error, 200, 'Update recipe failed')
      }

      commonHelper.response(res, data, 200, 'Recipe updated successfully')
    } catch (error) {
      commonHelper.response(res, null, 500, 'Error updating recipe')
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
