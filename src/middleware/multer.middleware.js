const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage engine for multer
const storage = multer.diskStorage({
    // Where to store uploaded files
    destination: function (req, file, cb) {
        // build an absolute path relative to this file
        const uploadPath = path.join(__dirname, '../../public/temp');
        cb(null, uploadPath);
    },
    // What filename to give the uploaded file
    filename: function (req, file, cb) {
        // replace spaces with underscores
        cb(null, file.originalname.replaceAll(" ", "_"));
    }
});

// Create multer upload middleware with the storage settings
const upload = multer({ storage: storage });

module.exports = upload;
