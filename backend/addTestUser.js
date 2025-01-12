const db = require('./models');

// Create a test user
async function addTestUser() {
    try {
        await db.sequelize.sync(); // Ensure the database is synced
        const user = await db.User.create({
            username: 'pat',
            password: 'password123', // In production, this should be hashed
        });
        console.log('Test user created:', user.toJSON());
    } catch (err) {
        console.error('Error creating test user:', err);
    } finally {
        await db.sequelize.close(); // Close the database connection
    }
}

addTestUser();
