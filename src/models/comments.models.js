const { Pool } = require('pg');

const createCommentByUserId = () => {
    const query = {
        text: 'INSERT INTO comments (recipeid, userid, message) VALUES ($1, $2, $3)',
        values: [recipeid, userid, message]
      }
      return Pool.query(query)
  }
  
  const getCommentByUserId = (userid) => {
    return Pool.query(`SELECT * from comments WHERE userid = ${userid}`)
  }
  
  const updateCommentByUserId = (userid, recipeid, updatedData) => {
    const { message } = updatedData
  
    const query = {
      text: 'UPDATE comments SET message = $1 WHERE userid = $2 AND id = $3',
      values: [message, userid, recipeid]
    }
    return Pool.query(query)
  }

  const deleteCommentByUserId = (userid) => {
    return Pool.query(`DELETE FROM comments WHERE userid = ${userid}`)
  }
  
  module.exports = { createCommentByUserId, getCommentByUserId, updateCommentByUserId, deleteCommentByUserId }