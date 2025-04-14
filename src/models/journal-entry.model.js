module.exports = (sequelize, DataTypes) => {
  const JournalEntry = sequelize.define('JournalEntry', {
    Entry_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    User_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'User_ID'
      }
    },
    Entry_Text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    Entry_Date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    Sentiment_Score: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    Mood: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  });

  return JournalEntry;
}; 