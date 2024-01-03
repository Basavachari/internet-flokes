const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../models/User'); // Replace with your User model path

const router = express.Router();

function isValidPassword(password) {
    // Basic password strength validation (enhance as needed)
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    // const hasSpecialChar = /[!@#$%^&*]/.test(password);
    const minLength = 6;
  
    return (
      password.length >= minLength &&
      hasUppercase &&
      hasLowercase &&
      hasNumber
    );
}
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation

function isValidEmail(email) {
  return emailRegex.test(email);
}
function isValidName(name) {
    // Basic validation for a name (customize as needed)
    return name.trim() !== '' && !name.includes('  '); // Ensure not empty and no double spaces
  }
  
// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Implement robust validation rules for name, email, and password
    if (!isValidName(name) || !isValidEmail(email) || !isValidPassword(password)) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    // Check for existing user with the same email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password securely
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user
    const user = await new User({ name, email, password: hashedPassword });
    console.log(user);
    await user.save();
    // setTimeout(async () => {
    //     await user.save();
    //     console.log('saved');
    // }, 1000);

    // Generate a token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ "status" : true ,"content" : {  data : { id: user.id, name : user.name, email : user.email, created_at : user.created_at }, meta: { access_token: token }} }); // Response with token in meta field
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});


// Login route
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate a token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ "status" : true ,"content" : {  data : { id: user.id, name : user.name, email : user.email, created_at : user.created_at }, meta: { access_token: token }} }); // Response with token in meta field
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

router.get('/me', async (req, res) => {
    try {
      // Verify token
      const token = req.header('Authorization').split(' ')[1]; // Extract token from header
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;
  
      // Find user by userId
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      // Construct response object
      const userDetails = {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at, // Assuming your model has a 'createdAt' field
      };
  
      res.json({
        status: true,
        content: {
          data: userDetails,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

module.exports = router;
