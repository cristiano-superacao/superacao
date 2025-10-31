// Netlify Function: Tasks Management
const { taskOps, sessionOps } = require('./db');

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Validate session
    const authHeader = event.headers.authorization;
    if (!authHeader) {
        return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Authorization required' })
        };
    }

    try {
        const token = authHeader.replace('Bearer ', '');
        const session = await sessionOps.validateSession(token);

        if (!session) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid or expired session' })
            };
        }

        const userId = session.id;

        if (event.httpMethod === 'GET') {
            // Get user tasks
            const tasks = await taskOps.getUserTasks(userId);
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    tasks
                })
            };

        } else if (event.httpMethod === 'POST') {
            // Create new task
            const { title, description, points = 10, dueDate } = JSON.parse(event.body);

            if (!title) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Task title is required' })
                };
            }

            const task = await taskOps.createTask(userId, title, description, points, dueDate);

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({
                    success: true,
                    task
                })
            };

        } else if (event.httpMethod === 'PUT') {
            // Complete task
            const taskId = event.queryStringParameters?.id;
            
            if (!taskId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Task ID is required' })
                };
            }

            const task = await taskOps.completeTask(parseInt(taskId), userId);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    task,
                    message: 'Task completed successfully!'
                })
            };
        }

        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };

    } catch (error) {
        console.error('Tasks error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error',
                details: error.message 
            })
        };
    }
};