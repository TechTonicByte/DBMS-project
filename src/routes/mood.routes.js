const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const { MoodAnalysis, JournalEntry } = require('../models');
const { Op } = require('sequelize');

// Get mood analysis for a specific journal entry
router.get('/analysis/:entryId', auth, async (req, res) => {
  try {
    const analysis = await MoodAnalysis.findOne({
      where: { Entry_ID: req.params.entryId },
      include: [{
        model: JournalEntry,
        where: { User_ID: req.user.User_ID },
        attributes: ['Entry_Date', 'Entry_Text']
      }]
    });

    if (!analysis) {
      return res.status(404).json({ message: 'Mood analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Get mood analysis error:', error);
    res.status(500).json({ message: 'Error retrieving mood analysis' });
  }
});

// Get mood trends for the user
router.get('/trends', auth, async (req, res) => {
  try {
    const { timeframe } = req.query; // 'week', 'month', 'year'
    let startDate = new Date();
    
    switch(timeframe) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30); // default to last 30 days
    }

    const analyses = await MoodAnalysis.findAll({
      include: [{
        model: JournalEntry,
        where: {
          User_ID: req.user.User_ID,
          Entry_Date: {
            [Op.gte]: startDate
          }
        },
        attributes: ['Entry_Date']
      }],
      order: [[JournalEntry, 'Entry_Date', 'ASC']]
    });

    res.json(analyses);
  } catch (error) {
    console.error('Get mood trends error:', error);
    res.status(500).json({ message: 'Error retrieving mood trends' });
  }
});

module.exports = router; 