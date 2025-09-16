import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart3, Newspaper, GamepadIcon, Target } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="hero-gradient shadow-elegant sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="text-3xl font-display font-bold text-primary-foreground tracking-tight">
            Spark Community News
          </Link>
          
          <div className="flex items-center space-x-2">
            <Link to="/">
              <Button
                variant={isActive('/') ? 'secondary' : 'ghost'}
                size="sm"
                className="transition-bounce"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            
            <Link to="/news">
              <Button
                variant={isActive('/news') ? 'secondary' : 'ghost'}
                size="sm"
                className="transition-bounce"
              >
                <Newspaper className="w-4 h-4 mr-2" />
                News
              </Button>
            </Link>
            
            <Link to="/ai-game">
              <Button
                variant={isActive('/ai-game') ? 'secondary' : 'ghost'}
                size="sm"
                className="transition-bounce"
              >
                <GamepadIcon className="w-4 h-4 mr-2" />
                Survey
              </Button>
            </Link>

            <Link to="/feed-chamber">
              <Button
                variant={isActive('/feed-chamber') ? 'secondary' : 'ghost'}
                size="sm"
                className="transition-bounce"
              >
                <Target className="w-4 h-4 mr-2" />
                Echo Chamber
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;