const axios = require('axios');
const cheerio = require('cheerio');

class MusicRecommendationService {
  constructor() {
    this.moodPlaylists = {
      happy: {
        keywords: ['happy', 'upbeat', 'feel good', 'cheerful'],
        genres: ['pop', 'dance', 'electronic', 'funk']
      },
      sad: {
        keywords: ['sad', 'emotional', 'melancholic', 'heartbreak'],
        genres: ['blues', 'soul', 'acoustic', 'piano']
      },
      angry: {
        keywords: ['angry', 'rage', 'intense', 'powerful'],
        genres: ['rock', 'metal', 'punk', 'hardcore']
      },
      anxious: {
        keywords: ['calming', 'relaxing', 'peaceful', 'soothing'],
        genres: ['ambient', 'meditation', 'nature sounds', 'classical']
      },
      calm: {
        keywords: ['peaceful', 'relaxing', 'gentle', 'tranquil'],
        genres: ['classical', 'instrumental', 'acoustic', 'ambient']
      },
      neutral: {
        keywords: ['background', 'ambient', 'instrumental', 'playlist'],
        genres: ['lofi', 'instrumental', 'background', 'ambient']
      }
    };

    this.sources = {
      youtube: {
        baseUrl: 'https://www.youtube.com',
        searchUrl: 'https://www.youtube.com/results',
        enabled: true
      },
      soundcloud: {
        baseUrl: 'https://soundcloud.com',
        searchUrl: 'https://soundcloud.com/search',
        enabled: true
      },
      vimeo: {
        baseUrl: 'https://vimeo.com',
        searchUrl: 'https://vimeo.com/search',
        enabled: true
      },
      jamendo: {
        baseUrl: 'https://www.jamendo.com',
        searchUrl: 'https://www.jamendo.com/search',
        enabled: true
      }
    };
  }

  generateSearchQueries(mood) {
    const moodData = this.moodPlaylists[mood] || this.moodPlaylists.neutral;
    const queries = [];
    
    // Combine keywords and genres
    moodData.keywords.forEach(keyword => {
      moodData.genres.forEach(genre => {
        queries.push(`${keyword} ${genre} music`);
      });
    });

    return queries;
  }

  async searchYouTube(query, maxResults = 2) {
    try {
      const searchUrl = `${this.sources.youtube.searchUrl}?search_query=${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl);
      const $ = cheerio.load(response.data);
      const videos = [];

      $('div#contents ytd-video-renderer').each((i, elem) => {
        if (videos.length >= maxResults) return false;

        const title = $(elem).find('#video-title').text().trim();
        const link = this.sources.youtube.baseUrl + $(elem).find('#video-title').attr('href');
        const thumbnail = $(elem).find('#img').attr('src');
        const channelName = $(elem).find('#channel-name').text().trim();

        if (title && link && !link.includes('/shorts/')) {
          videos.push({
            title,
            artist: channelName,
            url: link,
            thumbnail,
            source: 'YouTube'
          });
        }
      });

      return videos;
    } catch (error) {
      console.error('YouTube search error:', error);
      return [];
    }
  }

  async searchSoundCloud(query, maxResults = 2) {
    try {
      const searchUrl = `${this.sources.soundcloud.searchUrl}?q=${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl);
      const $ = cheerio.load(response.data);
      const tracks = [];

      $('.searchList__item').each((i, elem) => {
        if (tracks.length >= maxResults) return false;

        const title = $(elem).find('.soundTitle__title').text().trim();
        const artist = $(elem).find('.soundTitle__username').text().trim();
        const url = this.sources.soundcloud.baseUrl + $(elem).find('.soundTitle__title').attr('href');
        const thumbnail = $(elem).find('.image__full').attr('src');

        if (title && url) {
          tracks.push({
            title,
            artist,
            url,
            thumbnail,
            source: 'SoundCloud'
          });
        }
      });

      return tracks;
    } catch (error) {
      console.error('SoundCloud search error:', error);
      return [];
    }
  }

