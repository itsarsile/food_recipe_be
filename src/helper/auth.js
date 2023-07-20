const { supabase } = require('../config/db')

const findEmail = async (email) => {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('email', email).single()
      return data
    } catch (error) {
      console.error('Error finding email:', error.message)
      return null
    }
  }

module.exports = {findEmail}