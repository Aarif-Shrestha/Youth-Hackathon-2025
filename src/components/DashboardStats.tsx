import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, Calendar, DollarSign, Activity } from 'lucide-react';

interface DashboardStatsProps {
  totalSurveys: number;
  totalResponses: number;
  correctPredictions: number;
  averageScore: string;
  recentSurveys?: number;
}

const DashboardStats = ({
  totalSurveys,
  totalResponses,
  correctPredictions,
  averageScore,
  recentSurveys = 0
}: DashboardStatsProps) => {
  const stats = [
    {
      title: 'Total Survey Responses',
      value: totalSurveys.toString(),
      icon: Users,
      change: '+18%',
      changeType: 'positive' as const,
    },
    {
      title: 'Recent Activity (7 days)',
      value: recentSurveys.toString(),
      icon: Activity,
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Average Score',
      value: `${averageScore}/6`,
      icon: Calendar,
      change: '+0.3',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Questions Answered',
      value: totalResponses.toString(),
      icon: MessageSquare,
      change: '+15%',
      changeType: 'positive' as const,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="card-gradient shadow-card interactive-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground font-sans">
                {stat.title}
              </CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-display font-bold text-foreground mb-2">{stat.value}</div>
              <p className="text-sm font-medium text-success flex items-center gap-1">
                <span className="text-success">↗</span>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats;