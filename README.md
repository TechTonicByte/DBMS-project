# Mood Journal with Music Recommendations

A smart journal application that analyzes your emotions and recommends music based on your mood. Built with Node.js, Express, and MySQL.

## Features

- 🔒 Secure user authentication with JWT
- 📝 Journal entry creation and management
- 🎭 Advanced emotion detection using Natural Language Processing
- 🎵 Multi-source music recommendations from:
  - YouTube
  - SoundCloud
  - Vimeo
  - Jamendo
- 📊 Mood analysis and tracking
- ⭐ Song rating and feedback system
- 🔍 Advanced filtering and search capabilities

## Tech Stack

- Backend: Node.js with Express
- Database: MySQL with Sequelize ORM
- Authentication: JWT (JSON Web Tokens)
- Natural Language Processing: Natural.js
- Web Scraping: Cheerio & Axios

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mood-journal.git
cd mood-journal
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=3000

# Database Configuration
DB_NAME=mood_journal
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Node Environment
NODE_ENV=development
```

4. Create the database:
```sql
CREATE DATABASE mood_journal;
```

5. Start the server:
```bash
npm run dev
```

## API Documentation

### Authentication Endpoints

- POST `/api/auth/signup` - Create new user account
- POST `/api/auth/login` - Login to existing account

### Journal Endpoints

- POST `/api/journal` - Create new journal entry
- GET `/api/journal` - Get all journal entries
- GET `/api/journal/:id` - Get specific journal entry
- DELETE `/api/journal/:id` - Delete journal entry

### Music Recommendation Endpoints

- GET `/api/songs/recommendations/:analysisId` - Get song recommendations for mood
- GET `/api/songs/my-recommendations` - Get user's recommendation history
- GET `/api/songs/platforms` - Get available music platforms
- POST `/api/songs/:songId/rate` - Rate a recommended song

## Features in Detail

### Emotion Detection

The system uses advanced NLP techniques to analyze emotions in journal entries:
- Sentiment analysis
- Keyword detection
- Phrase matching
- Context understanding

### Music Recommendations

Multi-source music recommendations based on:
- Detected mood
- Genre preferences
- Platform diversity
- User feedback

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 