-- Create User table
CREATE TABLE User (
    User_ID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Preferences TEXT
);

-- Create Journal_Entry table
CREATE TABLE Journal_Entry (
    Entry_ID INT PRIMARY KEY AUTO_INCREMENT,
    User_ID INT,
    Entry_Text TEXT NOT NULL,
    Entry_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Sentiment_Score FLOAT,
    Mood VARCHAR(50),
    FOREIGN KEY (User_ID) REFERENCES User(User_ID)
);

-- Create Mood_Analysis table
CREATE TABLE Mood_Analysis (
    Analysis_ID INT PRIMARY KEY AUTO_INCREMENT,
    Entry_ID INT,
    Detected_Mood VARCHAR(50) NOT NULL,
    Confidence_Score FLOAT NOT NULL,
    FOREIGN KEY (Entry_ID) REFERENCES Journal_Entry(Entry_ID)
);

-- Create Recommended_Song table
CREATE TABLE Recommended_Song (
    Song_ID INT PRIMARY KEY AUTO_INCREMENT,
    Analysis_ID INT,
    User_ID INT,
    Song_Title VARCHAR(255) NOT NULL,
    Artist VARCHAR(255) NOT NULL,
    Genre VARCHAR(100),
    Source_Link TEXT NOT NULL,
    FOREIGN KEY (Analysis_ID) REFERENCES Mood_Analysis(Analysis_ID),
    FOREIGN KEY (User_ID) REFERENCES User(User_ID)
);

-- Create Music_API table
CREATE TABLE Music_API (
    API_ID INT PRIMARY KEY AUTO_INCREMENT,
    Provider_Name VARCHAR(100) NOT NULL,
    Base_URL TEXT NOT NULL
);

-- Create User_Feedback table
CREATE TABLE User_Feedback (
    Feedback_ID INT PRIMARY KEY AUTO_INCREMENT,
    User_ID INT,
    Song_ID INT,
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    Comments TEXT,
    FOREIGN KEY (User_ID) REFERENCES User(User_ID),
    FOREIGN KEY (Song_ID) REFERENCES Recommended_Song(Song_ID)
); 