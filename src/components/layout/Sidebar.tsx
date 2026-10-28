import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Shirt,
  Compass,
  CalendarDays,
  Wand2,
  CloudSun,
  Image as ImageIcon,
  Settings
} from 'lucide-react';

export function ModernSidebar() {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Overview', path: '/overview' },
    { icon: Shirt, label: 'Wardrobe', path: '/wardrobe' },
    { icon: Compass, label: 'Discover', path: '/discover' },
    { icon: CalendarDays, label: 'Planner', path: '/planner' },
    { icon: Wand2, label: 'Try On', path: '/builder' },
    { icon: CloudSun, label: 'Weather', path: '/weather' },
    { icon: ImageIcon, label: 'Lookbook', path: '/lookbook' },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-[80px] xl:w-[240px] flex flex-col items-center xl:items-start bg-surface border-r border-border-light py-8 transition-all duration-300">

      {/* Logo Area - Optimized to fit exactly without cutting off */}
      <div className="flex items-center gap-2.5 px-4 mb-12 w-full">
        <div className="w-10 h-10 shrink-0 bg-ink text-white rounded-2xl flex items-center justify-center shadow-md">
          <Shirt size={20} />
        </div>
        <span className="hidden xl:block font-serif text-lg text-ink font-bold tracking-tight whitespace-nowrap">
          SmartWardrobe
        </span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 w-full px-3 xl:px-4 space-y-2 overflow-y-auto hide-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-3 xl:px-4 py-3.5 rounded-2xl transition-all duration-200 group ${isActive
                  ? 'bg-ink text-white shadow-md shadow-ink/10'
                  : 'text-ink-muted hover:bg-ivory hover:text-ink'
                }`}
            >
              <item.icon size={22} className={isActive ? 'text-white shrink-0' : 'text-ink-muted shrink-0 group-hover:text-ink transition-colors'} strokeWidth={isActive ? 2 : 1.5} />
              <span className={`hidden xl:block text-sm font-medium whitespace-nowrap ${isActive ? 'text-white' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Settings Footer */}
      <div className="w-full px-3 xl:px-4 mt-auto pt-4">
        <Link
          to="/settings"
          className={`flex items-center gap-4 px-3 xl:px-4 py-3.5 rounded-2xl transition-all duration-200 group ${location.pathname === '/settings'
              ? 'bg-ink text-white shadow-md shadow-ink/10'
              : 'text-ink-muted hover:bg-ivory hover:text-ink'
            }`}
        >
          <Settings size={22} className={location.pathname === '/settings' ? 'text-white shrink-0' : 'text-ink-muted shrink-0 group-hover:text-ink transition-colors'} strokeWidth={1.5} />
          <span className={`hidden xl:block text-sm font-medium whitespace-nowrap ${location.pathname === '/settings' ? 'text-white' : ''}`}>
            Settings
          </span>
        </Link>
      </div>
    </aside>
  );
}