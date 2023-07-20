const Pool = require('../config/db')

const getAllRecipes = () => {
  return Pool.query('SELECT * FROM recipes')
}

const getRecipesById = (recipesId) => {
  return Pool.query(`SELECT * from recipes WHERE id = ${recipesId}`)
}

const createRecipeByUserId = (userId, title, photo, details, video) => {
  const query = {
    text: 'INSERT INTO recipes (user_id, photo, title, details, video) VALUES ($1, $2, $3, $4, $5)',
    values: [userId, photo, title, details, video]
  }
  return Pool.query(query)
}

const updateRecipeByUserId = (userId, recipeId, updatedData) => {
  const { photo, title, details, video } = updatedData

  const query = {
    text: 'UPDATE recipes SET photo = $1, title = $2, details = $3, video = $4 WHERE UserID = $5 AND ID = $6',
    values: [photo, title, details, video, userId, recipeId]
  }
  return Pool.query(query)
}

module.exports = { getAllRecipes, getRecipesById, createRecipeByUserId, updateRecipeByUserId }