  async searchVimeo(query, maxResults = 2) {
    try {
      const searchUrl = `${this.sources.vimeo.searchUrl}?q=${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl);
      const $ = cheerio.load(response.data);
      const videos = [];

      $('.iris_video-vital').each((i, elem) => {
        if (videos.length >= maxResults) return false;

        const title = $(elem).find('.iris_link-header').text().trim();
        const url = this.sources.vimeo.baseUrl + $(elem).find('.iris_link').attr('href');
        const thumbnail = $(elem).find('.iris_video-vital__thumbnail').attr('src');
        const artist = $(elem).find('.iris_creator-name').text().trim();

        if (title && url) {
          videos.push({
            title,
            artist,
            url,
            thumbnail,
            source: 'Vimeo'
          });
        }
      });

      return videos;
    } catch (error) {
      console.error('Vimeo search error:', error);
      return [];
    }
  }

  async searchJamendo(query, maxResults = 2) {
    try {
      const searchUrl = `${this.sources.jamendo.searchUrl}?q=${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl);
      const $ = cheerio.load(response.data);
      const tracks = [];

      $('.track-item').each((i, elem) => {
        if (tracks.length >= maxResults) return false;

        const title = $(elem).find('.track-title').text().trim();
        const artist = $(elem).find('.track-artist').text().trim();
        const url = this.sources.jamendo.baseUrl + $(elem).find('.track-title').attr('href');
        const thumbnail = $(elem).find('.track-image').attr('src');

        if (title && url) {
          tracks.push({
            title,
            artist,
            url,
            thumbnail,
            source: 'Jamendo'
          });
        }
      });

      return tracks;
    } catch (error) {
      console.error('Jamendo search error:', error);
      return [];
    }
  }

  async searchAllSources(mood, maxResults = 8) {
    try {
      const queries = this.generateSearchQueries(mood);
      const query = queries[Math.floor(Math.random() * queries.length)];
      
      // Search all enabled sources in parallel
      const [youtubeResults, soundcloudResults, vimeoResults, jamendoResults] = await Promise.all([
        this.sources.youtube.enabled ? this.searchYouTube(query, maxResults / 4) : [],
        this.sources.soundcloud.enabled ? this.searchSoundCloud(query, maxResults / 4) : [],
        this.sources.vimeo.enabled ? this.searchVimeo(query, maxResults / 4) : [],
        this.sources.jamendo.enabled ? this.searchJamendo(query, maxResults / 4) : []
      ]);

      // Combine and shuffle results
      const allResults = [
        ...youtubeResults,
        ...soundcloudResults,
        ...vimeoResults,
        ...jamendoResults
      ];

      // Fisher-Yates shuffle
      for (let i = allResults.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allResults[i], allResults[j]] = [allResults[j], allResults[i]];
      }

      // If no results found, return a default recommendation
      if (allResults.length === 0) {
        return [{
          title: `${mood} Music Mix`,
          artist: 'Various Artists',
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
          source: 'Default Playlist'
        }];
      }

      return allResults.map(result => ({
        Song_Title: result.title,
        Artist: result.artist,
        Source_Link: result.url,
        Thumbnail: result.thumbnail,
        Platform: result.source
      }));
    } catch (error) {
      console.error('Music recommendation error:', error);
      return [{
        Song_Title: 'Recommended Mix',
        Artist: 'Various Artists',
        Source_Link: 'https://www.youtube.com/results?search_query=music',
        Platform: 'Default'
      }];
    }
  }

  // Main method to get recommendations
  async getRecommendations(mood, maxResults = 8) {
    return this.searchAllSources(mood, maxResults);
  }

  async getVideoDetails(url) {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      return {
        title: $('meta[property="og:title"]').attr('content'),
        description: $('meta[property="og:description"]').attr('content'),
        thumbnail: $('meta[property="og:image"]').attr('content'),
        type: $('meta[property="og:type"]').attr('content')
      };
    } catch (error) {
      console.error('Video details error:', error);
      return null;
    }
  }
}

module.exports = new MusicRecommendationService(); 