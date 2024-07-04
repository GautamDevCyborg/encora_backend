import User from '../models/user.model.js';
import Image from '../models/image.model.js';
import jwt from 'jsonwebtoken';

// update user
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, profilePicture } = req.body; // Exclude email
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, profilePicture },
      { new: true }
    );

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating profile', error });
  }
};


export const checkAuthAndGetUser = async (req, res, next) => {
  try {
    const token = req.cookies.access_token; // Get the token from the cookies
    
    if (!token) {
      return res.status(401).json({ isLoggedIn: false, message: 'No token provided' });
    }

    // Verify the token
    jwt.verify(token,process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.log("err");
        return res.status(401).json({ isLoggedIn: false, message: 'Invalid token' });
      }
      // Find the user by ID from the decoded token
      const userId = decoded.id;
      const userdata = await User.findById(userId);
      const postData=await Image.find({"associated_user_id":userId});
      const user={"user":userdata,"posts":postData}

      if (!user) {
        return res.status(404).json({ isLoggedIn: false, message: 'User not found' });
      }
      // Send the user details
      res.status(200).json({ isLoggedIn: true, user });
    });
  } catch (error) {
    next(error);
  }
};