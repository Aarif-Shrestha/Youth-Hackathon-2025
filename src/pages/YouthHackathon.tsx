import Navigation from '@/components/Navigation';
import HackathonProjectManager from '@/components/HackathonProjectManager';
import TeamFormation from '@/components/TeamFormation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, Trophy, Target, Clock, MapPin, Code, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

const YouthHackathon = () => {
  const hackathonInfo = {
    title: "Youth Hackathon 2025",
    date: "September 15-16, 2025",
    location: "Virtual Event",
    theme: "Building Tomorrow's Solutions",
    description: "Join hundreds of young innovators to build solutions that matter. Whether you're a beginner or experienced developer, this hackathon is your chance to create, collaborate, and compete.",
    prizes: [
      { place: "1st Place", amount: "$5,000", description: "Grand Prize + Mentorship" },
      { place: "2nd Place", amount: "$3,000", description: "Runner-up Prize" },
      { place: "3rd Place", amount: "$2,000", description: "Third Place Prize" }
    ],
    categories: [
      "AI & Machine Learning",
      "Sustainability & Environment",
      "Education Technology",
      "Healthcare Innovation",
      "Social Impact",
      "FinTech & Blockchain"
    ]
  };

  const stats = [
    { label: "Participants", value: "500+", icon: Users },
    { label: "Projects", value: "150+", icon: Code },
    { label: "Mentors", value: "50+", icon: Lightbulb },
    { label: "Hours", value: "48", icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.h1
              className="text-5xl md:text-6xl font-bold mb-6"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {hackathonInfo.title}
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl mb-8 opacity-90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {hackathonInfo.theme}
            </motion.p>
            <motion.div
              className="flex flex-wrap justify-center gap-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <Calendar className="w-5 h-5 mr-2" />
                {hackathonInfo.date}
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <MapPin className="w-5 h-5 mr-2" />
                {hackathonInfo.location}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-3 text-lg">
                Register Now
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="prizes">Prizes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Trophy className="w-5 h-5 mr-2 text-purple-600" />
                      About the Hackathon
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{hackathonInfo.description}</p>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Target className="w-4 h-4 mr-2 text-green-600" />
                        <span className="font-medium">Theme:</span> {hackathonInfo.theme}
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="font-medium">Date:</span> {hackathonInfo.date}
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-red-600" />
                        <span className="font-medium">Location:</span> {hackathonInfo.location}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Challenge Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-3">
                      {hackathonInfo.categories.map((category, index) => (
                        <motion.div
                          key={category}
                          className="flex items-center p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                        >
                          <div className="w-2 h-2 bg-purple-600 rounded-full mr-3" />
                          {category}
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="projects">
            <HackathonProjectManager />
          </TabsContent>

          <TabsContent value="teams">
            <TeamFormation />
          </TabsContent>

          <TabsContent value="prizes">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hackathonInfo.prizes.map((prize, index) => (
                <motion.div
                  key={prize.place}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                >
                  <Card className={`relative overflow-hidden ${
                    index === 0 ? 'ring-2 ring-yellow-400 shadow-xl' :
                    index === 1 ? 'ring-2 ring-gray-400' :
                    'ring-2 ring-orange-400'
                  }`}>
                    {index === 0 && (
                      <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-3 py-1 text-xs font-bold transform rotate-12 translate-x-2 -translate-y-1">
                        🏆 WINNER
                      </div>
                    )}
                    <CardHeader className="text-center">
                      <CardTitle className={`text-2xl ${
                        index === 0 ? 'text-yellow-600' :
                        index === 1 ? 'text-gray-600' :
                        'text-orange-600'
                      }`}>
                        {prize.place}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-2">{prize.amount}</div>
                      <p className="text-gray-600">{prize.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default YouthHackathon;
