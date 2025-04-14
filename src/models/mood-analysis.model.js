module.exports = (sequelize, DataTypes) => {
  const MoodAnalysis = sequelize.define('MoodAnalysis', {
    Analysis_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Entry_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'JournalEntries',
        key: 'Entry_ID'
      }
    },
    Detected_Mood: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    Confidence_Score: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  });

  return MoodAnalysis;
}; 