"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Users,
  BookOpen,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  // Fetch user diagrams
  const { data: diagrams = [] } = useQuery<any[]>({
    queryKey: ['/api/diagrams'],
    enabled: !!user,
  });

  // Fetch tutorial sessions
  const { data: tutorialSessions = [] } = useQuery<any[]>({
    queryKey: ['/api/tutorial-sessions'],
    enabled: !!user,
  });

  // Fetch notifications
  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-success text-white';
      case 'pending':
        return 'bg-warning text-white';
      case 'rejected':
        return 'bg-error text-white';
      case 'draft':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getProgressValue = (diagrams: any[]) => {
    if (diagrams.length === 0) return 0;
    const completed = diagrams.filter(d => d.status === 'submitted' || d.status === 'approved').length;
    return (completed / diagrams.length) * 100;
  };

  const recentDiagrams = diagrams
    .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const pendingTutorials = tutorialSessions.filter((session: any) => session.status === 'pending');
  const unreadNotifications = notifications.filter((notif: any) => !notif.read);

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <TopBar
          title={`Welcome back, ${user?.name}`}
          subtitle="Here's what's happening with your UML modeling"
          showTutorialButton={false}
          showSaveButton={false}
          notificationCount={unreadNotifications.length}
        />

        <div className="flex-1 p-6 bg-neutral">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-text-secondary">Total Diagrams</p>
                      <p className="text-2xl font-bold">{diagrams.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-warning" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-text-secondary">Pending Tutorials</p>
                      <p className="text-2xl font-bold">{pendingTutorials.length}</p>
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
                      <p className="text-sm font-medium text-text-secondary">Completed</p>
                      <p className="text-2xl font-bold">
                        {diagrams.filter((d: any) => d.status === 'approved').length}
                      </p>
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
                      <p className="text-sm font-medium text-text-secondary">Progress</p>
                      <p className="text-2xl font-bold">{Math.round(getProgressValue(diagrams))}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Diagrams */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Diagrams</CardTitle>
                    <Button size="sm" onClick={() => router.push('/editor/usecase')}>
                      <Plus className="mr-2 h-4 w-4" />
                      New Diagram
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {recentDiagrams.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="h-8 w-8 text-text-secondary" />
                        </div>
                        <h3 className="font-medium text-text-primary mb-2">No diagrams yet</h3>
                        <p className="text-sm text-text-secondary mb-4">
                          Create your first UML diagram to get started
                        </p>
                        <Button onClick={() => router.push('/editor/usecase')}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Diagram
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentDiagrams.map((diagram: any) => (
                          <div
                            key={diagram.id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => router.push(`/editor/${diagram.type}?id=${diagram.id}`)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                {diagram.type === 'usecase' && '⭕'}
                                {diagram.type === 'ssd' && '📊'}
                                {diagram.type === 'description' && '📝'}
                              </div>
                              <div>
                                <h4 className="font-medium">{diagram.title}</h4>
                                <p className="text-sm text-text-secondary">
                                  Updated {new Date(diagram.updatedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(diagram.status)}>
                                {diagram.status}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {diagram.type}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Content */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => router.push('/editor/usecase')}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Create Use Case Diagram
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => router.push('/editor/description')}
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Write Use Case Description
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => router.push('/editor/ssd')}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Create Sequence Diagram
                    </Button>
                  </CardContent>
                </Card>

                {/* Tutorial Status */}
                {user?.role === 'student' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tutorial Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {pendingTutorials.length === 0 ? (
                        <div className="text-center py-4">
                          <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                          <p className="text-sm text-text-secondary">
                            No pending tutorial requests
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {pendingTutorials.slice(0, 3).map((session: any) => (
                            <div key={session.id} className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-warning" />
                                <span className="text-sm font-medium">Tutorial Pending</span>
                              </div>
                              <p className="text-xs text-text-secondary mt-1">
                                Requested {new Date(session.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Recent Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Notifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {unreadNotifications.length === 0 ? (
                      <div className="text-center py-4">
                        <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                        <p className="text-sm text-text-secondary">
                          No new notifications
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {unreadNotifications.slice(0, 3).map((notification: any) => (
                          <div key={notification.id} className="p-2 bg-primary/10 border border-primary/20 rounded">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-xs text-text-secondary">{notification.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
