import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

export const signup = async (req, res, next) => {
  const { email, password, username } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ email, password: hashedPassword, username });

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', details: error.message });
    }
    next(error);
  }
};


export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, 'User not found'));

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, 'Wrong credentials'));

    const token = jwt.sign({ id: validUser._id, username: validUser.username, email: validUser.email }, process.env.JWT_SECRET);
    const { password: hashedPassword, ...rest } = validUser._doc;
    const expiryDate = new Date(Date.now() + 3600000); // 1 hour

    const cookieOptions = {
      httpOnly: true,
      expires: expiryDate,
      sameSite: 'None',
      secure: true
    };

    // if (process.env.NODE_ENV === 'production') {
    //   cookieOptions.domain = '.encoraaaa.vercel.app';
    // }

    res
      .cookie('access_token', token, cookieOptions)
      .status(200)
      .json({ message: 'Login successful', ...rest });
  } catch (error) {
    next(error);
  }
};


export const signout = (req, res) => {
  res.clearCookie('access_token').status(200).json('Signout success!');
};


export const check = (req, res) => {
  const accessToken = req.cookies.access_token;
  if (accessToken) {
    jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ loggedIn: false });
      }
      return res.status(200).json({ loggedIn: true });
    });
  } else {
    return res.status(401).json({ loggedIn: false });
  }
};



// export const google = async (req, res, next) => {
//   try {
//     const user = await User.findOne({ email: req.body.email });
//     if (user) {
//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
//       const { password: hashedPassword, ...rest } = user._doc;
//       const expiryDate = new Date(Date.now() + 3600000); // 1 hour
//       res
//         .cookie('access_token', token, {
//           httpOnly: true,
//           expires: expiryDate,
//         })
//         .status(200)
//         .json(rest);
//     } else {
//       const generatedPassword =
//         Math.random().toString(36).slice(-8) +
//         Math.random().toString(36).slice(-8);
//       const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
//       const newUser = new User({
//         username:
//           req.body.name.split(' ').join('').toLowerCase() +
//           Math.random().toString(36).slice(-8),
//         email: req.body.email,
//         password: hashedPassword,
//         profilePicture: req.body.photo,
//       });
//       await newUser.save();
//       const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
//       const { password: hashedPassword2, ...rest } = newUser._doc;
//       const expiryDate = new Date(Date.now() + 3600000); // 1 hour
//       res
//         .cookie('access_token', token, {
//           httpOnly: true,
//           expires: expiryDate,
//         })
//         .status(200)
//         .json(rest);
//     }
//   } catch (error) {
//     next(error);
//   }
// };


