import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  GraduationCap,
  CheckCircle,
  X,
  Eye,
  BarChart3,
  Calendar,
  AlertTriangle,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { TutorialSession, Diagram } from '@/types/diagram';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tutorial sessions for teacher
  const { data: tutorialSessions = [], isLoading: isLoadingSessions } = useQuery<TutorialSession[]>({
    queryKey: ['/api/tutorial-sessions'],
    enabled: user?.role === 'teacher',
  });

  // Fetch all diagrams for overview
  const { data: allDiagrams = [] } = useQuery<Diagram[]>({
    queryKey: ['/api/diagrams/all'],
    enabled: user?.role === 'teacher',
  });

  // Tutorial session approval mutation
  const approveSessionMutation = useMutation({
    mutationFn: async ({ sessionId, approve }: { sessionId: string; approve: boolean }) => {
      const response = await apiRequest('PUT', `/api/tutorial-sessions/${sessionId}`, {
        status: approve ? 'approved' : 'rejected',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tutorial-sessions'] });
      toast({
        title: 'Session Updated',
        description: 'Tutorial session status has been updated.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update session status.',
        variant: 'destructive',
      });
    },
  });

  const pendingSessions = tutorialSessions.filter((session: any) => session.status === 'pending');
  const activeSessions = tutorialSessions.filter((session: any) => session.status === 'approved');
  const completedSessions = tutorialSessions.filter((session: any) => session.status === 'completed');

  const handleApproveSession = (sessionId: string, approve: boolean) => {
    approveSessionMutation.mutate({ sessionId, approve });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning text-white';
      case 'approved':
        return 'bg-success text-white';
      case 'rejected':
        return 'bg-error text-white';
      case 'completed':
        return 'bg-primary text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Mock analytics data (in real app, this would come from API)
  const analyticsData = {
    totalStudents: 24,
    activeTutorials: activeSessions.length,
    completionRate: 85,
    commonIssues: [
      { issue: 'Missing actor connections', count: 12 },
      { issue: 'Unclear use case names', count: 8 },
      { issue: 'Orphaned elements', count: 6 },
    ]
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <TopBar
          title="Teacher Dashboard"
          subtitle="Review student progress and manage tutorial sessions"
          showTutorialButton={false}
          showSaveButton={false}
        />

        <div className="flex-1 p-6 bg-neutral">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-text-secondary">Total Students</p>
                      <p className="text-2xl font-bold">{analyticsData.totalStudents}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-warning" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-text-secondary">Pending Requests</p>
                      <p className="text-2xl font-bold">{pendingSessions.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-success" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-text-secondary">Active Tutorials</p>
                      <p className="text-2xl font-bold">{analyticsData.activeTutorials}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-accent" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-text-secondary">Completion Rate</p>
                      <p className="text-2xl font-bold">{analyticsData.completionRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="requests" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="requests">Tutorial Requests</TabsTrigger>
                <TabsTrigger value="active">Active Sessions</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
              </TabsList>

              {/* Tutorial Requests */}
              <TabsContent value="requests">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Tutorial Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pendingSessions.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                        <h3 className="font-medium text-text-primary mb-2">No pending requests</h3>
                        <p className="text-sm text-text-secondary">
                          All tutorial requests have been reviewed
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Diagram</TableHead>
                            <TableHead>Request Date</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingSessions.map((session: any) => (
                            <TableRow key={session.id}>
                              <TableCell className="font-medium">
                                Student {session.studentId}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <BookOpen className="h-4 w-4 text-text-secondary" />
                                  <span>Diagram {session.diagramId}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {new Date(session.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {session.requestMessage || 'No message provided'}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {/* TODO: View diagram */}}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveSession(session.id, true)}
                                    disabled={approveSessionMutation.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleApproveSession(session.id, false)}
                                    disabled={approveSessionMutation.isPending}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Active Sessions */}
              <TabsContent value="active">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Tutorial Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activeSessions.length === 0 ? (
                      <div className="text-center py-8">
                        <GraduationCap className="h-12 w-12 text-text-secondary mx-auto mb-4" />
                        <h3 className="font-medium text-text-primary mb-2">No active sessions</h3>
                        <p className="text-sm text-text-secondary">
                          No tutorial sessions are currently in progress
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activeSessions.map((session: any) => (
                          <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">Student {session.studentId}</h4>
                                <p className="text-sm text-text-secondary">
                                  Tutorial approved {new Date(session.updatedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={getStatusColor(session.status)}>
                                  {session.status}
                                </Badge>
                                <Button size="sm" variant="outline">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Progress
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics */}
              <TabsContent value="analytics">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Common Issues</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsData.commonIssues.map((issue, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <AlertTriangle className="h-4 w-4 text-warning" />
                              <span className="text-sm">{issue.issue}</span>
                            </div>
                            <Badge variant="outline">{issue.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Student Progress Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">Completed Assignments</span>
                          <span className="font-medium">18/24</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">Average Score</span>
                          <span className="font-medium">87%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">Tutorial Requests</span>
                          <span className="font-medium">{tutorialSessions.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Assignments */}
              <TabsContent value="assignments">
                <Card>
                  <CardHeader>
                    <CardTitle>Assignment Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-text-secondary mx-auto mb-4" />
                      <h3 className="font-medium text-text-primary mb-2">Assignment Management</h3>
                      <p className="text-sm text-text-secondary">
                        Assignment creation and management features coming soon
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
