const fs = require('fs')
const multer = require('multer')
const cloudinary = require('cloudinary').v2

// Create a new uploads directory if it doesn't exist
if (!fs.existsSync('../uploads')) {
  fs.mkdirSync('../uploads')
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUDNAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Setup Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const upload = multer({ storage })

async function uploadToCloudinary (localFilePath) {
  try {
    const result = await cloudinary.uploader.upload(localFilePath, { folder: 'main' })
    fs.unlinkSync(localFilePath)
    return {
      message: 'success',
      url: result.url
    }
  } catch (error) {
    fs.unlinkSync(localFilePath)
    return { message: error }
  }
}

module.exports = { upload, uploadToCloudinary }
