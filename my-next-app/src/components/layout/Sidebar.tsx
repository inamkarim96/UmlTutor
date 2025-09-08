'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  Kanban as DiagramIcon, 
  AlignLeft, 
  Map, 
  GraduationCap, 
  Upload, 
  BarChart3,
  User,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    const current = pathname ?? '/';
    if (path === '/' && current === '/') return true;
    if (path !== '/' && current.startsWith(path)) return true;
    return false;
  };

  const NavItem = ({ href, icon: Icon, children, badge }: {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
    badge?: string;
  }) => (
    <Link href={href} className={`sidebar-nav-item ${isActive(href) ? 'active' : ''}`}>
        <Icon className="text-sm" />
        <span className="text-sm">{children}</span>
        {badge && (
          <Badge variant="secondary" className="ml-auto bg-accent text-white text-xs">
            {badge}
          </Badge>
        )}
    </Link>
  );

  return (
    <div className="w-64 bg-white shadow-elevation-2 flex flex-col">
      {/* Logo and Title */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <DiagramIcon className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-text-primary">UMLTutor</h1>
            <p className="text-xs text-text-secondary">Intelligent Modeling</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="text-white text-sm" />
          </div>
          <div>
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-text-secondary capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        <NavItem href="/" icon={Home}>
          Dashboard
        </NavItem>
        
        <div className="pt-2">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Modeling Tools
          </p>
          <NavItem href="/editor/usecase" icon={DiagramIcon}>
            Use Case Diagrams
          </NavItem>
          <NavItem href="/editor/description" icon={AlignLeft}>
            Use Case Descriptions
          </NavItem>
          <NavItem href="/editor/ssd" icon={Map}>
            Sequence Diagrams
          </NavItem>
        </div>

        {user?.role === 'student' && (
          <div className="pt-4">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Learning
            </p>
            <NavItem href="/tutorial" icon={GraduationCap} badge="New">
              Tutorial Mode
            </NavItem>
            <NavItem href="/submit" icon={Upload}>
              Submit Assignment
            </NavItem>
            <NavItem href="/progress" icon={BarChart3}>
              Progress
            </NavItem>
          </div>
        )}

        {user?.role === 'teacher' && (
          <div className="pt-4">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Teaching
            </p>
            <NavItem href="/teacher" icon={BarChart3}>
              Teacher Dashboard
            </NavItem>
          </div>
        )}
      </nav>

      {/* Mode Selector */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs font-semibold text-text-secondary mb-2">Current Mode</p>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-secondary rounded-full"></div>
            <span className="text-sm font-medium">Development Mode</span>
          </div>
          <p className="text-xs text-text-secondary mt-1">Free modeling enabled</p>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-3 justify-start" 
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
