const natural = require('natural');
const aposToLexForm = require('apos-to-lex-form');
const SpellCorrector = require('spelling-corrector');
const SW = require('stopword');

class EmotionDetectionService {
  constructor() {
    this.spellCorrector = new SpellCorrector();
    this.spellCorrector.loadDictionary();
    this.analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    
    // Extended emotion keywords and their weights
    this.emotionPatterns = {
      happy: {
        keywords: ['happy', 'joy', 'excited', 'great', 'wonderful', 'fantastic', 'delighted', 'blessed', 'smile', 'laugh'],
        phrases: ['feeling good', 'had a great', 'really happy', 'made my day'],
        weight: 1.2
      },
      sad: {
        keywords: ['sad', 'depressed', 'unhappy', 'miserable', 'hurt', 'disappointed', 'lonely', 'grief', 'cry', 'tears'],
        phrases: ['feeling down', 'really sad', 'miss them', 'heart hurts'],
        weight: 1.0
      },
      angry: {
        keywords: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'rage', 'hate', 'upset', 'bitter'],
        phrases: ['makes me mad', 'so angry', 'hate when', 'really annoyed'],
        weight: 1.1
      },
      anxious: {
        keywords: ['anxious', 'worried', 'nervous', 'stressed', 'tense', 'uneasy', 'afraid', 'panic', 'fear', 'dread'],
        phrases: ['feeling anxious', 'so worried', 'stress out', 'scared of'],
        weight: 1.0
      },
      calm: {
        keywords: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'content', 'quiet', 'gentle', 'ease', 'steady'],
        phrases: ['feeling peaceful', 'at ease', 'very calm', 'relaxing day'],
        weight: 0.9
      },
      neutral: {
        keywords: ['okay', 'fine', 'normal', 'average', 'regular', 'usual', 'standard', 'typical', 'common', 'ordinary'],
        phrases: ['just okay', 'normal day', 'nothing special', 'as usual'],
        weight: 0.8
      }
    };
  }

  preprocessText(text) {
    // Convert contractions to standard lexicon
    const lexedText = aposToLexForm(text);
    
    // Convert to lowercase
    const casedText = lexedText.toLowerCase();
    
    // Remove special characters and numbers
    const alphaOnlyText = casedText.replace(/[^a-zA-Z\s]+/g, ' ');
    
    // Tokenize the text
    const tokens = this.tokenizer.tokenize(alphaOnlyText);
    
    // Remove stopwords
    const filteredTokens = SW.removeStopwords(tokens);
    
    // Stem and correct spelling
    return filteredTokens.map(word => {
      const corrected = this.spellCorrector.correct(word);
      return this.stemmer.stem(corrected);
    });
  }

  detectEmotions(text, processedWords) {
    const emotionScores = {
      happy: 0,
      sad: 0,
      angry: 0,
      anxious: 0,
      calm: 0,
      neutral: 0
    };

    // Check for keywords (using stemmed words)
    processedWords.forEach(word => {
      for (const [emotion, patterns] of Object.entries(this.emotionPatterns)) {
        const stemmedKeywords = patterns.keywords.map(k => this.stemmer.stem(k));
        if (stemmedKeywords.includes(word)) {
          emotionScores[emotion] += patterns.weight;
        }
      }
    });

    // Check for phrases
    const lowercaseText = text.toLowerCase();
    for (const [emotion, patterns] of Object.entries(this.emotionPatterns)) {
      patterns.phrases.forEach(phrase => {
        if (lowercaseText.includes(phrase)) {
          emotionScores[emotion] += patterns.weight * 1.5; // Phrases have higher weight
        }
      });
    }

    return emotionScores;
  }

  async analyzeEmotion(text) {
    try {
      // Preprocess the text
      const processedWords = this.preprocessText(text);
      
      // Get base sentiment score (-5 to 5 scale)
      const sentimentScore = this.analyzer.getSentiment(processedWords);
      
      // Get emotion scores
      const emotionScores = this.detectEmotions(text, processedWords);
      
      // Apply sentiment influence
      if (sentimentScore > 0.3) {
        emotionScores.happy += Math.abs(sentimentScore) * 0.5;
        emotionScores.calm += Math.abs(sentimentScore) * 0.3;
      } else if (sentimentScore < -0.3) {
        emotionScores.sad += Math.abs(sentimentScore) * 0.5;
        emotionScores.angry += Math.abs(sentimentScore) * 0.3;
      }
      
      // Determine primary emotion
      let primaryEmotion = 'neutral';
      let maxScore = 0;
      
      for (const [emotion, score] of Object.entries(emotionScores)) {
        if (score > maxScore) {
          maxScore = score;
          primaryEmotion = emotion;
        }
      }

      // Calculate confidence score (0 to 1)
      const confidence = Math.min(
        Math.max(
          (maxScore / (processedWords.length + 1)) + Math.abs(sentimentScore) / 5,
          0
        ),
        1
      );

      return {
        mood: primaryEmotion,
        confidence: confidence,
        sentiment: sentimentScore > 0 ? 'positive' : sentimentScore < 0 ? 'negative' : 'neutral',
        details: {
          sentimentScore,
          emotionScores,
          wordCount: processedWords.length
        }
      };
    } catch (error) {
      console.error('Emotion detection error:', error);
      throw new Error('Failed to analyze emotion');
    }
  }
}

module.exports = new EmotionDetectionService(); 
module.exports = new EmotionDetectionService(); 