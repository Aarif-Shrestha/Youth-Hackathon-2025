import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { Heart, X, Play, RotateCcw, BarChart3, TrendingUp, Users, Target, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  emoji: string;
}

interface CategoryStats {
  name: string;
  likes: number;
  skips: number;
  weight: number;
  hidden: boolean;
  skipCount: number;
}

const FeedChamber = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [currentPosts, setCurrentPosts] = useState<Post[]>([]);
  const [showReport, setShowReport] = useState(false);

  // Sample posts data with educational focus
  const allPosts: Post[] = useMemo(() => [
    { id: 1, title: "� Climate Change Solutions", content: "Scientists discover breakthrough in renewable energy technology that could reduce carbon emissions by 40%.", category: "Environment", emoji: "�" },
    { id: 2, title: "🤖 AI in Healthcare", content: "New AI system helps doctors diagnose diseases 30% faster with 95% accuracy.", category: "Technology", emoji: "🤖" },
    { id: 3, title: "🗳️ Election Security", content: "Government implements new cybersecurity measures to protect voting systems.", category: "Politics", emoji: "🗳️" },
    { id: 4, title: "� Green Transportation", content: "Electric vehicle sales surpass gasoline cars for the first time in history.", category: "Environment", emoji: "�" },
    { id: 5, title: "🎬 Streaming Wars", content: "Major streaming platform announces plans to invest $10 billion in original content.", category: "Entertainment", emoji: "🎬" },
    { id: 6, title: "💊 Mental Health Apps", content: "Study shows meditation apps reduce anxiety by 25% in regular users.", category: "Health", emoji: "💊" },
    { id: 7, title: "⚽ Sports Analytics", content: "AI-powered analytics help coaches make better decisions, improving team performance.", category: "Sports", emoji: "⚽" },
    { id: 8, title: "📱 Social Media Ethics", content: "Tech companies face scrutiny over algorithm transparency and user privacy.", category: "Technology", emoji: "📱" },
    { id: 9, title: "🏛️ Education Reform", content: "New curriculum emphasizes critical thinking and digital literacy skills.", category: "Politics", emoji: "🏛️" },
    { id: 10, title: "� Ocean Cleanup", content: "Innovative technology removes 100 tons of plastic from oceans annually.", category: "Environment", emoji: "�" },
    { id: 11, title: "🎵 Music Discovery", content: "AI algorithms help independent artists reach wider audiences.", category: "Entertainment", emoji: "🎵" },
    { id: 12, title: "🧘 Wellness Trends", content: "Workplaces adopt wellness programs, reducing employee stress by 20%.", category: "Health", emoji: "🧘" },
    { id: 13, title: "� Athletic Performance", content: "Wearable tech helps athletes optimize training and prevent injuries.", category: "Sports", emoji: "�" },
    { id: 14, title: "🚀 Space Exploration", content: "Private companies lead new era of commercial space travel.", category: "Technology", emoji: "🚀" },
    { id: 15, title: "📊 Economic Growth", content: "Tech sector creates millions of new jobs in sustainable industries.", category: "Politics", emoji: "📊" },
    { id: 16, title: "� Urban Gardening", content: "Cities implement green spaces to combat air pollution and improve mental health.", category: "Environment", emoji: "�" },
    { id: 17, title: "🎭 Digital Art", content: "NFT marketplace supports emerging artists with fair compensation models.", category: "Entertainment", emoji: "🎭" },
    { id: 18, title: "🥗 Nutrition Research", content: "Plant-based diets linked to lower risk of chronic diseases.", category: "Health", emoji: "🥗" },
    { id: 19, title: "� Team Sports", content: "Youth sports programs emphasize teamwork and character development.", category: "Sports", emoji: "�" },
    { id: 20, title: "💻 Coding Education", content: "Free online platforms teach programming to millions of students worldwide.", category: "Technology", emoji: "💻" }
  ], []);

  const categories = useMemo(() => ["Sports", "Technology", "Politics", "Environment", "Entertainment", "Health"], []);

  const generatePosts = useCallback((stats: CategoryStats[]) => {
    const availableCategories = stats.filter(cat => !cat.hidden);
    const posts: Post[] = [];
    const targetPosts = 15;

    for (let i = 0; i < targetPosts; i++) {
      const totalWeight = availableCategories.reduce((sum, cat) => sum + cat.weight, 0);
      let random = Math.random() * totalWeight;

      for (const category of availableCategories) {
        random -= category.weight;
        if (random <= 0) {
          const categoryPosts = allPosts.filter(p => p.category === category.name);
          const randomPost = categoryPosts[Math.floor(Math.random() * categoryPosts.length)];
          posts.push(randomPost);
          break;
        }
      }
    }

    setCurrentPosts(posts);
    setCurrentPostIndex(0);
  }, [allPosts]);

  const initializeGame = useCallback(() => {
    // Initialize category stats
    const initialStats: CategoryStats[] = categories.map(cat => ({
      name: cat,
      likes: 0,
      skips: 0,
      weight: 1,
      hidden: false,
      skipCount: 0
    }));
    setCategoryStats(initialStats);

    // Generate initial posts based on weights
    generatePosts(initialStats);
  }, [categories, generatePosts]);

  useEffect(() => {
    if (gameStarted && !gameCompleted) {
      initializeGame();
    }
  }, [gameStarted, gameCompleted, initializeGame]);

  const handleLike = () => {
    const currentPost = currentPosts[currentPostIndex];
    if (!currentPost) return;

    setCategoryStats(prev => prev.map(cat => {
      if (cat.name === currentPost.category) {
        return {
          ...cat,
          likes: cat.likes + 1,
          weight: Math.min(cat.weight + 0.5, 3), // Increase weight, max 3
          skipCount: 0 // Reset skip count on like
        };
      }
      return cat;
    }));

    nextPost();
  };

  const handleSkip = () => {
    const currentPost = currentPosts[currentPostIndex];
    if (!currentPost) return;

    setCategoryStats(prev => prev.map(cat => {
      if (cat.name === currentPost.category) {
        const newSkipCount = cat.skipCount + 1;
        return {
          ...cat,
          skips: cat.skips + 1,
          hidden: newSkipCount >= 2, // Hide after 2 skips
          skipCount: newSkipCount
        };
      }
      return cat;
    }));

    nextPost();
  };

  const nextPost = () => {
    if (currentPostIndex < currentPosts.length - 1) {
      setCurrentPostIndex(prev => prev + 1);
    } else {
      setGameCompleted(true);
      setShowReport(true);
      // Save results to localStorage
      const results = {
        date: new Date().toISOString(),
        stats: categoryStats,
        totalPosts: currentPosts.length
      };
      const existing = JSON.parse(localStorage.getItem('feedChamberResults') || '[]');
      existing.push(results);
      localStorage.setItem('feedChamberResults', JSON.stringify(existing));
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setShowReport(false);
    setCurrentPostIndex(0);
    setCurrentPosts([]);
    setCategoryStats([]);
  };

  const startGame = () => {
    setGameStarted(true);
    setGameCompleted(false);
    setShowReport(false);
  };

  if (!gameStarted) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6,
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            className="w-full max-w-md mx-4"
          >
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 overflow-hidden">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  >
                    <Sparkles className="w-12 h-12 mx-auto mb-2 text-yellow-300" />
                  </motion.div>
                  <CardTitle className="text-3xl font-bold mb-2">
                    Echo Chamber Simulator
                  </CardTitle>
                  <p className="text-lg opacity-90">
                    Discover how algorithms create filter bubbles
                  </p>
                </CardHeader>
              </motion.div>

              <CardContent className="p-6">
                <motion.div 
                  className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-6"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-purple-600" />
                    What You'll Experience
                  </h3>
                  <motion.ul 
                    className="text-sm text-gray-600 space-y-2"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.1
                        }
                      }
                    }}
                  >
                    {[
                      "Experience how algorithms amplify your preferences",
                      "See how repeated interactions create echo chambers",
                      "Learn why diverse content gets filtered out",
                      "Understand algorithmic bias in social feeds",
                      "Discover the impact on your information diet",
                      "Explore real-world implications for democracy"
                    ].map((item, index) => (
                      <motion.li 
                        key={index}
                        className="flex items-center"
                        variants={{
                          hidden: { opacity: 0, x: -20 },
                          visible: { opacity: 1, x: 0 }
                        }}
                      >
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0" />
                        {item}
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.div>

                <motion.div 
                  className="bg-gradient-to-r from-indigo-50 to-cyan-50 p-4 rounded-lg mb-6"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-indigo-600" />
                    Why This Matters
                  </h3>
                  <motion.div 
                    className="text-sm text-gray-600 space-y-2"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.15
                        }
                      }
                    }}
                  >
                    {[
                      "📊 Algorithms control what 2 billion+ people see daily",
                      "📰 Echo chambers can polarize societies and reduce empathy",
                      "🎯 Understanding bias helps you become a more informed citizen",
                      "🔄 Breaking filter bubbles leads to better decision-making"
                    ].map((item, index) => (
                      <motion.p 
                        key={index}
                        className="flex items-center"
                        variants={{
                          hidden: { opacity: 0, x: 20 },
                          visible: { opacity: 1, x: 0 }
                        }}
                      >
                        {item}
                      </motion.p>
                    ))}
                  </motion.div>
                </motion.div>

                <motion.div 
                  className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg mb-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75, duration: 0.5 }}
                >
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-orange-600" />
                    How It Works
                  </h3>
                  <motion.div 
                    className="text-sm text-gray-600 space-y-2"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.1
                        }
                      }
                    }}
                  >
                    {[
                      "❤️ Like = Algorithm shows more of that topic",
                      "❌ Skip = Algorithm reduces that topic's visibility",
                      "🔄 After 2 skips, categories get hidden completely",
                      "📈 Weights increase/decrease based on your preferences",
                      "🎯 Experience how small choices create big changes"
                    ].map((item, index) => (
                      <motion.p 
                        key={index}
                        className="flex items-center"
                        variants={{
                          hidden: { opacity: 0, x: -20 },
                          visible: { opacity: 1, x: 0 }
                        }}
                      >
                        {item}
                      </motion.p>
                    ))}
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <Button
                    onClick={startGame}
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <motion.div
                      className="flex items-center justify-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className="w-6 h-6 mr-3" />
                      Begin Learning Experience
                    </motion.div>
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (showReport) {
    const mostLiked = categoryStats.reduce((prev, current) =>
      prev.likes > current.likes ? prev : current
    );
    const mostSkipped = categoryStats.reduce((prev, current) =>
      prev.skips > current.skips ? prev : current
    );
    const hiddenCategories = categoryStats.filter(cat => cat.hidden);

    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 overflow-hidden">
              <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <CardHeader className="text-center bg-gradient-to-r from-green-500 to-blue-500 text-white">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  >
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 text-yellow-300" />
                  </motion.div>
                  <CardTitle className="text-3xl font-bold mb-2">
                    Echo Chamber Analysis
                  </CardTitle>
                  <p className="text-lg opacity-90">
                    Understanding your digital information bubble
                  </p>
                </CardHeader>
              </motion.div>

              <CardContent className="p-6">
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.2
                      }
                    }
                  }}
                >
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, x: -50, scale: 0.8 },
                      visible: { opacity: 1, x: 0, scale: 1 }
                    }}
                  >
                    <Card className="bg-green-50 border-green-200 h-full">
                      <CardHeader>
                        <CardTitle className="text-green-800 flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2" />
                          Most Engaged
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <motion.div 
                          className="text-2xl font-bold text-green-700"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                        >
                          {mostLiked.name}
                        </motion.div>
                        <p className="text-green-600">{mostLiked.likes} likes</p>
                        <motion.p 
                          className="text-sm text-green-500 mt-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1, duration: 0.5 }}
                        >
                          This became your "comfort zone" - the algorithm learned you prefer this topic!
                        </motion.p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    variants={{
                      hidden: { opacity: 0, x: 50, scale: 0.8 },
                      visible: { opacity: 1, x: 0, scale: 1 }
                    }}
                  >
                    <Card className="bg-red-50 border-red-200 h-full">
                      <CardHeader>
                        <CardTitle className="text-red-800 flex items-center">
                          <Target className="w-5 h-5 mr-2" />
                          Most Ignored
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <motion.div 
                          className="text-2xl font-bold text-red-700"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                        >
                          {mostSkipped.name}
                        </motion.div>
                        <p className="text-red-600">{mostSkipped.skips} skips</p>
                        <motion.p 
                          className="text-sm text-red-500 mt-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1, duration: 0.5 }}
                        >
                          This category was hidden due to multiple skips
                        </motion.p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>

                <motion.div 
                  className="bg-blue-50 p-4 rounded-lg mb-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <h3 className="font-semibold text-blue-800 mb-3">Category Breakdown</h3>
                  <motion.div 
                    className="grid grid-cols-2 md:grid-cols-3 gap-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.1
                        }
                      }
                    }}
                  >
                    {categoryStats.map((cat, index) => (
                      <motion.div 
                        key={cat.name}
                        className={`p-3 rounded-lg ${
                          cat.hidden ? 'bg-gray-100 opacity-50' : 'bg-white'
                        } shadow-sm hover:shadow-md transition-shadow duration-300`}
                        variants={{
                          hidden: { opacity: 0, scale: 0.8, y: 20 },
                          visible: { opacity: 1, scale: 1, y: 0 }
                        }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="font-medium text-sm">{cat.name}</div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-green-600 flex items-center">
                            <Heart className="w-3 h-3 mr-1" />
                            {cat.likes}
                          </span>
                          <span className="text-red-600 flex items-center">
                            <X className="w-3 h-3 mr-1" />
                            {cat.skips}
                          </span>
                        </div>
                        {cat.hidden && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.2 + index * 0.1 }}
                          >
                            <Badge variant="secondary" className="text-xs mt-1">
                              Hidden
                            </Badge>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>

                <motion.div 
                  className="bg-yellow-50 p-4 rounded-lg mb-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                >
                  <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Understanding Echo Chambers
                  </h3>
                  <motion.p 
                    className="text-yellow-700 text-sm mb-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4, duration: 0.5 }}
                  >
                    You just experienced an echo chamber! Algorithms learn from your behavior and show you more of what you engage with, while filtering out what you ignore. This can limit your exposure to diverse viewpoints and create information bubbles. In real life, this affects what news you see, what products are recommended, and even what friends social platforms suggest!
                  </motion.p>
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6, duration: 0.5 }}
                  >
                    <div className="bg-white p-2 rounded border-l-4 border-blue-400">
                      <strong className="text-blue-800">Real-World Impact:</strong>
                      <p className="text-blue-700 mt-1">Political polarization, reduced critical thinking, limited exposure to diverse perspectives</p>
                    </div>
                    <div className="bg-white p-2 rounded border-l-4 border-purple-400">
                      <strong className="text-purple-800">Algorithmic Bias:</strong>
                      <p className="text-purple-700 mt-1">Systems amplify existing preferences, creating self-reinforcing loops of similar content</p>
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div 
                  className="bg-gradient-to-r from-teal-50 to-green-50 p-4 rounded-lg mb-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.8, duration: 0.5 }}
                >
                  <h3 className="font-semibold text-teal-800 mb-3 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Breaking the Echo Chamber
                  </h3>
                  <motion.div 
                    className="text-sm text-teal-700 space-y-2"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.15
                        }
                      }
                    }}
                  >
                    {[
                      "🔍 Actively seek diverse sources and viewpoints",
                      "🤝 Engage with people who think differently",
                      "⚖️ Question your assumptions and biases regularly",
                      "📚 Read books and articles outside your comfort zone",
                      "💬 Have meaningful discussions with diverse groups"
                    ].map((item, index) => (
                      <motion.p 
                        key={index}
                        className="flex items-center"
                        variants={{
                          hidden: { opacity: 0, y: 10 },
                          visible: { opacity: 1, y: 0 }
                        }}
                      >
                        {item}
                      </motion.p>
                    ))}
                  </motion.div>
                </motion.div>

                <motion.div 
                  className="flex gap-4 justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6, duration: 0.5 }}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={resetGame} variant="outline">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Play Again
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={() => window.location.href = '/'} variant="default">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Back to Dashboard
                    </Button>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  const currentPost = currentPosts[currentPostIndex];

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navigation />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
          className="w-full max-w-md mx-4"
        >
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 overflow-hidden">
            <CardContent className="p-6">
              {/* Educational Tips */}
              <motion.div 
                className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <p className="text-sm text-blue-800 font-medium">
                  💡 Tip: Your likes and skips teach the algorithm what you prefer. 
                  Notice how certain topics appear more or less frequently?
                </p>
              </motion.div>

              {/* Progress indicator */}
              <motion.div 
                className="flex justify-between items-center mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <span className="text-sm text-gray-600 font-medium">
                  Post {currentPostIndex + 1} of {currentPosts.length}
                </span>
                <div className="flex space-x-1">
                  {Array.from({ length: currentPosts.length }).map((_, i) => (
                    <motion.div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i <= currentPostIndex ? 'bg-purple-500' : 'bg-gray-300'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.05, type: "spring", stiffness: 300 }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Educational Progress Milestones */}
              <motion.div 
                className="mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                {currentPostIndex === 4 && (
                  <motion.div 
                    className="p-2 bg-green-50 rounded-lg border border-green-200"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <p className="text-xs text-green-700 font-medium text-center">
                      🎯 Milestone: Algorithm is learning your preferences!
                    </p>
                  </motion.div>
                )}
                {currentPostIndex === 9 && (
                  <motion.div 
                    className="p-2 bg-orange-50 rounded-lg border border-orange-200"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <p className="text-xs text-orange-700 font-medium text-center">
                      ⚠️ Notice: Some topics appear less frequently now
                    </p>
                  </motion.div>
                )}
                {currentPostIndex === 13 && (
                  <motion.div 
                    className="p-2 bg-red-50 rounded-lg border border-red-200"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <p className="text-xs text-red-700 font-medium text-center">
                      🚨 Echo Chamber Alert: Your feed is now highly personalized!
                    </p>
                  </motion.div>
                )}
              </motion.div>

              {/* Post content */}
              <AnimatePresence mode="wait">
                {currentPost && (
                  <motion.div
                    key={currentPost.id}
                    initial={{ opacity: 0, x: 100, rotateY: 90 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    exit={{ opacity: 0, x: -100, rotateY: -90 }}
                    transition={{ 
                      duration: 0.4,
                      type: "spring",
                      stiffness: 100,
                      damping: 20
                    }}
                    className="text-center space-y-4"
                  >
                    <motion.div 
                      className="text-4xl"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      {currentPost.emoji}
                    </motion.div>
                    <motion.h2 
                      className="text-xl font-bold text-gray-800"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      {currentPost.title}
                    </motion.h2>
                    <motion.p 
                      className="text-gray-600 leading-relaxed"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                    >
                      {currentPost.content}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                    >
                      <Badge variant="secondary" className="text-xs px-3 py-1">
                        {currentPost.category}
                      </Badge>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action buttons */}
              <motion.div 
                className="flex justify-center space-x-6 mt-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    onClick={handleSkip}
                    size="lg"
                    variant="outline"
                    className="w-16 h-16 rounded-full border-2 border-red-300 hover:border-red-500 hover:bg-red-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <motion.div
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <X className="w-8 h-8 text-red-500" />
                    </motion.div>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    onClick={handleLike}
                    size="lg"
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                      }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      <Heart className="w-8 h-8" />
                    </motion.div>
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div 
                className="flex justify-center space-x-4 mt-4 text-sm text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.3 }}
              >
                <span>Skip</span>
                <span>Like</span>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FeedChamber;
