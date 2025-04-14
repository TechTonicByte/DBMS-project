const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth.middleware');
const { JournalEntry, MoodAnalysis, RecommendedSong } = require('../models');
const emotionService = require('../services/emotion-detection.service');
const youtubeService = require('../services/youtube-music.service');

// Validation middleware
const validateJournalEntry = [
  body('entry_text').trim().notEmpty().withMessage('Journal entry text is required')
];

// Create journal entry with emotion analysis and song recommendations
router.post('/', auth, validateJournalEntry, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { entry_text } = req.body;

    // Create journal entry
    const entry = await JournalEntry.create({
      User_ID: req.user.User_ID,
      Entry_Text: entry_text
    });

    // Analyze emotion
    const emotionAnalysis = await emotionService.analyzeEmotion(entry_text);

    // Create mood analysis
    const moodAnalysis = await MoodAnalysis.create({
      Entry_ID: entry.Entry_ID,
      Detected_Mood: emotionAnalysis.mood,
      Confidence_Score: emotionAnalysis.confidence
    });

    // Get song recommendations based on mood
    const songRecommendations = await youtubeService.searchSongs(emotionAnalysis.mood);

    // Save song recommendations
    const savedSongs = await Promise.all(
      songRecommendations.map(song => 
        RecommendedSong.create({
          Analysis_ID: moodAnalysis.Analysis_ID,
          User_ID: req.user.User_ID,
          Song_Title: song.Song_Title,
          Artist: song.Artist,
          Source_Link: song.Source_Link,
          Genre: 'YouTube Music' // Default genre
        })
      )
    );

    res.status(201).json({
      message: 'Journal entry created successfully',
      entry,
      mood_analysis: {
        mood: emotionAnalysis.mood,
        confidence: emotionAnalysis.confidence
      },
      recommendations: savedSongs
    });
  } catch (error) {
    console.error('Create journal entry error:', error);
    res.status(500).json({ message: 'Error creating journal entry' });
  }
});

// Get all journal entries with mood analysis and recommendations
router.get('/', auth, async (req, res) => {
  try {
    const entries = await JournalEntry.findAll({
      where: { User_ID: req.user.User_ID },
      include: [{
        model: MoodAnalysis,
        include: [{
          model: RecommendedSong
        }]
      }],
      order: [['Entry_Date', 'DESC']]
    });

    res.json(entries);
  } catch (error) {
    console.error('Get journal entries error:', error);
    res.status(500).json({ message: 'Error retrieving journal entries' });
  }
});

// Get single journal entry with mood analysis and recommendations
router.get('/:id', auth, async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      where: {
        Entry_ID: req.params.id,
        User_ID: req.user.User_ID
      },
      include: [{
        model: MoodAnalysis,
        include: [{
          model: RecommendedSong
        }]
      }]
    });

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Get journal entry error:', error);
    res.status(500).json({ message: 'Error retrieving journal entry' });
  }
});

// Delete journal entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      where: {
        Entry_ID: req.params.id,
        User_ID: req.user.User_ID
      }
    });

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    await entry.destroy();

    res.json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    console.error('Delete journal entry error:', error);
    res.status(500).json({ message: 'Error deleting journal entry' });
  }
});

module.exports = router; 