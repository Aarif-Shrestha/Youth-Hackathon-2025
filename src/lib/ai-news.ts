// Shared utilities for AI news operations
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import axios, { AxiosError } from 'axios';

// Common interfaces
export interface AINews {
  id: number;
  title: string;
  description: string;
  impact: 'positive' | 'negative';
  category: string;
  accuracy: number;
  sources: number;
}

export interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  readTime: string;
  views: number;
  category: string;
  status: string;
}

// API Configuration
const API_CONFIG = {
  NEWSAPI: {
    BASE_URL: 'https://newsapi.org/v2',
    TIMEOUT: 15000, // Increased from 10 to 15 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 2000, // Increased from 1 to 2 seconds
  },
  GEMINI: {
    TIMEOUT: 45000, // Increased from 30 to 45 seconds for LLM calls
    RETRY_ATTEMPTS: 2,
    RETRY_DELAY: 3000, // Increased from 2 to 3 seconds
  }
};

// Enhanced error types
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Cache configuration
const CACHE_CONFIG = {
  NEWS_CACHE_KEY: 'ai_news_cache',
  DISPLAY_CACHE_KEY: 'ai_news_display_cache',
  CACHE_DURATION: 30 * 60 * 1000, // 30 minutes in milliseconds
};

// Cache management functions
const getCachedData = (key: string) => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is expired
    if (now - parsed.timestamp > CACHE_CONFIG.CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.warn('Failed to read from cache:', error);
    return null;
  }
};

const setCachedData = <T>(key: string, data: T) => {
  try {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cacheEntry));
  } catch (error) {
    console.warn('Failed to write to cache:', error);
  }
};

const clearCache = (key?: string) => {
  try {
    if (key) {
      localStorage.removeItem(key);
    } else {
      // Clear all AI news caches
      localStorage.removeItem(CACHE_CONFIG.NEWS_CACHE_KEY);
      localStorage.removeItem(CACHE_CONFIG.DISPLAY_CACHE_KEY);
    }
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
};

const getCacheInfo = (key: string) => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    const now = Date.now();
    const age = now - parsed.timestamp;
    const isExpired = age > CACHE_CONFIG.CACHE_DURATION;

    return {
      age,
      isExpired,
      expiresIn: isExpired ? 0 : CACHE_CONFIG.CACHE_DURATION - age,
      itemCount: Array.isArray(parsed.data) ? parsed.data.length : 0,
    };
  } catch (error) {
    console.warn('Failed to get cache info:', error);
    return null;
  }
};

// Exported cache management functions
export const clearAINewsCache = () => clearCache();
export const clearSurveyCache = () => clearCache(CACHE_CONFIG.NEWS_CACHE_KEY);
export const clearDisplayCache = () => clearCache(CACHE_CONFIG.DISPLAY_CACHE_KEY);
export const getCacheStatus = () => ({
  survey: getCacheInfo(CACHE_CONFIG.NEWS_CACHE_KEY),
  display: getCacheInfo(CACHE_CONFIG.DISPLAY_CACHE_KEY),
});

// Internet connectivity test
const testInternetConnectivity = async (): Promise<boolean> => {
  try {
    // Try to reach a reliable endpoint
    await axios.get('https://httpbin.org/status/200', { timeout: 3000 });
    return true;
  } catch (error) {
    console.warn('Internet connectivity test failed:', error);
    return false;
  }
};

