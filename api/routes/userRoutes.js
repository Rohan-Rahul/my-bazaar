const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {verifyToken} = require('../middleware/auth');
const router = express.Router();

//helper function to generate token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      isAdmin: user.isAdmin
    },
    process.env.JWT_SECRET || 'fallback_secret_key',
    {expiresIn: '3d'}
  );
};

//user registration
router.post('/register', async (req,res)=>{
  try{
    const {name,email,password}= req.body;

    //check if user already exists
    const existingUser = await User.findOne({email});
    if(existingUser){
      return res.status(400).json({
        message: 'User already exists'
      });
    }

    //hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create and save the new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    const savedUser = await newUser.save();

    const token = generateToken(savedUser);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        isAdmin: savedUser.isAdmin
      }
    });
  } catch (error){
    res.status(500).json({
      message: 'Server error during registration',
      error: error.message
    });
  }
});

//user login
router.post('/login', async(req,res)=>{
  try{
    const {email,password} = req.body;
    const user = await User.findOne({email});

    if(!user) return res.status(404).json({
      message: 'User not found'
    });

    //verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      return res.status(400).json({
        message: 'Invalid credentials'
      });
    }

    //generate JWT
    const token = generateToken(user);

    res.status(200).json({
      token, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error){
    res.status(500).json({
      message: 'Server error during login',
      error: error.message
    });
  }
});

//Profile Route (required for AuthContext persistence on refresh)
router.get('/profile', verifyToken, async(req,res)=>{
  try{
    const user = await User.findById(req.user.id).select('-password');
    if(!user) return res.status(404).json({
      message: 'User not found'
    });

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    });
  } catch (error){
    res.status(500).json({
      message: 'Server error fetching profile',
      error: error.message
    });
  }
});

//get current profile
router.get('/profile', verifyToken, async(req,res)=>{
  try{
    const uesr = await User.findById(req.user.id).select('-password');
    if(!user) return res.status(404).json({
      message: 'User not found'
    });

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    });
  } catch (error){
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

//update user profile
router.put('/profile', verifyToken,async(req,res)=>{
  try{
    const user = await User.findById(req.user.id);
    if(!user) return res.status(404).json({
      message: 'User not found'
    });

    //update fields if provided
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    //hash and update password only if a new one is provided
    if(req.body.password){
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating profile',
      error: error.message
    });
  }
});

module.exports = router;
