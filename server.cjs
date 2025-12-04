const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'happytummy_secret_key';

app.use(express.json());

// CORS configuration
app.use(cors({
    origin: '*',
    credentials: true
}));

// PostgreSQL Database Setup
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to PostgreSQL:', err.stack);
    } else {
        console.log('Connected to PostgreSQL database');
        release();
    }
});

// Create users table if it doesn't exist
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

pool.query(createTableQuery, (err) => {
    if (err) {
        console.error('Error creating users table:', err);
    } else {
        console.log('Users table ready');
    }
});

// Create recipes table
const createRecipesTable = `
    CREATE TABLE IF NOT EXISTS recipes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        ingredients TEXT,
        instructions TEXT,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

pool.query(createRecipesTable, (err) => {
    if (err) {
        console.error('Error creating recipes table:', err);
    } else {
        console.log('Recipes table ready');
    }
});

// Create games table
const createGamesTable = `
    CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        thumbnail_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

pool.query(createGamesTable, (err) => {
    if (err) {
        console.error('Error creating games table:', err);
    } else {
        console.log('Games table ready');
    }
});

// Create hero content table
const createHeroTable = `
    CREATE TABLE IF NOT EXISTS hero_content (
        id SERIAL PRIMARY KEY,
        heading1 VARCHAR(255),
        heading2 VARCHAR(255),
        description TEXT,
        image_url VARCHAR(500),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

pool.query(createHeroTable, (err) => {
    if (err) {
        console.error('Error creating hero_content table:', err);
    } else {
        console.log('Hero content table ready');
    }
});

// Routes
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = bcrypt.hashSync(password, 8);

        const result = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, hashedPassword]
        );

        const user = result.rows[0];
        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '24h' });

        res.json({
            message: 'User registered',
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (err) {
        if (err.code === '23505') { // Unique violation
            return res.status(400).json({ error: 'Email already exists' });
        }
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '24h' });
        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ========== CONTENT MANAGEMENT ENDPOINTS ==========

// Get all recipes
app.get('/api/recipes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM recipes ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching recipes:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create recipe
app.post('/api/recipes', async (req, res) => {
    const { title, description, ingredients, instructions, image_url } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO recipes (title, description, ingredients, instructions, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, description, ingredients, instructions, image_url]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error creating recipe:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update recipe
app.put('/api/recipes/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, ingredients, instructions, image_url } = req.body;
    try {
        const result = await pool.query(
            'UPDATE recipes SET title=$1, description=$2, ingredients=$3, instructions=$4, image_url=$5, updated_at=CURRENT_TIMESTAMP WHERE id=$6 RETURNING *',
            [title, description, ingredients, instructions, image_url, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating recipe:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete recipe
app.delete('/api/recipes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM recipes WHERE id=$1', [id]);
        res.json({ message: 'Recipe deleted' });
    } catch (err) {
        console.error('Error deleting recipe:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all games
app.get('/api/games', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM games ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching games:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create game
app.post('/api/games', async (req, res) => {
    const { title, description, thumbnail_url } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO games (title, description, thumbnail_url) VALUES ($1, $2, $3) RETURNING *',
            [title, description, thumbnail_url]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error creating game:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update game
app.put('/api/games/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, thumbnail_url } = req.body;
    try {
        const result = await pool.query(
            'UPDATE games SET title=$1, description=$2, thumbnail_url=$3, updated_at=CURRENT_TIMESTAMP WHERE id=$4 RETURNING *',
            [title, description, thumbnail_url, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating game:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete game
app.delete('/api/games/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM games WHERE id=$1', [id]);
        res.json({ message: 'Game deleted' });
    } catch (err) {
        console.error('Error deleting game:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ========== HERO CONTENT ENDPOINTS ==========

// Get hero content
app.get('/api/hero', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM hero_content ORDER BY id DESC LIMIT 1');
        res.json(result.rows[0] || null);
    } catch (err) {
        console.error('Error fetching hero content:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update/Create hero content
app.post('/api/hero', async (req, res) => {
    const { heading1, heading2, description, image_url } = req.body;
    try {
        // Check if hero content exists
        const existing = await pool.query('SELECT id FROM hero_content LIMIT 1');

        if (existing.rows.length > 0) {
            // Update existing
            const result = await pool.query(
                'UPDATE hero_content SET heading1=$1, heading2=$2, description=$3, image_url=$4, updated_at=CURRENT_TIMESTAMP WHERE id=$5 RETURNING *',
                [heading1, heading2, description, image_url, existing.rows[0].id]
            );
            res.json(result.rows[0]);
        } else {
            // Create new
            const result = await pool.query(
                'INSERT INTO hero_content (heading1, heading2, description, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
                [heading1, heading2, description, image_url]
            );
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error('Error updating hero content:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'postgresql' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
