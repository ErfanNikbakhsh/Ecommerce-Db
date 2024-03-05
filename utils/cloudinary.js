const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const cloudinaryUploadImg = async (file) => {
  const options = {
    resource_type: 'auto',
  };

  try {
    // Upload the image
    const result = await cloudinary.uploader.upload(file, options);

    return {
      publicId: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

module.exports = cloudinaryUploadImg;
