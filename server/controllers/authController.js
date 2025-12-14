//STORE controller functions to perform CRUD operations associated with db table
import bcrypt from "bcrypt";
import { pool } from "../config/database.js";
import jwt from "jsonwebtoken";

// Register user
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword]
    );
    const user = result.rows[0];
    // ✅ NEW: Link any pending invitations to this user
    await linkInvitationToUser(user.id, email);

    // Generate token immediately so they can login after signup
    const token = jwt.sign(
      { id: user.id, email: user.email , name: user.name},
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({ message: "User registered successfully", user: result.rows[0], token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//Login User (jwt)
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });
    //NEW: Link any pending invitations
    await linkInvitationToUser(user.id, email);
    const token = jwt.sign(
      { id: user.id, email: user.email , name: user.name},
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout user
export const logoutUser = (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.status(200).json({ message: "Logged out successfully" });
  });
};

//Get user profile
export const getProfile = async (req, res) => {
  try{
    const {id} = req.user;
    const result = await pool.query("SELECT id, name, email FROM users where id= $1", [id]);
    const user = result.rows[0];
    if (!user) {
      return (res.status(404).json({ message: "User not found" }));
    }
    else {
      return (res.status(200).json( {user} ));
    }
  }
  catch(err){
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
};

//Link invitations to user upon registration
export const linkInvitationToUser = async (userId, email) => {
  try {
    // Find all invitations for this email and link them to user
    const result = await pool.query(
      'UPDATE invitations SET invitee_id = $1 WHERE email = $2 AND invitee_id IS NULL RETURNING *',
      [userId, email]
    );
    
    if (result.rows.length > 0) {
      console.log(`✅ Linked ${result.rows.length} invitation(s) to user ${userId}`);
    }
  } catch (err) {
    console.error('Error linking invitations:', err);
  }
};

// Update user profile

export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users 
       SET name = $1, email = $2 
       WHERE id = $3 RETURNING id, name, email`,
      [name, email, userId]
    );

    return res.status(200).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

export const updatePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  try {
    const userResult = await pool.query(
      "SELECT password FROM users WHERE id = $1",
      [userId]
    );

    const valid = await bcrypt.compare(
      currentPassword,
      userResult.rows[0].password
    );

    if (!valid) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashed, userId]
    );

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update password" });
  }
};