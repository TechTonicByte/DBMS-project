const { google } = require('googleapis');
const youtube = google.youtube('v3');

class YouTubeMusicService {
  constructor() {
    this.youtube = youtube;
    this.apiKey = process.env.YOUTUBE_API_KEY;
  }

  // Mood to music genre/keyword mapping
  getMoodKeywords(mood) {
    const moodMap = {
      'happy': ['upbeat music', 'happy songs', 'feel good music'],
      'excited': ['energetic music', 'party songs', 'uplifting music'],
      'content': ['relaxing music', 'peaceful songs', 'chill music'],
      'sad': ['melancholic music', 'sad songs', 'emotional music'],
      'angry': ['intense music', 'rock music', 'powerful songs'],
      'anxious': ['calming music', 'meditation music', 'soothing songs'],
      'neutral': ['ambient music', 'background music', 'instrumental'],
      'calm': ['soft music', 'calm songs', 'peaceful music']
    };

    return moodMap[mood] || ['background music'];
  }

  async searchSongs(mood, maxResults = 5) {
    try {
      const keywords = this.getMoodKeywords(mood);
      const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];

      const response = await this.youtube.search.list({
        part: ['snippet'],
        q: randomKeyword,
        type: ['video'],
        videoCategoryId: '10', // Music category
        maxResults: maxResults,
        key: this.apiKey
      });

      return response.data.items.map(item => ({
        Song_Title: item.snippet.title,
        Artist: item.snippet.channelTitle,
        Source_Link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        Thumbnail: item.snippet.thumbnails.default.url,
        Description: item.snippet.description
      }));
    } catch (error) {
      console.error('YouTube API error:', error);
      throw new Error('Failed to fetch music recommendations');
    }
  }

  async getVideoDetails(videoId) {
    try {
      const response = await this.youtube.videos.list({
        part: ['snippet', 'contentDetails', 'statistics'],
        id: [videoId],
        key: this.apiKey
      });

      if (response.data.items.length === 0) {
        throw new Error('Video not found');
      }

      const video = response.data.items[0];
      return {
        title: video.snippet.title,
        artist: video.snippet.channelTitle,
        duration: video.contentDetails.duration,
        viewCount: video.statistics.viewCount,
        likeCount: video.statistics.likeCount
      };
    } catch (error) {
      console.error('YouTube API error:', error);
      throw new Error('Failed to fetch video details');
    }
  }
}

module.exports = new YouTubeMusicService(); 