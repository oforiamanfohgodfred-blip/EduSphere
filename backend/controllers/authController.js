const pool = require("../config/db");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
  try {
    const { fullname, email, password, role } = req.body;

    // Check if all fields are provided
    if (!fullname || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "Email already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    await pool.query(
      `INSERT INTO users (fullname, email, password, role)
       VALUES ($1, $2, $3, $4)`,
      [fullname, email, hashedPassword, role]
    );

    res.status(201).json({
      message: "Registration successful.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error.",
    });
  }
};

const jwt = require("jsonwebtoken");

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid email or password."
      });
    }

    const user = result.rows[0];

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({
        message: "Invalid email or password."
      });
    }

    // Create JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
     process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.json({
      message: "Login successful.",
      token,
      role: user.role,
      fullname: user.fullname
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error."
    });
  }
};

module.exports = {
  register,
  login,
};