const sequelize = require('./config/dbConfig');
const User = require('./models/User');

// Create a test user
async function addTestUser() {
    try {
        await sequelize.sync(); // Ensure the database is synced
        const user = await User.create({
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'testpassword', // Normally, you'd hash this
        });
        console.log('Test user created:', user.toJSON());
    } catch (err) {
        console.error('Error creating test user:', err);
    } finally {
        await sequelize.close(); // Close the database connection
    }
}

addTestUser();