// Enhanced error handling for network issues
const handleNetworkError = (error: unknown, context: string): APIError => {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return new APIError(
        `${context} request timed out. Please check your internet connection.`,
        undefined,
        'timeout'
      );
    }
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return new APIError(
        `${context} could not connect. Please check your internet connection and DNS settings.`,
        undefined,
        'connection'
      );
    }
    if (error.response?.status === 429) {
      return new APIError(
        `${context} rate limit exceeded. Please try again later.`,
        429,
        'rate-limit'
      );
    }
    if (error.response?.status === 500 || error.response?.status === 502 || error.response?.status === 503) {
      return new APIError(
        `${context} service temporarily unavailable. Please try again later.`,
        error.response.status,
        'service-unavailable'
      );
    }
  }

  // Return original error if it's already an APIError
  if (error instanceof APIError) {
    return error;
  }

  // Generic error
  return new APIError(
    `${context} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    undefined,
    'unknown',
    error
  );
};

// Connection validation function
const validateConnection = async (url: string, service: string): Promise<boolean> => {
  try {
    // Try a simple HEAD request to check connectivity
    await axios.head(url, { timeout: 5000 });
    return true;
  } catch (error) {
    console.warn(`${service} connectivity check failed:`, error);
    return false;
  }
};

// Enhanced retry logic with connection validation
const withRetry = async <T>(
  operation: () => Promise<T>,
  attempts: number,
  delay: number,
  context: string
): Promise<T> => {
  let lastError: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      // Validate connection before attempting the operation
      if (context.includes('NewsAPI') && i === 0) {
        const isConnected = await validateConnection(API_CONFIG.NEWSAPI.BASE_URL, 'NewsAPI');
        if (!isConnected) {
          throw new APIError('No internet connection or NewsAPI is unreachable', undefined, 'connectivity');
        }
      }

      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`${context} - Attempt ${i + 1}/${attempts} failed:`, error);

      if (i < attempts - 1) {
        // Exponential backoff with jitter
        const jitter = Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1) + jitter));
      }
    }
  }

  throw new APIError(
    `${context} failed after ${attempts} attempts`,
    undefined,
    undefined,
    lastError
  );
};

// Validate API key format
const validateApiKey = (key: string, service: string): void => {
  if (!key || typeof key !== 'string') {
    throw new ValidationError(`${service} API key is missing or invalid`);
  }

  if (key.trim().length === 0) {
    throw new ValidationError(`${service} API key is empty`);
  }

  // Basic format validation
  if (service === 'NewsAPI' && !key.match(/^[a-f0-9]{32}$/)) {
    console.warn('NewsAPI key format looks unusual. Please verify it\'s correct.');
  }

  if (service === 'Gemini' && !key.startsWith('AIzaSy')) {
    console.warn('Gemini API key format looks unusual. Please verify it\'s correct.');
  }
};

// Create Gemini LLM instance with enhanced error handling
const createLLM = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  try {
    validateApiKey(apiKey!, 'Gemini');

    return new ChatGoogleGenerativeAI({
      apiKey,
      model: 'gemini-1.5-flash',
      temperature: 0.3,
      maxRetries: API_CONFIG.GEMINI.RETRY_ATTEMPTS,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new APIError(
      'Failed to initialize Gemini LLM',
      undefined,
      'gemini',
      error
    );
  }
};

// NewsAPI response interfaces
interface NewsApiArticle {
  title?: string;
  description?: string;
  content?: string;
  [key: string]: unknown;
}

interface NewsApiResponse {
  status: string;
  articles: NewsApiArticle[];
  [key: string]: unknown;
}

// Validate NewsAPI response structure
const validateNewsApiResponse = (data: unknown): void => {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('NewsAPI response is empty or invalid');
  }

  const response = data as NewsApiResponse;

  if (response.status !== 'ok') {
    throw new APIError(
      `NewsAPI returned status: ${response.status}`,
      undefined,
      'newsapi',
      data
    );
  }

  if (!Array.isArray(response.articles)) {
    throw new ValidationError('NewsAPI response missing articles array');
  }

  if (response.articles.length === 0) {
    console.warn('NewsAPI returned no articles');
  }
};

// Validate article data
const validateArticle = (article: unknown, index: number): void => {
  if (!article || typeof article !== 'object') {
    throw new ValidationError(`Article at index ${index} is null or undefined`);
  }

  const art = article as NewsApiArticle;

  if (!art.title || typeof art.title !== 'string') {
    throw new ValidationError(`Article ${index} missing valid title`);
  }

  // Description or content should exist
  if (!art.description && !art.content) {
    console.warn(`Article ${index} (${art.title}) has no description or content`);
  }
};

// Interfaces for classification results
interface SurveyClassification {
  impact: 'positive' | 'negative';
  category: string;
  accuracy: number;
  sources: number;
}

interface DisplayClassification {
  category: string;
  status: string;
}

// Enhanced news classification with better error handling
const classifyNewsWithRetry = async (
  title: string,
  description: string,
  promptTemplate: string,
  context: string
): Promise<unknown> => {
  return withRetry(
    async () => {
      const llm = createLLM();

      const prompt = new PromptTemplate({
        template: promptTemplate,
        inputVariables: ['title', 'description'],
      });

      const chain = RunnableSequence.from([
        prompt,
        llm,
        (output: unknown) => {
          let content: string;

          if (output && typeof output === 'object') {
            const objOutput = output as Record<string, unknown>;
            content = (objOutput.content as string) ||
                     (objOutput.text as string) ||
                     String(output);
          } else {
            content = String(output);
          }

          if (!content) {
            throw new APIError('Empty response from Gemini API', undefined, 'gemini');
          }
          return content;
        }
      ]);

      const result = await chain.invoke({ title, description });

      try {
        return JSON.parse(result);
      } catch (parseError) {
        throw new APIError(
          'Failed to parse Gemini response as JSON',
          undefined,
          'gemini',
          { result, parseError }
        );
      }
    },
    API_CONFIG.GEMINI.RETRY_ATTEMPTS,
    API_CONFIG.GEMINI.RETRY_DELAY,
    context
  );
};

// Enhanced description generation for incomplete articles
const generateEnhancedDescription = async (title: string, partialDescription: string): Promise<string> => {
  try {
    const llm = createLLM();

    const prompt = new PromptTemplate({
      template: `Given this AI news article title: "{title}" and partial description: "{description}", generate a comprehensive 2-3 sentence description that explains the AI development and its potential impact on society. Focus on the implications and effects of this AI technology. Make it informative and suitable for a survey about AI impact assessment.`,
      inputVariables: ['title', 'description'],
    });

    const chain = RunnableSequence.from([
      prompt,
      llm,
      (output: unknown) => {
        let content: string;

        if (output && typeof output === 'object') {
          const objOutput = output as Record<string, unknown>;
          content = (objOutput.content as string) ||
                   (objOutput.text as string) ||
                   String(output);
        } else {
          content = String(output);
        }

        return content || partialDescription;
      }
    ]);

    const result = await chain.invoke({ title, description: partialDescription });
    return result;
  } catch (error) {
    console.warn('Failed to generate enhanced description:', error);
    
    // Check if it's a quota exceeded error
    if (error instanceof APIError && 
        (error.message.includes('quota') || error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED'))) {
      console.warn('Gemini API quota exceeded - using basic description enhancement');
    }
    
    // Return enhanced fallback description
    return `${partialDescription || 'AI technology development'}. This advancement in artificial intelligence has significant implications for various sectors and society as a whole, potentially affecting employment, ethics, and technological progress.`;
  }
};

// Fallback classification when AI is unavailable (quota exceeded, etc.)
const fallbackClassification = (title: string, description: string): SurveyClassification => {
  // Simple keyword-based classification as fallback
  const text = `${title} ${description}`.toLowerCase();
  
  let category = 'General';
  let impact: 'positive' | 'negative' = 'positive';
  
  // Determine category based on keywords
  if (text.includes('health') || text.includes('medical') || text.includes('healthcare')) {
    category = 'Healthcare';
  } else if (text.includes('job') || text.includes('employment') || text.includes('work')) {
    category = 'Employment';
  } else if (text.includes('education') || text.includes('school') || text.includes('learning')) {
    category = 'Education';
  } else if (text.includes('privacy') || text.includes('data') || text.includes('security')) {
    category = 'Privacy';
  } else if (text.includes('environment') || text.includes('climate') || text.includes('sustainable')) {
    category = 'Environment';
  } else if (text.includes('bias') || text.includes('fair') || text.includes('justice')) {
    category = 'Social Justice';
  }
  
  // Determine impact based on keywords
  if (text.includes('risk') || text.includes('concern') || text.includes('problem') || text.includes('issue')) {
    impact = 'negative';
  } else if (text.includes('benefit') || text.includes('improvement') || text.includes('advancement') || text.includes('solution')) {
    impact = 'positive';
  }
  
  return {
    impact,
    category,
    accuracy: 70 + Math.floor(Math.random() * 15), // 70-85% accuracy
    sources: 3 + Math.floor(Math.random() * 15), // 3-18 sources
  };
};

// Shared news classification for surveys and dashboard
export const classifyNewsForSurvey = async (title: string, description: string): Promise<SurveyClassification> => {
  const promptTemplate = `Analyze this AI news article and classify it. Title: {title}. Description: {description}. Respond in JSON format with: impact ('positive' or 'negative'), category (e.g., Healthcare, Employment, Education, Privacy, Environment, Social Justice), accuracy (70-95), sources (5-20). Output only valid JSON.`;

  try {
    const result = await classifyNewsWithRetry(title, description, promptTemplate, 'Survey Classification');
    return result as SurveyClassification;
  } catch (error) {
    console.warn('AI classification failed, using fallback:', error);
    
    // Check if it's a quota exceeded error
    if (error instanceof APIError && 
        (error.message.includes('quota') || error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED'))) {
      console.warn('Gemini API quota exceeded - using keyword-based fallback classification');
    }
    
    // Use fallback classification
    return fallbackClassification(title, description);
  }
};

// Shared news classification for news display
export const classifyNewsForDisplay = async (title: string, description: string): Promise<DisplayClassification> => {
  const promptTemplate = `Analyze this AI news article. Title: {title}. Description: {description}. Respond in JSON format with: category (e.g., Healthcare, Employment, Education, Privacy, Environment, Social Justice), status ('featured', 'new', 'urgent', 'important', or 'regular'). Output only valid JSON.`;

  try {
    const result = await classifyNewsWithRetry(title, description, promptTemplate, 'Display Classification');
    return result as DisplayClassification;
  } catch (error) {
    console.warn('AI classification failed for display, using fallback:', error);
    
    // Check if it's a quota exceeded error
    if (error instanceof APIError && 
        (error.message.includes('quota') || error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED'))) {
      console.warn('Gemini API quota exceeded - using basic display classification');
    }
    
    // Use fallback classification for display
    const text = `${title} ${description}`.toLowerCase();
    let category = 'General';
    let status = 'regular';
    
    // Determine category based on keywords
    if (text.includes('health') || text.includes('medical') || text.includes('healthcare')) {
      category = 'Healthcare';
    } else if (text.includes('job') || text.includes('employment') || text.includes('work')) {
      category = 'Employment';
    } else if (text.includes('education') || text.includes('school') || text.includes('learning')) {
      category = 'Education';
    } else if (text.includes('privacy') || text.includes('data') || text.includes('security')) {
      category = 'Privacy';
    } else if (text.includes('environment') || text.includes('climate') || text.includes('sustainable')) {
      category = 'Environment';
    } else if (text.includes('bias') || text.includes('fair') || text.includes('justice')) {
      category = 'Social Justice';
    }
    
    // Determine status based on urgency keywords
    if (text.includes('urgent') || text.includes('breaking') || text.includes('critical')) {
      status = 'urgent';
    } else if (text.includes('new') || text.includes('latest') || text.includes('recent')) {
      status = 'new';
    } else if (text.includes('featured') || text.includes('important') || text.includes('major')) {
      status = 'featured';
    } else if (text.includes('significant') || text.includes('notable')) {
      status = 'important';
    }
    
    return { category, status };
  }
};

// Optimized function to fetch only the latest AI news
export const fetchRealAINews = async (): Promise<AINews[]> => {
  const newsApiKey = import.meta.env.VITE_NEWSAPI_KEY;

  validateApiKey(newsApiKey!, 'NewsAPI');

  // Check cache first
  const cachedData = getCachedData(CACHE_CONFIG.NEWS_CACHE_KEY);
  if (cachedData) {
    console.log('Using cached AI news data');
    return cachedData;
  }

  // Pre-flight connectivity check
  const hasInternet = await testInternetConnectivity();
  if (!hasInternet) {
    throw new APIError('No internet connection detected. Please check your network connection.', undefined, 'connectivity');
  }

  return withRetry(
    async () => {
      try {
        // Fetch 10 latest articles for more survey questions
        const response = await axios.get(
          `${API_CONFIG.NEWSAPI.BASE_URL}/everything?q=artificial+intelligence+impact+OR+artificial+intelligence+societal+OR+artificial+intelligence+ethics+OR+AI+implications+OR+AI+effects&language=en&sortBy=publishedAt&pageSize=10&apiKey=${newsApiKey}`,
          {
            timeout: API_CONFIG.NEWSAPI.TIMEOUT,
            headers: {
              'User-Agent': 'Spark-Community-News/1.0',
            }
          }
        );

        validateNewsApiResponse(response.data);

        const articles = response.data.articles;
        const classifiedNews: AINews[] = [];

        // Process articles in parallel for faster classification
        const classificationPromises = articles.map(async (article: NewsApiArticle, i: number) => {
          try {
            validateArticle(article, i);

            const rawDescription = article.description || article.content || '';
            let enhancedDescription = rawDescription;

            // Enhance incomplete descriptions with AI context
            if (!rawDescription || rawDescription.length < 50) {
              enhancedDescription = await generateEnhancedDescription(
                article.title || 'Untitled',
                rawDescription
              );
            }

            const classification = await classifyNewsForSurvey(
              article.title || 'Untitled',
              enhancedDescription
            );

            return {
              id: i + 1,
              title: article.title || 'Untitled Article',
              description: enhancedDescription,
              ...classification,
            };
          } catch (classificationError) {
            console.warn(`Error classifying article ${i} (${article.title}):`, classificationError);

            // Fallback with enhanced description
            const fallbackDescription = await generateEnhancedDescription(
              article.title || 'Untitled Article',
              'AI development news'
            );

            return {
              id: i + 1,
              title: article.title || 'Untitled Article',
              description: fallbackDescription,
              impact: 'positive' as const,
              category: 'General',
              accuracy: 75,
              sources: 8,
            };
          }
        });

        // Wait for all classifications to complete
        const results = await Promise.all(classificationPromises);
        classifiedNews.push(...results.filter(result => result !== null));

        // Ensure we have at least some data
        if (classifiedNews.length === 0) {
          throw new APIError('No valid AI impact news articles could be processed', undefined, 'classification');
        }

        // Cache the results
        setCachedData(CACHE_CONFIG.NEWS_CACHE_KEY, classifiedNews);

        return classifiedNews;
      } catch (error) {
        // Use enhanced error handling
        const apiError = handleNetworkError(error, 'Latest AI Impact News Fetch');
        throw apiError;
      }
    },
    API_CONFIG.NEWSAPI.RETRY_ATTEMPTS,
    API_CONFIG.NEWSAPI.RETRY_DELAY,
    'Latest AI Impact News Fetch'
  );
};

// Optimized function to fetch latest AI news for display
export const fetchRealAINewsForDisplay = async (): Promise<NewsArticle[]> => {
  const newsApiKey = import.meta.env.VITE_NEWSAPI_KEY;

  validateApiKey(newsApiKey!, 'NewsAPI');

  // Check cache first
  const cachedData = getCachedData(CACHE_CONFIG.DISPLAY_CACHE_KEY);
  if (cachedData) {
    console.log('Using cached AI news display data');
    return cachedData;
  }

  // Pre-flight connectivity check
  const hasInternet = await testInternetConnectivity();
  if (!hasInternet) {
    throw new APIError('No internet connection detected. Please check your network connection.', undefined, 'connectivity');
  }

  return withRetry(
    async () => {
      try {
        // Fetch 10 latest articles for more comprehensive display
        const response = await axios.get(
          `${API_CONFIG.NEWSAPI.BASE_URL}/everything?q=artificial+intelligence+impact+OR+artificial+intelligence+societal+OR+artificial+intelligence+ethics+OR+AI+implications+OR+AI+effects&language=en&sortBy=publishedAt&pageSize=10&apiKey=${newsApiKey}`,
          {
            timeout: API_CONFIG.NEWSAPI.TIMEOUT,
            headers: {
              'User-Agent': 'Spark-Community-News/1.0',
            }
          }
        );

        validateNewsApiResponse(response.data);

        const articles = response.data.articles;
        const classifiedNews: NewsArticle[] = [];

        // Process articles in parallel for faster results
        const processingPromises = articles.map(async (article: NewsApiArticle, i: number) => {
          try {
            validateArticle(article, i);

            const rawExcerpt = article.description || article.content || '';
            let enhancedExcerpt = rawExcerpt;

            // Enhance incomplete excerpts with AI context
            if (!rawExcerpt || rawExcerpt.length < 50) {
              enhancedExcerpt = await generateEnhancedDescription(
                article.title || 'Untitled',
                rawExcerpt
              );
            }

            const classification = await classifyNewsForDisplay(
              article.title || 'Untitled',
              enhancedExcerpt
            );

            return {
              id: i + 1,
              title: article.title || 'Untitled Article',
              excerpt: enhancedExcerpt,
              author: article.author || 'AI News',
              publishedAt: article.publishedAt || new Date().toISOString(),
              readTime: '3 min read',
              views: Math.floor(Math.random() * 300) + 100,
              category: classification.category,
              status: classification.status,
            };
          } catch (classificationError) {
            console.warn(`Error classifying article ${i} (${article.title}):`, classificationError);

            // Fallback with enhanced excerpt
            const fallbackExcerpt = await generateEnhancedDescription(
              article.title || 'Untitled Article',
              'AI development news'
            );

            return {
              id: i + 1,
              title: article.title || 'Untitled Article',
              excerpt: fallbackExcerpt,
              author: 'AI News',
              publishedAt: new Date().toISOString(),
              readTime: '3 min read',
              views: Math.floor(Math.random() * 300) + 100,
              category: 'General',
              status: 'regular',
            };
          }
        });

        // Wait for all processing to complete
        const results = await Promise.all(processingPromises);
        classifiedNews.push(...results.filter(result => result !== null));

        // Cache the results
        setCachedData(CACHE_CONFIG.DISPLAY_CACHE_KEY, classifiedNews);

        return classifiedNews;
      } catch (error) {
        // Use enhanced error handling
        const apiError = handleNetworkError(error, 'Latest AI Impact News Display Fetch');
        throw apiError;
      }
    },
    API_CONFIG.NEWSAPI.RETRY_ATTEMPTS,
    API_CONFIG.NEWSAPI.RETRY_DELAY,
    'Latest AI Impact News Display Fetch'
  );
};
