// Database connection utility for Neon PostgreSQL
const { Pool } = require('pg');

// Create connection pool
let pool;

function getPool() {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                require: true,
                rejectUnauthorized: false
            },
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
    }
    return pool;
}

// Database query helper
async function query(text, params) {
    const client = getPool();
    try {
        const result = await client.query(text, params);
        return result;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// User operations
const userOps = {
    async createUser(email, name, googleId, avatarUrl) {
        const text = `
            INSERT INTO users (email, name, google_id, avatar_url) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *
        `;
        const values = [email, name, googleId, avatarUrl];
        const result = await query(text, values);
        return result.rows[0];
    },

    async findByEmail(email) {
        const text = 'SELECT * FROM users WHERE email = $1';
        const result = await query(text, [email]);
        return result.rows[0];
    },

    async findById(id) {
        const text = 'SELECT * FROM users WHERE id = $1';
        const result = await query(text, [id]);
        return result.rows[0];
    }
};

// Task operations
const taskOps = {
    async getUserTasks(userId) {
        const text = `
            SELECT * FROM tasks 
            WHERE user_id = $1 
            ORDER BY created_at DESC
        `;
        const result = await query(text, [userId]);
        return result.rows;
    },

    async createTask(userId, title, description, points, dueDate) {
        const text = `
            INSERT INTO tasks (user_id, title, description, points, due_date) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *
        `;
        const values = [userId, title, description, points, dueDate];
        const result = await query(text, values);
        return result.rows[0];
    },

    async completeTask(taskId, userId) {
        const client = getPool();
        try {
            await client.query('BEGIN');
            
            // Mark task as completed
            const taskText = `
                UPDATE tasks 
                SET completed = true, completed_at = NOW() 
                WHERE id = $1 AND user_id = $2 
                RETURNING *
            `;
            const taskResult = await client.query(taskText, [taskId, userId]);
            
            if (taskResult.rows.length === 0) {
                throw new Error('Task not found');
            }
            
            const task = taskResult.rows[0];
            
            // Update user stats
            const statsText = `
                INSERT INTO user_stats (user_id, total_points, tasks_completed, current_streak, best_streak, last_activity)
                VALUES ($1, $2, 1, 1, 1, NOW())
                ON CONFLICT (user_id) DO UPDATE SET
                    total_points = user_stats.total_points + $2,
                    tasks_completed = user_stats.tasks_completed + 1,
                    current_streak = user_stats.current_streak + 1,
                    best_streak = GREATEST(user_stats.best_streak, user_stats.current_streak + 1),
                    last_activity = NOW()
            `;
            await client.query(statsText, [userId, task.points]);
            
            await client.query('COMMIT');
            return task;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
    }
};

// Ranking operations
const rankingOps = {
    async getTopUsers(limit = 10) {
        const text = `
            SELECT u.name, u.avatar_url, s.total_points, s.tasks_completed, s.current_streak
            FROM user_stats s
            JOIN users u ON u.id = s.user_id
            ORDER BY s.total_points DESC
            LIMIT $1
        `;
        const result = await query(text, [limit]);
        return result.rows;
    }
};

// Session operations
const sessionOps = {
    async createSession(userId, token, expiresAt) {
        const text = `
            INSERT INTO user_sessions (user_id, session_token, expires_at) 
            VALUES ($1, $2, $3) 
            RETURNING *
        `;
        const result = await query(text, [userId, token, expiresAt]);
        return result.rows[0];
    },

    async validateSession(token) {
        const text = `
            SELECT s.*, u.* FROM user_sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.session_token = $1 AND s.expires_at > NOW()
        `;
        const result = await query(text, [token]);
        return result.rows[0];
    }
};

module.exports = {
    query,
    userOps,
    taskOps,
    rankingOps,
    sessionOps
};