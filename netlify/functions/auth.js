// Netlify Function: User Authentication
const { userOps, sessionOps } = require('./db');

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        if (event.httpMethod === 'POST') {
            // Login/Register user
            const { email, name, googleId, avatarUrl } = JSON.parse(event.body);

            if (!email || !name) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Email and name are required' })
                };
            }

            // Check if user exists
            let user = await userOps.findByEmail(email);
            
            // Create user if doesn't exist
            if (!user) {
                user = await userOps.createUser(email, name, googleId, avatarUrl);
            }

            // Create session token
            const sessionToken = generateSessionToken();
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
            
            await sessionOps.createSession(user.id, sessionToken, expiresAt);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        avatarUrl: user.avatar_url
                    },
                    sessionToken
                })
            };

        } else if (event.httpMethod === 'GET') {
            // Validate session
            const authHeader = event.headers.authorization;
            if (!authHeader) {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ error: 'No authorization header' })
                };
            }

            const token = authHeader.replace('Bearer ', '');
            const session = await sessionOps.validateSession(token);

            if (!session) {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ error: 'Invalid or expired session' })
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    user: {
                        id: session.id,
                        email: session.email,
                        name: session.name,
                        avatarUrl: session.avatar_url
                    }
                })
            };
        }

        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };

    } catch (error) {
        console.error('Auth error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};

function generateSessionToken() {
    return require('crypto').randomBytes(32).toString('hex');
}