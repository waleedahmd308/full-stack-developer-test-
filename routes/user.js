var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../model/user');
const { JWT_SECRET } = require('../.env');;
const { default: mongoose } = require('mongoose');
require('dotenv').config(); 





// User Registretion
router.post('/register', async (req, res) => {
    try {
      const { username, password,desc } = req.body;
     
      const user = new User({
        username,
       password,
        desc
      });
  
      await user.save();
      res.json({ message: 'User registered Scessfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server Error' });
    }
  });


  //userlogin


  // User Login
router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      if (password !== user.password) {
      return res.status(401).json({ error: 'Invalid  password' });

    }
 
  
    req.session.user = user;

    res.render('description', { description: user.desc });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server Error' });
    }
  });


  
  module.exports = router;