import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Plus, UserMinus, Crown, MessageCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  skills: string[];
  role: 'Leader' | 'Member';
  status: 'Active' | 'Pending' | 'Inactive';
}

interface Team {
  id: string;
  name: string;
  description: string;
  projectId?: string;
  members: TeamMember[];
  maxSize: number;
  createdAt: string;
  status: 'Forming' | 'Complete' | 'Active';
}

const TeamFormation = () => {
  const [teams, setTeams] = useState<Team[]>([
    {
      id: '1',
      name: 'AI Innovators',
      description: 'Building the next generation of AI-powered applications',
      maxSize: 4,
      members: [
        {
          id: '1',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          skills: ['React', 'Python', 'Machine Learning'],
          role: 'Leader',
          status: 'Active'
        },
        {
          id: '2',
          name: 'Bob Smith',
          email: 'bob@example.com',
          skills: ['Node.js', 'AI', 'Data Science'],
          role: 'Member',
          status: 'Active'
        }
      ],
      createdAt: '2025-08-29',
      status: 'Forming'
    }
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [newTeam, setNewTeam] = useState<Partial<Team>>({
    name: '',
    description: '',
    maxSize: 4,
    members: [],
    status: 'Forming'
  });

  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    name: '',
    email: '',
    skills: [],
    role: 'Member',
    status: 'Pending'
  });

  const handleCreateTeam = () => {
    if (newTeam.name && newTeam.description) {
      const team: Team = {
        id: Date.now().toString(),
        name: newTeam.name,
        description: newTeam.description,
        maxSize: newTeam.maxSize || 4,
        members: [],
        createdAt: new Date().toISOString().split('T')[0],
        status: 'Forming'
      };
      setTeams([...teams, team]);
      setNewTeam({
        name: '',
        description: '',
        maxSize: 4,
        members: [],
        status: 'Forming'
      });
      setIsCreateDialogOpen(false);
    }
  };

  const handleAddMember = (teamId: string) => {
    if (newMember.name && newMember.email) {
      const member: TeamMember = {
        id: Date.now().toString(),
        name: newMember.name,
        email: newMember.email,
        skills: newMember.skills || [],
        role: 'Member',
        status: 'Pending'
      };

      setTeams(teams.map(team =>
        team.id === teamId
          ? { ...team, members: [...team.members, member] }
          : team
      ));

      setNewMember({
        name: '',
        email: '',
        skills: [],
        role: 'Member',
        status: 'Pending'
      });
    }
  };

  const handleRemoveMember = (teamId: string, memberId: string) => {
    setTeams(teams.map(team =>
      team.id === teamId
        ? { ...team, members: team.members.filter(member => member.id !== memberId) }
        : team
    ));
  };

  const handlePromoteToLeader = (teamId: string, memberId: string) => {
    setTeams(teams.map(team =>
      team.id === teamId
        ? {
            ...team,
            members: team.members.map(member =>
              member.id === memberId
                ? { ...member, role: 'Leader' }
                : member.role === 'Leader'
                ? { ...member, role: 'Member' }
                : member
            )
          }
        : team
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Forming': return 'bg-blue-100 text-blue-800';
      case 'Complete': return 'bg-green-100 text-green-800';
      case 'Active': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Leader': return 'bg-yellow-100 text-yellow-800';
      case 'Member': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMemberStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-orange-100 text-orange-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Team Formation</h2>
          <p className="text-gray-600 mt-2">Create and manage hackathon teams</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={newTeam.name || ''}
                  onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <Label htmlFor="teamDescription">Description</Label>
                <Textarea
                  id="teamDescription"
                  value={newTeam.description || ''}
                  onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
                  placeholder="Describe your team"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="maxSize">Max Team Size</Label>
                <Input
                  id="maxSize"
                  type="number"
                  min="2"
                  max="10"
                  value={newTeam.maxSize || 4}
                  onChange={(e) => setNewTeam({...newTeam, maxSize: parseInt(e.target.value)})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTeam}>
                  Create Team
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teams.map((team, index) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{team.name}</CardTitle>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className={getStatusColor(team.status)}>
                        {team.status}
                      </Badge>
                      <Badge variant="outline">
                        {team.members.length}/{team.maxSize} members
                      </Badge>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Team Member</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="memberName">Name</Label>
                          <Input
                            id="memberName"
                            value={newMember.name || ''}
                            onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                            placeholder="Enter member name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="memberEmail">Email</Label>
                          <Input
                            id="memberEmail"
                            type="email"
                            value={newMember.email || ''}
                            onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                            placeholder="Enter email address"
                          />
                        </div>
                        <div>
                          <Label htmlFor="memberSkills">Skills (comma-separated)</Label>
                          <Input
                            id="memberSkills"
                            value={newMember.skills?.join(', ') || ''}
                            onChange={(e) => setNewMember({...newMember, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                            placeholder="React, Python, Design"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setNewMember({ name: '', email: '', skills: [], role: 'Member', status: 'Pending' })}>
                            Cancel
                          </Button>
                          <Button onClick={() => handleAddMember(team.id)}>
                            Add Member
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{team.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Users className="w-4 h-4 mr-2" />
                    Team Members
                  </div>

                  {team.members.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No members yet</p>
                  ) : (
                    <div className="space-y-3">
                      {team.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-sm">{member.name}</p>
                                <Badge className={getRoleColor(member.role)} variant="outline">
                                  {member.role === 'Leader' && <Crown className="w-3 h-3 mr-1" />}
                                  {member.role}
                                </Badge>
                                <Badge className={getMemberStatusColor(member.status)} variant="outline">
                                  {member.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-500">{member.email}</p>
                              {member.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {member.skills.slice(0, 3).map((skill, skillIndex) => (
                                    <Badge key={skillIndex} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            {member.role !== 'Leader' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePromoteToLeader(team.id, member.id)}
                                title="Promote to Leader"
                              >
                                <Crown className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(team.id, member.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Remove Member"
                            >
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Teams Yet</h3>
          <p className="text-gray-500 mb-4">Create your first team to start collaborating</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Team
          </Button>
        </div>
      )}
    </div>
  );
};

export default TeamFormation;
