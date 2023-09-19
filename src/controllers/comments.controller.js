const { supabase } = require('../config/db')
const Joi = require('joi')
const commonHelper = require('../helper/common')

const commentSchema = Joi.object({
  recipeid: Joi.number().integer().required(),
  userid: Joi.number().integer().required(),
  message: Joi.string().required(),
});

const commentsController = {
  createCommentFromUserId: async (req, res) => {
    try {
      const { error, value } = commentSchema.validate(req.body);

      if (error) {
        return commonHelper.response(res, null, 400, error.details[0].message);
      }

      const { recipeid, userid, message } = value;

      const { data, error: insertError } = await supabase
        .from('comments')
        .insert({ recipeid, userid, message });

      if (insertError) {
        throw new Error(insertError.message);
      }

      commonHelper.response(res, data, 201, 'Comment created successfully');
    } catch (error) {
      console.error('Error creating comment:', error);
      commonHelper.response(res, null, 500, 'Error creating comment');
    }
  },
  updateCommentFromUserId: async (req, res) => {
    try {
      const { id } = req.params;
      const { error, value } = commentSchema.validate(req.body);

      if (error) {
        return commonHelper.response(res, null, 400, error.details[0].message);
      }

      const { recipeid, userid, message } = value;

      const { data, error: updateError } = await supabase
        .from('comments')
        .update({ message })
        .select('*')
        .eq('id', id)
        .eq('recipeid', recipeid)
        .eq('userid', userid)
        .single();

      if (updateError || !data) {
        return commonHelper.response(res, null, 404, 'Comment not found');
      }

      commonHelper.response(res, data, 200, 'Comment updated successfully');
    } catch (error) {
      console.error('Error updating comment:', error);
      commonHelper.response(res, null, 500, 'Error updating comment');
    }
  },
  getCommentFromUserId: async (req, res) => {
    try {
      const { recipeid } = req.params;
  
      // Fetch comments for the given recipeid
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('recipeid', recipeid);
  
      if (commentsError) {
        throw new Error(commentsError.message);
      }
  
      const userIds = commentsData.map((comment) => comment.userid).filter(Boolean);
      if (userIds.length === 0) {
        return commonHelper.response(res, [], 200, 'No comments found for the given recipe');
      }
  
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, photo')
        .in('id', userIds);
  
      if (userError) {
        throw new Error(userError.message);
      }
  
      const commentsWithUserData = commentsData.map((comment) => {
        const user = userData.find((user) => user.id === comment.userid);
        return {
          ...comment,
          user: user ? { name: user.name, photo: user.photo } : null,
        };
      });
  
      commonHelper.response(res, commentsWithUserData, 200, 'Comments fetched successfully');
    } catch (error) {
      console.error('Error fetching comments from user ID:', error);
      commonHelper.response(res, null, 500, 'Error fetching comments');
    }
  },
  deleteCommentFromUserId: async (req, res) => {
    try {
      const { userid } = req.params;

      const { data: commentData, error: commentError } = await supabase
        .from('comments')
        .select('*')
        .eq('userid', userid)

      if (commentError) {
        throw new Error(commentError.message)
      }

      if (!commentData || commentData.length === 0) {
        return commonHelper.response(res, null, 404, 'Comment not found')
      }

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('userid', userid)
        .single();

      commonHelper.response(res, commentData, 200, 'Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment from user ID:', error);
      commonHelper.response(res, null, 500, 'Error deleting comment');
    }
  }
}

module.exports = commentsController