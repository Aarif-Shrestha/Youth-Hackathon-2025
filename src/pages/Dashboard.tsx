import Navigation from '@/components/Navigation';
import DashboardStats from '@/components/DashboardStats';
import DemographicsChart from '@/components/DemographicsChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import heroImage from '@/assets/hero-community.jpg';
import { useState, useEffect } from 'react';
import { fetchRealAINews, type AINews } from '@/lib/ai-news';
import { Users, MessageSquare, TrendingUp, Brain, Calendar, Target, Activity, BarChart3, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface SurveyResult {
  sessionId?: string;
  date: string;
  score: number;
  totalQuestions: number;
  timeSpentMinutes?: number;
  userChoices: Record<number, 'positive' | 'negative'>;
  newsData: AINews[];
}

interface FeedChamberCategory {
  name: string;
  likes: number;
  skips: number;
  weight: number;
  hidden: boolean;
  skipCount: number;
}

interface FeedChamberResult {
  date: string;
  stats: FeedChamberCategory[];
  totalPosts: number;
}

const Dashboard = () => {
  const [aiNewsData, setAiNewsData] = useState<AINews[]>([]);
  const [surveyResults, setSurveyResults] = useState<SurveyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (useCache = true) => {
    try {
      setLoading(true);
      setError(null);

      // Load both AI news and survey results in parallel with timeout
      const loadDataPromise = Promise.all([
        fetchRealAINews().catch(error => {
          console.warn('Failed to fetch AI news:', error);
          return []; // Return empty array as fallback
        }),
        new Promise<SurveyResult[]>((resolve) => {
          try {
            const stored = localStorage.getItem('aiSurveyResults');
            const parsed = stored ? JSON.parse(stored) : [];
            resolve(Array.isArray(parsed) ? parsed : []);
          } catch (error) {
            console.warn('Failed to parse survey results from localStorage:', error);
            resolve([]);
          }
        })
      ]);

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Loading timeout - please check your internet connection and try again. If the problem persists, the AI service may be experiencing issues.')), 30000); // Increased to 30 seconds
      });

      const [news, results] = await Promise.race([loadDataPromise, timeoutPromise]);

      setAiNewsData(Array.isArray(news) ? news : []);
      setSurveyResults(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      
      // Check for specific error types
      let errorMessage = 'Failed to load dashboard data. Please try again.';
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('connectivity') || errorMsg.includes('internet')) {
          errorMessage = 'No internet connection detected. Please check your network connection and try again.';
        } else if (errorMsg.includes('timeout')) {
          errorMessage = 'Request timed out. This might be due to slow internet or server issues. Please try again.';
        } else if (errorMsg.includes('dns') || errorMsg.includes('connection')) {
          errorMessage = 'Connection error. Please check your internet connection and DNS settings.';
        } else if (errorMsg.includes('quota') || errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
          errorMessage = 'AI service quota exceeded. Dashboard will use basic classification. Consider upgrading your AI service plan for full functionality.';
        } else if (errorMsg.includes('rate limit')) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (errorMsg.includes('service unavailable') || errorMsg.includes('502') || errorMsg.includes('503')) {
          errorMessage = 'Service temporarily unavailable. Please try again in a few minutes.';
        }
      }
      
      setError(errorMessage);
      // Set empty data to prevent hanging
      setAiNewsData([]);
      setSurveyResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData(false); // Reload data without cache
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleClearResponses = () => {
    if (window.confirm('Are you sure you want to clear all survey responses? This action cannot be undone.')) {
      localStorage.removeItem('aiSurveyResults');
      setSurveyResults([]);
      // Reload data to refresh all calculations
      loadData();
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Enhanced analytics calculations with improved accuracy
  const totalSurveys = surveyResults.length;

  // Calculate total questions answered across all surveys
  const totalQuestionsAnswered = surveyResults.reduce((sum, result) => sum + result.totalQuestions, 0);

  // Calculate total correct answers (alignment with expert consensus)
  const totalCorrectAnswers = surveyResults.reduce((sum, result) => sum + result.score, 0);

  // Calculate community sentiment alignment rate (percentage of correct answers)
  const sentimentAlignmentRate = totalQuestionsAnswered > 0
    ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100)
    : 0;

  // Calculate average score per survey (correct answers per survey)
  const averageScorePerSurvey = totalSurveys > 0
    ? (totalCorrectAnswers / totalSurveys).toFixed(1)
    : '0';

  // Calculate average questions per survey
  const averageQuestionsPerSurvey = totalSurveys > 0
    ? Math.round(totalQuestionsAnswered / totalSurveys)
    : 0;

  // Calculate average completion time
  const totalCompletionTime = surveyResults.reduce((sum, result) => sum + (result.timeSpentMinutes || 0), 0);
  const averageCompletionTime = totalSurveys > 0
    ? Math.round(totalCompletionTime / totalSurveys)
    : 0;

  // Calculate survey completion rate (assuming all started surveys are completed)
  const completionRate = totalSurveys > 0 ? 100 : 0;

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentSurveys = surveyResults.filter(result =>
    new Date(result.date) >= sevenDaysAgo
  );

  // Feed Chamber analytics - only realtime data from localStorage
  const feedChamberResults: FeedChamberResult[] = JSON.parse(localStorage.getItem('feedChamberResults') || '[]');
  const recentFeedChamber = feedChamberResults.filter((result: FeedChamberResult) =>
    new Date(result.date) >= sevenDaysAgo
  );
  const totalFeedChamberSessions = feedChamberResults.length;
  const recentFeedChamberSessions = recentFeedChamber.length;

  // Calculate average engagement from actual sessions
  const averageEngagement = feedChamberResults.length > 0
    ? Math.round(feedChamberResults.reduce((sum: number, result: FeedChamberResult) =>
        sum + (result.stats?.reduce((categorySum: number, cat: FeedChamberCategory) =>
          categorySum + cat.likes + cat.skips, 0) || 0), 0) / feedChamberResults.length)
    : 0;

  // AI News insights
  const categoryBreakdown = aiNewsData.reduce((acc, news) => {
    if (!news.category || !news.impact) return acc;

    const category = news.category;
    const impact = news.impact;

    if (!acc[category]) {
      acc[category] = { positive: 0, negative: 0, total: 0 };
    }

    if (impact === 'positive' || impact === 'negative') {
      acc[category][impact]++;
      acc[category].total++;
    }

    return acc;
  }, {} as Record<string, { positive: number; negative: number; total: number }>);

  // Top performing categories
  const topCategories = Object.entries(categoryBreakdown)
    .sort(([,a], [,b]) => b.total - a.total)
    .slice(0, 5);

  // Category data for chart
  const categoryData = Object.entries(categoryBreakdown).map(([name, data]) => ({
    name,
    value: data.total,
    color: data.positive > data.negative ? 'hsl(var(--success))' : 'hsl(var(--destructive))',
  }));

  // Survey participation trends
  const participationTrend = surveyResults.length > 0 ?
    surveyResults.slice(-10).map(result => ({
      date: new Date(result.date).toLocaleDateString(),
      score: result.score,
      accuracy: result.totalQuestions > 0 ? (result.score / result.totalQuestions) * 100 : 0
    })) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Loading AI Impact Analytics Dashboard...</p>
          <p className="text-sm text-muted-foreground mt-2">Analyzing recent AI developments and their impact on human society</p>
          <p className="text-xs text-muted-foreground mt-1">Using cached data when available to improve performance</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-lg mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Community Dashboard" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient opacity-80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-primary-foreground">
            <h1 className="text-4xl font-bold mb-2">Spark Community News Dashboard</h1>
            <p className="text-lg opacity-90">Track community sentiment about AI developments</p>
            <div className="mt-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5, type: "spring", stiffness: 200 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => window.location.href = '/feed-chamber'}
                    variant="secondary"
                    size="lg"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Target className="w-5 h-5 mr-2" />
                    Experience Feed Chamber
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <motion.div 
          className="flex justify-between items-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h2 className="text-2xl font-bold text-foreground">Analytics Overview</h2>
            <p className="text-muted-foreground">Real-time insights from AI impact surveys</p>
          </div>
          <div className="flex gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={handleRefresh} 
                disabled={refreshing || loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={handleClearResponses}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                Clear Responses
              </Button>
            </motion.div>
          </div>
        </motion.div>
        
        <DashboardStats 
          totalSurveys={totalSurveys}
          totalResponses={totalQuestionsAnswered}
          correctPredictions={totalCorrectAnswers}
          averageScore={averageScorePerSurvey}
          recentSurveys={recentSurveys.length}
        />

        {/* Feed Chamber Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="card-gradient shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Target className="w-5 h-5 mr-2 text-purple-600" />
                Feed Chamber Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div 
                    className="text-2xl font-bold text-purple-600"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  >
                    {totalFeedChamberSessions}
                  </motion.div>
                  <p className="text-sm text-muted-foreground">Learning Sessions</p>
                </motion.div>
                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div 
                    className="text-2xl font-bold text-blue-600"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                  >
                    {averageEngagement}
                  </motion.div>
                  <p className="text-sm text-muted-foreground">Avg Interactions</p>
                </motion.div>
              </div>
              <motion.div 
                className="mt-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.3 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={() => window.location.href = '/feed-chamber'}
                    variant="outline" 
                    size="sm"
                    className="w-full"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Explore Echo Chambers
                  </Button>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <DemographicsChart sentimentData={categoryData} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="card-gradient shadow-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">AI Impact Survey Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(categoryBreakdown).map(([category, data], index) => (
                    <motion.div 
                      key={index} 
                      className="p-3 rounded-lg bg-accent"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-medium text-sm">{category}</p>
                        <p className="text-xs text-muted-foreground">{data.total} responses</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-success"
                            style={{ width: `${data.total > 0 ? (data.positive / data.total) * 100 : 0}%` }}
                          />
                        </div>
                        <p className="text-xs text-success font-medium">{data.total > 0 ? Math.round((data.positive / data.total) * 100) : 0}%</p>
                        <p className="text-xs text-destructive font-medium">{data.total > 0 ? Math.round((data.negative / data.total) * 100) : 0}%</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Card className="card-gradient shadow-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Top Survey Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiNewsData.slice(0, 4).map((news, index) => (
                    <motion.div 
                      key={news.id} 
                      className="p-3 rounded-lg bg-muted"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium text-sm">{news.title}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          news.impact === 'positive' 
                            ? 'bg-success/10 text-success' 
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          {news.impact}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{news.sources} sources</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;