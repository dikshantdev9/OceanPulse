import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { userStore } from './userStore.js';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'oceanpulse_super_secure_jwt_secret_2026';

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Helper: Generate JWT token
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired session token.' });
    }

    const user = userStore.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User account no longer exists.' });
    }

    req.user = userStore.toPublicUser(user);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'OceanPulse Authentication Service' });
});

// 1. POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Full name must be at least 2 characters.' });
    }

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      return res.status(400).json({ message: 'Please enter a valid work email address.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Attempt user creation
    try {
      const newUser = userStore.createUser({
        name: name.trim(),
        email: email.trim(),
        passwordPlain: password,
        role: role || 'researcher',
      });

      const token = generateToken(newUser);

      return res.status(201).json({
        message: 'Account created successfully.',
        token,
        user: newUser,
      });
    } catch (createErr) {
      if (createErr.message === 'EMAIL_EXISTS') {
        return res.status(409).json({ message: 'An account with this email already exists.' });
      }
      throw createErr;
    }
  } catch (err) {
    console.error('[Auth API] Register error:', err);
    return res.status(500).json({ message: 'Authentication service error during registration.' });
  }
});

// 2. POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Please enter your email address.' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Please enter your password.' });
    }

    const user = userStore.findByEmail(email.trim());
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const publicUser = userStore.toPublicUser(user);
    const token = generateToken(publicUser);

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: publicUser,
    });
  } catch (err) {
    console.error('[Auth API] Login error:', err);
    return res.status(500).json({ message: 'Authentication service temporarily unavailable.' });
  }
});

// 3. GET /api/auth/me
app.get('/api/auth/me', authenticateToken, (req, res) => {
  return res.status(200).json({
    user: req.user,
  });
});

// 4. POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  return res.status(200).json({ message: 'Logged out successfully.' });
});

// Start listening
app.listen(PORT, () => {
  console.log(`[OceanPulse Auth Server] Running on http://localhost:${PORT}`);
  console.log(`[OceanPulse Auth Server] Demo login: demo@oceanpulse.ai / Demo@123`);
});
