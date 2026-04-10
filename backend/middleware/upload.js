const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        const isVideo = file.mimetype.startsWith('video/');
        return {
            folder: 'connectx',
            resource_type: isVideo ? 'video' : 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mov', 'avi', 'mkv'],
            transformation: isVideo ? [] : [{ quality: 'auto', fetch_format: 'auto' }]
        };
    }
});

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp|mp4|webm|avi|mov|mkv/;
    const mimetype = /image\/(jpeg|jpg|png|gif|webp)|video\/(mp4|webm|x-msvideo|quicktime|x-matroska)/.test(file.mimetype);

    if (mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Images and Videos Only! Supported formats: JPG, PNG, GIF, WebP, MP4, WebM, AVI, MOV, MKV');
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 100 }, // 100MB limit
    fileFilter: (req, file, cb) => checkFileType(file, cb)
});

module.exports = upload;
