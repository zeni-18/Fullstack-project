const multer = require('multer');
const path = require('path');

// Use memoryStorage so files are stored in RAM (buffer), not on disk.
// This is required for Render/cloud deployments where the filesystem is read-only.
const storage = multer.memoryStorage();

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp|mp4|webm|avi|mov|mkv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image\/(jpeg|jpg|png|gif|webp)|video\/(mp4|webm|x-msvideo|quicktime|x-matroska)/.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images and Videos Only! Supported formats: JPG, PNG, GIF, WebP, MP4, WebM, AVI, MOV, MKV');
    }
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit (suitable for cloud)
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

module.exports = upload;
