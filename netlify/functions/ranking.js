// Netlify Function: Ranking System
const { rankingOps } = require('./db');

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const limit = event.queryStringParameters?.limit || 10;
        const topUsers = await rankingOps.getTopUsers(parseInt(limit));

        // Format ranking data
        const ranking = topUsers.map((user, index) => ({
            position: index + 1,
            name: user.name,
            avatar: user.avatar_url || '/app/assets/default-avatar.svg',
            points: user.total_points,
            tasksCompleted: user.tasks_completed,
            streak: user.current_streak,
            badge: getBadge(user.total_points)
        }));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                ranking,
                totalUsers: ranking.length,
                lastUpdated: new Date().toISOString()
            })
        };

    } catch (error) {
        console.error('Ranking error:', error);
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

function getBadge(points) {
    if (points >= 1000) return '🏆';
    if (points >= 500) return '🥇';
    if (points >= 250) return '🥈';
    if (points >= 100) return '🥉';
    return '🌟';
}