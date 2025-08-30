import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Users, Calendar, Trophy, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  maxTeamSize: number;
  technologies: string[];
  status: 'Open' | 'In Progress' | 'Completed';
  createdAt: string;
}

const HackathonProjectManager = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      title: 'AI-Powered News Aggregator',
      description: 'Build an intelligent news aggregator that uses AI to categorize and summarize news articles based on user preferences.',
      category: 'AI/ML',
      difficulty: 'Intermediate',
      maxTeamSize: 4,
      technologies: ['React', 'Python', 'TensorFlow', 'FastAPI'],
      status: 'Open',
      createdAt: '2025-08-29'
    },
    {
      id: '2',
      title: 'Sustainable Living Tracker',
      description: 'Create an app that helps users track their carbon footprint and suggests ways to live more sustainably.',
      category: 'Mobile',
      difficulty: 'Beginner',
      maxTeamSize: 3,
      technologies: ['React Native', 'Node.js', 'MongoDB'],
      status: 'In Progress',
      createdAt: '2025-08-28'
    }
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: '',
    description: '',
    category: '',
    difficulty: 'Beginner',
    maxTeamSize: 2,
    technologies: [],
    status: 'Open'
  });

  const categories = ['AI/ML', 'Web Development', 'Mobile', 'IoT', 'Blockchain', 'Data Science'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const statuses = ['Open', 'In Progress', 'Completed'];

  const handleCreateProject = () => {
    if (newProject.title && newProject.description && newProject.category) {
      const project: Project = {
        id: Date.now().toString(),
        title: newProject.title,
        description: newProject.description,
        category: newProject.category,
        difficulty: newProject.difficulty as Project['difficulty'],
        maxTeamSize: newProject.maxTeamSize || 2,
        technologies: newProject.technologies || [],
        status: newProject.status as Project['status'],
        createdAt: new Date().toISOString().split('T')[0]
      };
      setProjects([...projects, project]);
      setNewProject({
        title: '',
        description: '',
        category: '',
        difficulty: 'Beginner',
        maxTeamSize: 2,
        technologies: [],
        status: 'Open'
      });
      setIsCreateDialogOpen(false);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setNewProject(project);
    setIsCreateDialogOpen(true);
  };

  const handleUpdateProject = () => {
    if (editingProject && newProject.title && newProject.description && newProject.category) {
      const updatedProject: Project = {
        ...editingProject,
        title: newProject.title,
        description: newProject.description,
        category: newProject.category,
        difficulty: newProject.difficulty as Project['difficulty'],
        maxTeamSize: newProject.maxTeamSize || 2,
        technologies: newProject.technologies || [],
        status: newProject.status as Project['status']
      };
      setProjects(projects.map(p => p.id === editingProject.id ? updatedProject : p));
      setEditingProject(null);
      setNewProject({
        title: '',
        description: '',
        category: '',
        difficulty: 'Beginner',
        maxTeamSize: 2,
        technologies: [],
        status: 'Open'
      });
      setIsCreateDialogOpen(false);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-orange-100 text-orange-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Hackathon Project Manager</h2>
          <p className="text-gray-600 mt-2">Create and manage hackathon projects for teams to work on</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={newProject.title || ''}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                  placeholder="Enter project title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProject.description || ''}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  placeholder="Describe the project"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newProject.category} onValueChange={(value) => setNewProject({...newProject, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={newProject.difficulty} onValueChange={(value) => setNewProject({...newProject, difficulty: value as Project['difficulty']})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map(difficulty => (
                        <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxTeamSize">Max Team Size</Label>
                  <Input
                    id="maxTeamSize"
                    type="number"
                    min="1"
                    max="10"
                    value={newProject.maxTeamSize || 2}
                    onChange={(e) => setNewProject({...newProject, maxTeamSize: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newProject.status} onValueChange={(value) => setNewProject({...newProject, status: value as Project['status']})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="technologies">Technologies (comma-separated)</Label>
                <Input
                  id="technologies"
                  value={newProject.technologies?.join(', ') || ''}
                  onChange={(e) => setNewProject({...newProject, technologies: e.target.value.split(',').map(t => t.trim()).filter(t => t)})}
                  placeholder="React, Node.js, Python"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={editingProject ? handleUpdateProject : handleCreateProject}>
                  {editingProject ? 'Update' : 'Create'} Project
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{project.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className={getDifficultyColor(project.difficulty)}>
                        {project.difficulty}
                      </Badge>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProject(project)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <Target className="w-4 h-4 mr-2" />
                    {project.category}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-2" />
                    Max {project.maxTeamSize} members
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    Created {project.createdAt}
                  </div>
                  
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {project.technologies.slice(0, 3).map((tech, techIndex) => (
                        <Badge key={techIndex} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.technologies.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Projects Yet</h3>
          <p className="text-gray-500 mb-4">Create your first hackathon project to get started</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Project
          </Button>
        </div>
      )}
    </div>
  );
};

export default HackathonProjectManager;
