import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Brain, Zap, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchRealAINews, type AINews, clearSurveyCache } from '@/lib/ai-news';

const AIGame = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userChoices, setUserChoices] = useState<Record<number, 'positive' | 'negative'>>({});
  const [showResults, setShowResults] = useState(false);
  const [aiNewsData, setAiNewsData] = useState<AINews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadNews = async (useCache = true) => {
    try {
      setLoading(true);
      setError(null);

      // Add timeout to prevent hanging
      const newsPromise = fetchRealAINews();
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Loading timeout - please check your internet connection and try again. If the problem persists, the AI service may be experiencing issues.')), 30000);
      });

      const news = await Promise.race([newsPromise, timeoutPromise]);
      setAiNewsData(news);
    } catch (error) {
      console.error('Failed to fetch and classify real AI news:', error);
      
      // Check for specific error types and provide better user feedback
      let errorMessage = 'Unable to load AI news. Please check your API keys and try again.';
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('connectivity') || errorMsg.includes('internet')) {
          errorMessage = 'No internet connection detected. Please check your network connection.';
        } else if (errorMsg.includes('timeout')) {
          errorMessage = 'Request timed out. This might be due to slow internet or server issues.';
        } else if (errorMsg.includes('dns') || errorMsg.includes('connection')) {
          errorMessage = 'Connection error. Please check your internet connection and DNS settings.';
        } else if (errorMsg.includes('quota') || errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
          errorMessage = 'AI service quota exceeded. Using basic classification for survey. Consider upgrading your AI service plan.';
        } else if (errorMsg.includes('rate limit')) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (errorMsg.includes('service unavailable') || errorMsg.includes('502') || errorMsg.includes('503')) {
          errorMessage = 'Service temporarily unavailable. Please try again in a few minutes.';
        } else if (errorMsg.includes('401') || errorMsg.includes('Invalid')) {
          errorMessage = 'API key error. Please check your API keys configuration.';
        }
      }
      
      setError(errorMessage);
      setAiNewsData([]); // Set empty array to prevent hanging
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    clearSurveyCache();
    await loadNews(false); // Force fresh data
    setRefreshing(false);
  };

  useEffect(() => {
    loadNews();
  }, []);  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Loading Latest AI Impact Survey...</p>
          <p className="text-sm text-muted-foreground mt-2">Preparing recent AI developments and their societal implications for assessment</p>
          <p className="text-xs text-muted-foreground mt-1">Using cached data when available to improve performance</p>
        </div>
      </div>
    );
  }

  if (error || aiNewsData.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-destructive" />
          <p className="text-destructive">{error || 'No AI news available.'}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const currentNews = aiNewsData[currentIndex];

  if (!currentNews) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-destructive" />
          <p>Invalid news data.</p>
        </div>
      </div>
    );
  }

  const handleChoice = (choice: 'positive' | 'negative') => {
    if (!currentNews) {
      console.error('No current news available');
      return;
    }

    const newChoices = { ...userChoices, [currentNews.id]: choice };
    setUserChoices(newChoices);

    if (choice === currentNews.impact) {
      setScore(prevScore => prevScore + 1);
    }

    if (currentIndex < aiNewsData.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
    } else {
      saveSurveyResults();
      setShowResults(true);
    }
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setUserChoices({});
    setShowResults(false);
  };

  // Save survey results to localStorage when survey completes
  const saveSurveyResults = () => {
    try {
      const surveyData = {
        date: new Date().toISOString(),
        score: Math.max(0, Math.min(score, aiNewsData.length)), // Ensure score is within bounds
        totalQuestions: aiNewsData.length,
        userChoices,
        newsData: aiNewsData.map(news => ({
          id: news.id,
          title: news.title,
          impact: news.impact,
          category: news.category,
          accuracy: news.accuracy,
          sources: news.sources,
        })),
      };

      const existingResults = (() => {
        try {
          const stored = localStorage.getItem('aiSurveyResults');
          return stored ? JSON.parse(stored) : [];
        } catch (error) {
          console.warn('Failed to parse existing survey results:', error);
          return [];
        }
      })();

      // Prevent duplicate entries by checking recent submissions
      const recentSubmission = existingResults.find((result: { date: string }) =>
        Math.abs(new Date(result.date).getTime() - new Date().getTime()) < 5000 // 5 seconds
      );

      if (!recentSubmission) {
        existingResults.push(surveyData);
        localStorage.setItem('aiSurveyResults', JSON.stringify(existingResults));
      }
    } catch (error) {
      console.error('Failed to save survey results:', error);
      // Could implement fallback storage here
    }
  };

  const getScoreColor = () => {
    if (aiNewsData.length === 0) return 'text-muted';
    const percentage = (score / aiNewsData.length) * 100;
    if (percentage >= 80) return 'text-success';
    if (percentage >= 60) return 'text-warning';
    return 'text-destructive';
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto card-gradient shadow-elegant">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold mb-4">Survey Complete! 🎉</CardTitle>
              <div className={`text-4xl font-bold ${getScoreColor()}`}>
                {score} / {aiNewsData.length}
              </div>
              <p className="text-muted-foreground mt-2">
                You matched expert consensus on {score} out of {aiNewsData.length} AI developments
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {aiNewsData.map((news, index) => (
                  <div key={`${news.id}-${index}`} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{news.title}</p>
                      <Badge variant="outline" className="mt-1">{news.category}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      {news.impact === 'positive' ? 
                        <ThumbsUp className="w-4 h-4 text-success" /> : 
                        <ThumbsDown className="w-4 h-4 text-destructive" />
                      }
                      {userChoices[news.id] === news.impact ? 
                        <CheckCircle className="w-4 h-4 text-success" /> :
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                      }
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center pt-4">
                <Button onClick={resetGame} variant="secondary" size="lg">
                  Take Survey Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <div className="hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">AI Impact Assessment Survey</h1>
          <p className="text-xl text-primary-foreground opacity-90">
            Evaluate the societal implications of recent AI developments
          </p>
          <div className="mt-4 flex items-center justify-center space-x-4">
            <Badge variant="secondary" className="text-sm">
              Question {currentIndex + 1} of {aiNewsData.length}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Score: {score}
            </Badge>
            <Button 
              onClick={handleRefresh} 
              disabled={refreshing || loading}
              variant="secondary"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Survey'}
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto card-gradient shadow-elegant">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline">{currentNews.category}</Badge>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Brain className="w-4 h-4" />
                <span>Accuracy: {currentNews.accuracy}%</span>
                <span>•</span>
                <span>{currentNews.sources} sources</span>
              </div>
            </div>
            <CardTitle className="text-xl font-bold mb-4">
              {currentNews.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {currentNews.description}
            </p>
            
                        <div className="text-center">
              <p className="font-medium mb-6">What type of impact does this AI development have on society?</p>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => handleChoice('positive')}
                  variant="success"
                  size="lg"
                  className="flex items-center space-x-2"
                  aria-label="Select positive impact"
                  disabled={!currentNews}
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span>Positive Impact</span>
                </Button>
                <Button
                  onClick={() => handleChoice('negative')}
                  variant="destructive"
                  size="lg"
                  className="flex items-center space-x-2"
                  aria-label="Select negative impact"
                  disabled={!currentNews}
                >
                  <ThumbsDown className="w-5 h-5" />
                  <span>Negative Impact</span>
                </Button>
              </div>
              {currentNews && (
                <p className="text-xs text-muted-foreground mt-4">
                  Question {currentIndex + 1} of {aiNewsData.length}
                </p>
              )}
            </div>
            
            <div className="mt-8 p-4 rounded-lg bg-accent">
              <div className="flex items-center text-sm text-muted-foreground">
                <Zap className="w-4 h-4 mr-2" />
                <span>Think carefully about the societal implications before making your choice!</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AIGame;