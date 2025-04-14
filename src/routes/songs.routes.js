const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const { RecommendedSong, MoodAnalysis } = require('../models');
const musicService = require('../services/music-recommendation.service');
const { UserFeedback } = require('../models');
const sequelize = require('sequelize');

// Get recommended songs for a specific mood analysis
router.get('/recommendations/:analysisId', auth, async (req, res) => {
  try {
    // Get the mood analysis
    const analysis = await MoodAnalysis.findOne({
      where: {
        Analysis_ID: req.params.analysisId
      }
    });

    if (!analysis) {
      return res.status(404).json({ message: 'Mood analysis not found' });
    }

    // Get recommendations from multiple sources
    const recommendations = await musicService.getRecommendations(analysis.Detected_Mood, 8);

    // Save recommendations to database
    const savedSongs = await Promise.all(
      recommendations.map(song => 
        RecommendedSong.create({
          Analysis_ID: analysis.Analysis_ID,
          User_ID: req.user.User_ID,
          Song_Title: song.Song_Title,
          Artist: song.Artist,
          Source_Link: song.Source_Link,
          Thumbnail: song.Thumbnail,
          Platform: song.Platform
        })
      )
    );

    res.json({
      mood: analysis.Detected_Mood,
      confidence: analysis.Confidence_Score,
      recommendations: savedSongs
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Error retrieving recommendations' });
  }
});

// Get all songs recommended to a user with source filters
router.get('/my-recommendations', auth, async (req, res) => {
  try {
    const { platform, mood } = req.query;
    const where = { User_ID: req.user.User_ID };

    // Add platform filter if specified
    if (platform) {
      where.Platform = platform;
    }

    // Get recommendations with optional mood filter
    const songs = await RecommendedSong.findAll({
      where,
      include: [{
        model: MoodAnalysis,
        where: mood ? { Detected_Mood: mood } : undefined,
        attributes: ['Detected_Mood', 'Confidence_Score']
      }],
      order: [['createdAt', 'DESC']]
    });

    // Group recommendations by platform
    const groupedSongs = songs.reduce((acc, song) => {
      const platform = song.Platform;
      if (!acc[platform]) {
        acc[platform] = [];
      }
      acc[platform].push(song);
      return acc;
    }, {});

    res.json({
      total: songs.length,
      by_platform: groupedSongs
    });
  } catch (error) {
    console.error('Get user recommendations error:', error);
    res.status(500).json({ message: 'Error retrieving recommendations' });
  }
});

// Get available music platforms
router.get('/platforms', auth, async (req, res) => {
  try {
    const platforms = await RecommendedSong.findAll({
      attributes: [
        'Platform',
        [sequelize.fn('COUNT', sequelize.col('Song_ID')), 'song_count']
      ],
      group: ['Platform'],
      where: { User_ID: req.user.User_ID }
    });

    res.json(platforms);
  } catch (error) {
    console.error('Get platforms error:', error);
    res.status(500).json({ message: 'Error retrieving platforms' });
  }
});

// Rate a recommended song
router.post('/:songId/rate', auth, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const song = await RecommendedSong.findOne({
      where: {
        Song_ID: req.params.songId,
        User_ID: req.user.User_ID
      }
    });

    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Create feedback entry
    await UserFeedback.create({
      User_ID: req.user.User_ID,
      Song_ID: song.Song_ID,
      Rating: rating,
      Comments: feedback
    });

    res.json({ message: 'Rating saved successfully' });
  } catch (error) {
    console.error('Rate song error:', error);
    res.status(500).json({ message: 'Error saving rating' });
  }
});

module.exports = router; 