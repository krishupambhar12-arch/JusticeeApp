const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const axios = require('axios');

// Helper function to generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "secretKey", {
    expiresIn: "1d",
  });
};

// User Registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role: "Client", // Default role for user registration
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get User Profile
router.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretKey");
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update User Profile
router.put("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretKey");
    const { name, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      decoded.id,
      { name, phone, address },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Google OAuth
router.post("/auth/google", async (req, res) => {
  try {
    const { code } = req.body;
    
    // Exchange code for tokens
    console.log('🔍 Google OAuth: Exchanging code for tokens...');
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    const { access_token, id_token } = tokenResponse.data;
    
    // Get user info from Google
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { email, name, picture, id: googleId } = userInfoResponse.data;
    
    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user for social login
      user = new User({
        name,
        email,
        password: Math.random().toString(36).slice(-8), // Random password
        role: 'Client', // Default role for social login
        isSocialLogin: true,
        profilePicture: picture,
        provider: 'google',
        providerId: googleId
      });
      await user.save();
      console.log('New Google user created:', { email, name, role: user.role });
    } else {
      // Update existing user with Google info if needed
      if (!user.isSocialLogin) {
        user.isSocialLogin = true;
        user.provider = 'google';
        user.providerId = googleId;
        if (!user.profilePicture) {
          user.profilePicture = picture;
        }
        await user.save();
        console.log('Existing user updated with Google info:', { email, name, role: user.role });
      }
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secretKey",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        provider: user.provider,
        isSocialLogin: user.isSocialLogin
      }
    });

  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ message: "Google authentication failed" });
  }
});

// Facebook OAuth
router.post("/auth/facebook", async (req, res) => {
  try {
    const { code } = req.body;
    
    // Exchange code for tokens
    const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
        code
      }
    });

    const { access_token } = tokenResponse.data;
    
    // Get user info from Facebook
    const userInfoResponse = await axios.get('https://graph.facebook.com/v18.0/me', {
      params: {
        fields: 'id,name,email,picture',
        access_token
      }
    });

    const { id: facebookId, name, email, picture } = userInfoResponse.data;
    
    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      user = new User({
        name,
        email,
        password: Math.random().toString(36).slice(-8),
        role: 'Client',
        isSocialLogin: true,
        profilePicture: picture?.data?.url,
        provider: 'facebook',
        providerId: facebookId
      });
      await user.save();
    } else {
      if (!user.isSocialLogin) {
        user.isSocialLogin = true;
        user.provider = 'facebook';
        user.providerId = facebookId;
        if (!user.profilePicture) {
          user.profilePicture = picture?.data?.url;
        }
        await user.save();
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secretKey",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        provider: user.provider,
        isSocialLogin: user.isSocialLogin
      }
    });

  } catch (error) {
    console.error("Facebook auth error:", error);
    res.status(500).json({ message: "Facebook authentication failed" });
  }
});

// LinkedIn OAuth
router.post("/auth/linkedin", async (req, res) => {
  try {
    const { code } = req.body;
    
    // Exchange code for tokens
    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', 
      `grant_type=authorization_code&code=${code}&redirect_uri=${process.env.LINKEDIN_REDIRECT_URI}&client_id=${process.env.LINKEDIN_CLIENT_ID}&client_secret=${process.env.LINKEDIN_CLIENT_SECRET}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token } = tokenResponse.data;
    
    // Get user info from LinkedIn
    const userInfoResponse = await axios.get('https://api.linkedin.com/v2/people/~:(id,firstName,lastName,emailAddress,profilePicture(displayImage~:playableStreams))', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    const { id: linkedinId, firstName, lastName, emailAddress, profilePicture } = userInfoResponse.data;
    const name = `${firstName.localized.en_US} ${lastName.localized.en_US}`;
    
    // Find or create user
    let user = await User.findOne({ email: emailAddress });
    
    if (!user) {
      user = new User({
        name,
        email: emailAddress,
        password: Math.random().toString(36).slice(-8),
        role: 'Client',
        isSocialLogin: true,
        profilePicture: profilePicture?.displayImage?.elements?.[0]?.identifiers?.[0]?.identifier,
        provider: 'linkedin',
        providerId: linkedinId
      });
      await user.save();
    } else {
      if (!user.isSocialLogin) {
        user.isSocialLogin = true;
        user.provider = 'linkedin';
        user.providerId = linkedinId;
        if (!user.profilePicture) {
          user.profilePicture = profilePicture?.displayImage?.elements?.[0]?.identifiers?.[0]?.identifier;
        }
        await user.save();
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secretKey",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        provider: user.provider,
        isSocialLogin: user.isSocialLogin
      }
    });

  } catch (error) {
    console.error("LinkedIn auth error:", error);
    res.status(500).json({ message: "LinkedIn authentication failed" });
  }
});

module.exports = router;
