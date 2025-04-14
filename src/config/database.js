require('dotenv').config();

module.exports = {
  database: process.env.DB_NAME || 'mood_journal',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
}; 