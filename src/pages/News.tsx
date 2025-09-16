import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Eye, Brain, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchRealAINewsForDisplay, type NewsArticle, clearDisplayCache } from '@/lib/ai-news';

const getBadgeVariant = (status: string) => {
  switch (status) {
    case 'featured': return 'default';
    case 'new': return 'secondary';
    case 'urgent': return 'destructive';
    case 'important': return 'outline';
    default: return 'outline';
  }
};

const News = () => {
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadNews = async (useCache = true) => {
    try {
      setLoading(true);
      setError(null);

      // Add timeout to prevent hanging
      const newsPromise = fetchRealAINewsForDisplay();
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Loading timeout - please check your internet connection and try again. If the problem persists, the AI service may be experiencing issues.')), 30000);
      });

      const news = await Promise.race([newsPromise, timeoutPromise]);
      setNewsArticles(news);
    } catch (error) {
      console.error('Failed to fetch real AI news:', error);
      
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
          errorMessage = 'AI service quota exceeded. Using basic news display. Consider upgrading your AI service plan.';
        } else if (errorMsg.includes('rate limit')) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (errorMsg.includes('service unavailable') || errorMsg.includes('502') || errorMsg.includes('503')) {
          errorMessage = 'Service temporarily unavailable. Please try again in a few minutes.';
        } else if (errorMsg.includes('401') || errorMsg.includes('Invalid')) {
          errorMessage = 'API key error. Please check your API keys configuration.';
        }
      }
      
      setError(errorMessage);
      setNewsArticles([]); // Set empty array to prevent hanging
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    clearDisplayCache();
    await loadNews(false); // Force fresh data
    setRefreshing(false);
  };

  useEffect(() => {
    loadNews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Loading Latest AI Impact News...</p>
          <p className="text-sm text-muted-foreground mt-2">Fetching recent AI developments and their societal implications</p>
          <p className="text-xs text-muted-foreground mt-1">Using cached data when available to improve performance</p>
        </div>
      </div>
    );
  }

  if (error || newsArticles.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{error || 'No AI news available.'}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
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
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">AI Impact News</h1>
          <p className="text-xl text-primary-foreground opacity-90 mb-6">
            Explore recent AI developments and their societal implications
          </p>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing || loading}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh News'}
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsArticles.map((article) => (
            <Card key={article.id} className="card-gradient shadow-card hover:shadow-elegant transition-smooth cursor-pointer">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={getBadgeVariant(article.status)} className="mb-2">
                    {article.category}
                  </Badge>
                  {article.status === 'featured' && (
                    <Badge variant="default">Featured</Badge>
                  )}
                </div>
                <CardTitle className="text-lg leading-tight hover:text-primary transition-colors">
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {article.excerpt}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {article.author}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {article.readTime}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {article.views}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Published {new Date(article.publishedAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Want to stay updated with more community news?</p>
          <div className="space-x-4 flex justify-center">
            <Button
              onClick={() => window.location.href = '/ai-game'}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Take AI Survey
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              View Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default News;