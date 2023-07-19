const { supabase } = require('../config/db')
const commonHelper = require('../helper/common')

const PAGE_SIZE = 10 // Number of records to retrieve per page

const recipeController = {
  getAllRecipes: async (req, res) => {
    try {
      const { page } = req.query
      const currentPage = parseInt(page, 10) || 1 // Current page number
      const start = (currentPage - 1) * PAGE_SIZE
      const end = start + PAGE_SIZE - 1

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
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

      const totalPages = Math.ceil(totalRecords / PAGE_SIZE)

      const pagination = {
        currentPage,
        totalPages,
        totalRecords
      }

      commonHelper.response(res, data, 200, 'Success getting all recipes', pagination)
    } catch (error) {
      commonHelper.response(res, null, 500, 'Error retrieving all recipes')
    }
  }
}

module.exports = recipeController
