# Spark Community News 📰

An intelligent AI-powered news platform that brings real-time AI developments to your community with interactive surveys and comprehensive analytics.

![Spark Community News](https://img.shields.io/badge/React-18.2.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue) ![Vite](https://img.shields.io/badge/Vite-5.4.19-yellow) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-blue)

## 🌟 Features

### 📰 Real-Time AI News
- **Live News Integration**: Fetches real AI news from NewsAPI
- **AI-Powered Classification**: Uses Google Gemini LLM to categorize news by impact and topic
- **Dynamic Content**: Always up-to-date with the latest AI developments

### 📊 Interactive Surveys
- **AI Impact Assessment**: Test your understanding of AI developments
- **Real News Questions**: Surveys based on actual current events
- **Community Insights**: Track community sentiment on AI topics

### 📈 Analytics Dashboard
- **Performance Metrics**: View survey completion rates and accuracy scores
- **Category Breakdown**: Analyze news by topic areas (Healthcare, Employment, Privacy, etc.)
- **Data Visualization**: Interactive charts showing trends and insights
- **Demographics**: Community participation statistics

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark/Light Themes**: Beautiful gradient backgrounds and modern styling
- **Intuitive Navigation**: Clean, accessible interface with smooth transitions

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn/ui components
- **AI/ML**: Google Gemini LLM via LangChain
- **APIs**: NewsAPI for real-time news, Google Gemini for classification
- **Charts**: Recharts for data visualization
- **State Management**: React hooks with localStorage persistence
- **Build Tool**: Vite with esbuild for fast development

## 📋 Prerequisites

- Node.js 18+ and npm
- NewsAPI account and API key
- Google Gemini API key

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dip051030/spark-community-news.git
   cd spark-community-news
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   # NewsAPI Configuration
   NEXT_PUBLIC_NEWSAPI_KEY=your_newsapi_key_here

   # Google Gemini API Configuration
   NEXT_PUBLIC_GOOGLE_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:8081`

## 🔧 API Configuration

### NewsAPI Setup
1. Visit [NewsAPI](https://newsapi.org/) and create a free account
2. Get your API key from the dashboard
3. Add it to your `.env` file as `NEXT_PUBLIC_NEWSAPI_KEY`

### Google Gemini Setup
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file as `NEXT_PUBLIC_GOOGLE_API_KEY`

## 📖 Usage

### For Users
1. **Browse News**: Visit the News page to see AI developments classified by the AI
2. **Take Surveys**: Participate in the AI Impact Survey to test your knowledge
3. **View Analytics**: Check the Dashboard for community insights and trends

### For Developers
- **Development**: `npm run dev` - Start development server
- **Build**: `npm run build` - Create production build
- **Preview**: `npm run preview` - Preview production build locally

## 🏗️ Project Structure

```
spark-community-news/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Shadcn/ui components
│   │   ├── Navigation.tsx  # Main navigation
│   │   ├── DashboardStats.tsx
│   │   └── DemographicsChart.tsx
│   ├── pages/              # Main application pages
│   │   ├── Index.tsx       # Landing page
│   │   ├── News.tsx        # AI news display
│   │   ├── AIGame.tsx      # Interactive survey
│   │   ├── Dashboard.tsx   # Analytics dashboard
│   │   └── NotFound.tsx    # 404 page
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   └── assets/             # Static assets
├── public/                 # Public assets
├── dist/                   # Production build output
└── package.json            # Dependencies and scripts
```

## 🎯 Key Components

### News Classification System
The application uses Google Gemini LLM to classify news articles into categories like:
- Healthcare
- Employment
- Education
- Privacy
- Environment
- Social Justice

### Survey Logic
- Fetches real AI news articles
- Generates questions based on current developments
- Tracks user responses and accuracy
- Persists results for analytics

### Analytics Engine
- Calculates survey performance metrics
- Analyzes category distribution
- Provides demographic insights
- Visualizes trends with interactive charts

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Write clear, concise commit messages
- Test your changes thoroughly
- Update documentation as needed
- Ensure responsive design works on all devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NewsAPI** for providing real-time news data
- **Google Gemini** for AI-powered content classification
- **Shadcn/ui** for beautiful, accessible components
- **Tailwind CSS** for utility-first styling
- **LangChain** for streamlined LLM integration

## 📞 Support

If you have questions or need help:

- Open an issue on GitHub
- Check the documentation
- Review the code comments for implementation details

---

**Built with ❤️ for the AI community**
