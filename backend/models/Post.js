const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    caption: {
        type: String,
        trim: true,
        default: '',
        maxlength: [1000, 'Caption cannot exceed 1000 characters']
    },
    imageUrl: {
        type: String,
        required: [true, 'Please add media']
    },
    mediaUrl: {
        type: String,
        required: false
    },
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
    },
    videoDuration: {
        type: Number,
        required: false
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    tags: [{
        type: String,
        trim: true
    }],
    location: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', postSchema);
