import { Request, Response } from 'express';
import auth from '../auth/index';
import User from '../models/user-model';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, passwordVerify } = req.body;

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

    if (!/^[\w.]{2,15}\w$/.test(username)) {
      return res
        .status(400)
        .json({ errorMessage: 'Username does not meet requirements.' });
    }
    console.log('Username is valid.');

    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      return res
        .status(400)
        .json({ errorMessage: 'Email address does not meet requirements.' });
    }
    console.log('Email address is valid.');

    if (!/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/.test(password)) {
      return res.status(400).json({
        errorMessage: 'Password does not meet requirements.',
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
    res.status(200).json({
      success: true,
      user: {
        id: savedUser._id,
        username: savedUser.username,
        profilePic: savedUser.profilePic.toString('base64'),
      },
    });
  } catch (err: any) {
    if (err.code === 11000) {
      console.log(err);
      // Duplicate key error - usualyl in the form of "dupKey": dupValue
      const duplicateField = Object.keys(err.keyValue)[0];
      // To make it look pretty :#
      const capitalizedField =
        duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1);
      console.log(`${capitalizedField} already in use.`);
      return res.status(400).json({
        success: false,
        errorMessage: `${capitalizedField} already in use.`,
      });
    } else {
      // Handle other errors - idk for now, we can expand on this
      console.error('Error while saving the user:', err.message);
      return res.status(500).json({
        success: false,
        errorMessage: 'An internal server error occurred.',
      });
    }
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    console.log(req.body);
    if (!username || !password) {
      return res
        .status(400)
        .json({ errorMessage: 'Please enter both username and password.' });
    }

    const user = await User.findOne({ username });
    console.log(user);

    if (!user) {
      return res.status(400).json({ errorMessage: 'Incorrect username.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ errorMessage: 'Incorrect password.' });
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
          id: user._id,
          username: user.username,
          profilePic: Buffer.from(user.profilePic).toString('base64'),
        },
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errorMessage: 'Server error' });
  }
};

export const getExists = async (request: Request, response: Response) => {
  try {
    const { username } = request.query;
    if (!username) {
      return response.status(400).json({
        success: false,
        errorMessage: 'Please include the username to check if it exists.',
      });
    }

    const user = await User.exists({ username });
    if (user) {
      return response
        .status(200)
        .json({ success: true, username, exists: true });
    } else {
      return response
        .status(200)
        .json({ success: true, username, exists: false });
    }
  } catch (error) {
    return response.status(500).json({
      success: false,
      errorMessage: 'There is an internal error. Please try again.',
    });
  }
};

export const getProfilePic = async (request: Request, response: Response) => {
  try {
    const { id } = request.body;

    if (!id) {
      return response.status(400).json({
        errorMessage: 'Please request a profile picture with a valid user ID.',
      });
    }

    // Try to find user.
    const user = await User.findById(id);
    if (!user) {
      return response.status(400).json({
        errorMessage: 'Please request a profile picture with a valid user ID.',
      });
    }

    // Converts and sends the profile picture as a base64-encoded string.
    const profilePic = user.profilePic;
    const b64ProfilePic = Buffer.from(profilePic).toString('base64');
    return response.status(200).json({ profilePic: b64ProfilePic });
  } catch (error) {
    return response.status(500).json({
      errorMessage:
        'There has been an internal server error. Please try again. ',
    });
  }
};

export const postUsername = async (request: Request, response: Response) => {
  try {
    const { username } = request.body;
    const { userId } = request as any;

    // Checks if the request is well-formed.
    if (!username) {
      return response.status(400).json({
        success: false,
        errorMessage: 'Please include the new username to update the user.',
      });
    }

    // Checks if the username already exists.
    const name = await User.exists({ username });
    if (name) {
      return response.status(400).json({
        success: false,
        errorMessage:
          'Username already exists. Please choose another username.',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return response.status(400).json({
        success: false,
        errorMessage: 'User does not exist.',
      });
    }

    user.username = username;
    user.save();
    return response.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        profilePic: Buffer.from(user.profilePic).toString('base64'),
      },
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      errorMessage: 'There has been an internal error. Please try again later.',
    });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    // Clear the token cookie on the client side
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    // Send a success response
    res
      .status(200)
      .json({ success: true, message: 'User logged out successfully.' });
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
