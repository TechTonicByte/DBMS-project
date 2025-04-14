const { Sequelize } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  logging: false
});

const db = {
  sequelize,
  Sequelize,
  User: require('./user.model')(sequelize, Sequelize),
  JournalEntry: require('./journal-entry.model')(sequelize, Sequelize),
  MoodAnalysis: require('./mood-analysis.model')(sequelize, Sequelize),
  RecommendedSong: require('./recommended-song.model')(sequelize, Sequelize)
};

// Define associations
db.User.hasMany(db.JournalEntry);
db.JournalEntry.belongsTo(db.User);

db.JournalEntry.hasOne(db.MoodAnalysis);
db.MoodAnalysis.belongsTo(db.JournalEntry);

db.MoodAnalysis.hasMany(db.RecommendedSong);
db.RecommendedSong.belongsTo(db.MoodAnalysis);

db.User.hasMany(db.RecommendedSong);
db.RecommendedSong.belongsTo(db.User);

module.exports = db; 