import jwt from 'jsonwebtoken';
import Image from '../models/image.model.js';

export const upload = async (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(403).json({ message: 'No token provided. Access denied.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Failed to authenticate token.' });
    }

    const { plantedOn, Address, Plant_name, lat, lng, image_name, country, username } = req.body;
    const image = req.file;

    try {
      const newImage = new Image({
        users_username: username,
        associated_user_id: decoded.id,
        plantedOn,
        Address,
        Plant_name,
        lat,
        lng,
        image_name,
        country,
        imageUrl: image.path,
      });

      await newImage.save();

      res.status(201).json({ message: 'Post successful', imageUrl: image.path });
    } catch (error) {
      next(errorHandler(500, 'Failed to save image data.'));
    }
  });
};


export const getAllImages = async (req, res, next) => {
  try {
    const images = await Image.find();
    res.status(200).json(images);
  } catch (error) {
    next(error);
  }
};


// Function to get monthly data counts
export const getMonthlyData = async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => new Date(currentYear, i, 1).toLocaleString('default', { month: 'long' }));
    
    const images = await Image.find({ createdAt: { $gte: new Date(currentYear, 0, 1) } }).sort({ createdAt: 1 });
    const monthlyData = new Array(12).fill(0);

    images.forEach(image => {
      const month = new Date(image.createdAt).getMonth();
      monthlyData[month]++;
    });

    res.status(200).json({
      labels: months,
      data: monthlyData
    });
  } catch (error) {
    next(error);
  }
};

export const getCountryStats = async (req, res, next) => {
  try {
    // Aggregate the data by country
    const stats = await Image.aggregate([
      {
        $group: {
          _id: "$country",
          plants: { $sum: 1 },
          other: { $sum: { $cond: [{ $eq: ["$Plant_name", "Other"] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          country: { $ifNull: ["$_id", "Location not updated by users"] },
          plants: 1,
          other: 1,
          uploads: { $sum: ["$plants", "$other"] },
        },
      },
      {
        $sort: { plants: -1 },
      },
    ]);

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};