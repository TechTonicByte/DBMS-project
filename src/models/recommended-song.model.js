module.exports = (sequelize, DataTypes) => {
  const RecommendedSong = sequelize.define('RecommendedSong', {
    Song_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Analysis_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'MoodAnalyses',
        key: 'Analysis_ID'
      }
    },
    User_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'User_ID'
      }
    },
    Song_Title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Artist: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Genre: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Source_Link: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  });

  return RecommendedSong;
}; 