const sequelize = require('./config/dbConfig');
require('./models/Channel');
require('./models/Message');
require('./models/User');

// Only force sync if explicitly requested
const force = process.argv.includes('--force');

sequelize.sync({ force })
    .then(() => {
        console.log(`Database synchronized ${force ? 'with' : 'without'} dropping tables.`);
        process.exit(0);
    })
    .catch(err => {
        console.error('Error synchronizing the database:', err);
        process.exit(1);
    });