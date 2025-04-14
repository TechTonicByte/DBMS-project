# Mood Journal API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All API routes (except login and signup) require a JWT token in the Authorization header:
```
Authorization: Bearer <your_token>
```

### Authentication Endpoints

#### 1. Sign Up
```
POST /auth/signup
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "password": "string"
}

Response:
{
  "message": "User created successfully",
  "token": "jwt_token",
  "user": {
    "id": number,
    "name": "string",
    "email": "string"
  }
}
```

#### 2. Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}

Response:
{
  "message": "Login successful",
  "token": "jwt_token",
  "user": {
    "id": number,
    "name": "string",
    "email": "string"
  }
}
```

### Journal Endpoints

#### 1. Create Journal Entry
```
POST /journal
Content-Type: application/json

{
  "entry_text": "string"
}

Response:
{
  "message": "Journal entry created successfully",
  "entry": {
    "Entry_ID": number,
    "Entry_Text": "string",
    "Entry_Date": "datetime",
    "Sentiment_Score": number,
    "Mood": "string"
  }
}
```

#### 2. Get All Journal Entries
```
GET /journal

Response:
[
  {
    "Entry_ID": number,
    "Entry_Text": "string",
    "Entry_Date": "datetime",
    "Sentiment_Score": number,
    "Mood": "string",
    "MoodAnalysis": {
      "Detected_Mood": "string",
      "Confidence_Score": number
    }
  }
]
```

#### 3. Get Single Journal Entry
```
GET /journal/:id

Response:
{
  "Entry_ID": number,
  "Entry_Text": "string",
  "Entry_Date": "datetime",
  "Sentiment_Score": number,
  "Mood": "string",
  "MoodAnalysis": {
    "Detected_Mood": "string",
    "Confidence_Score": number
  }
}
```

### Mood Analysis Endpoints

#### 1. Get Mood Analysis for Entry
```
GET /mood/analysis/:entryId

Response:
{
  "Analysis_ID": number,
  "Detected_Mood": "string",
  "Confidence_Score": number,
  "JournalEntry": {
    "Entry_Date": "datetime",
    "Entry_Text": "string"
  }
}
```

#### 2. Get Mood Trends
```
GET /mood/trends?timeframe=week|month|year

Response:
[
  {
    "Analysis_ID": number,
    "Detected_Mood": "string",
    "Confidence_Score": number,
    "JournalEntry": {
      "Entry_Date": "datetime"
    }
  }
]
```

### Song Recommendations Endpoints

#### 1. Get Recommendations for Mood Analysis
```
GET /songs/recommendations/:analysisId

Response:
[
  {
    "Song_ID": number,
    "Song_Title": "string",
    "Artist": "string",
    "Genre": "string",
    "Source_Link": "string"
  }
]
```

#### 2. Get All User Recommendations
```
GET /songs/my-recommendations

Response:
[
  {
    "Song_ID": number,
    "Song_Title": "string",
    "Artist": "string",
    "Genre": "string",
    "Source_Link": "string",
    "MoodAnalysis": {
      "Detected_Mood": "string",
      "Confidence_Score": number
    }
  }
]
```

#### 3. Rate a Song
```
POST /songs/:songId/rate
Content-Type: application/json

{
  "rating": number (1-5),
  "feedback": "string"
}

Response:
{
  "message": "Rating saved successfully"
}
```

## Error Responses
All endpoints may return the following error responses:

```
400 Bad Request
{
  "message": "Error message",
  "errors": [
    {
      "msg": "Error details",
      "param": "field_name",
      "location": "body"
    }
  ]
}

401 Unauthorized
{
  "message": "No token, authorization denied"
}

404 Not Found
{
  "message": "Resource not found"
}

500 Internal Server Error
{
  "message": "Something went wrong!"
}
```

## Frontend Integration Example

Here's a basic example of how to make API calls from the frontend:

```javascript
// Example using fetch API
const API_URL = 'http://localhost:3000/api';

// Login function
async function login(email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    
    // Store token in localStorage
    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Create journal entry
async function createJournalEntry(entryText) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/journal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ entry_text: entryText })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    
    return data;
  } catch (error) {
    console.error('Create entry error:', error);
    throw error;
  }
}
``` 