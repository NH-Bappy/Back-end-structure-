const { CustomError } = require('../utils/customError');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'du2jk0u7x',
    api_key: '278226937927258',
    api_secret: 'HmDi6OsqpxouYfze5FOPZCNIJSI'
});

exports.uploadFileInCloudinary = async (filePath) => {
    try {
        // Upload original file
        // filePath → is the local path of the file you uploaded (for example from multer or another upload middleware).
        //cloudinary.uploader.upload() → sends the file from your server to Cloudinary’s servers.
        //resource_type: "image" → tells Cloudinary you’re uploading an image (instead of video, raw, etc.).
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: "image"
        });

        // Generate optimized URL
        //generates a smart URL with optimizations (f_auto,q_auto).
        //cloudinary.url(public_id, options) → creates a Cloudinary delivery URL.
        //result.public_id → the unique ID of your uploaded image (without the file extension).
        //You can store this url in your DB instead of a static JPG/PNG URL.
        const url = cloudinary.url(result.public_id, {
            fetch_format: "auto",
            quality: "auto"
        });

        // Remove local file after upload
        fs.unlinkSync(filePath);

        return url;
    } catch (error) {
        console.error("error from cloudinary file upload", error);
        throw new CustomError(401, error.message);
    }
};
