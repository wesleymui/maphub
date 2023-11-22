import { Request, Response } from 'express';
import auth from '../auth/index';
import User from '../models/user-model';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, passwordVerify } = req.body;

    const defaultProfilePic = Buffer.alloc(0);
    const emptyMapList: mongoose.Types.ObjectId[] = [];

    console.log(
      'create user: ' +
        username +
        ' ' +
        email +
        ' ' +
        password +
        ' ' +
        passwordVerify,
    );
    if (!username || !email || !password || !passwordVerify) {
      return res
        .status(400)
        .json({ errorMessage: 'Please enter all required fields.' });
    }
    console.log('all fields provided');
    if (password.length < 8) {
      return res.status(400).json({
        errorMessage: 'Please enter a password of at least 8 characters.',
      });
    }
    console.log('password long enough');
    if (password !== passwordVerify) {
      return res.status(400).json({
        errorMessage: 'Please enter the same password twice.',
      });
    }
    console.log('password and password verify match');

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);
    console.log('passwordHash: ' + passwordHash);

    const newUser = new User({
      username,
      email,
      password: passwordHash,
      maps: emptyMapList,
    });
    const savedUser = await newUser.save();
    console.log('New user saved: ' + savedUser._id);
    res
      .status(200)
      .json({
        success: true,
        user: newUser
      })
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errorMessage: 'Server error' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    console.log(req.body);
    if(!username || !password) {
      return res
        .status(400)
        .json({errorMessage: 'Please enter both username and password.'});
    }

    const user = await User.findOne({username});
    console.log(user);

    if(!user) {
      return res
        .status(400)
        .json({errorMessage: 'Incorrect username.'});
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
       return res
        .status(400)
        .json({errorMessage: 'Incorrect password.'})
    }
    const token = auth.signToken(user._id.toString());

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
      .status(200)
      .json({
        success: true,
        user: {
          username: user.username,
          email: user.email,
        },
      });

  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, errorMessage: 'Server error' });
  }
}

export const logoutUser = async (req: Request, res: Response) => {
  try {
    // Clear the token cookie on the client side
    res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' });

    // Send a success response
    res.status(200).json({ success: true, message: 'User logged out successfully.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errorMessage: 'Server error' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Retrieve all users from the database (adjust the query as needed)
    const users = await User.find();

    // Send the user data as a JSON response
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export default registerUser;
