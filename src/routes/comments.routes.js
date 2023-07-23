const express = require('express')
const router = express.Router()
const commentsController = require('../controllers/comments.controller')

router
    .post('/:recipeid/:userid', commentsController.createCommentFromUserId)
    .put('/:recipeid/:userid/:id', commentsController.updateCommentFromUserId)
    .get('/:recipeid', commentsController.getCommentFromUserId)
    .delete('/:recipeid/:userid', commentsController.deleteCommentFromUserId)

module.exports = router
