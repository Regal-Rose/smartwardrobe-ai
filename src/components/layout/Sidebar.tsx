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

export function Sidebar() {
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
    <aside className="fixed inset-y-0 left-0 z-50 w-[80px] xl:w-[240px] flex flex-col items-center xl:items-start bg-[#F4EBD9] border-r border-[#3B1011]/20 py-8 transition-all duration-300 relative overflow-hidden font-sans">

      {/* Subtle Texture Overlay */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .sidebar-noise {
          position: absolute;
          inset: 0;
          opacity: 0.05;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `}} />
      <div className="sidebar-noise z-0"></div>

      {/* Logo Area */}
      <div className="flex items-center gap-2.5 px-4 mb-12 w-full relative z-10">
        <div className="w-10 h-10 shrink-0 bg-[#3B1011] text-[#FDFBF7] rounded-xl flex items-center justify-center shadow-lg border border-[#7B2C2D]/30 transition-transform hover:scale-105 cursor-pointer">
          <Shirt size={20} />
        </div>
        <span className="hidden xl:block font-serif text-lg text-[#3B1011] font-bold tracking-tight whitespace-nowrap">
          SmartWardrobe
        </span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 w-full px-3 xl:px-4 space-y-2 overflow-y-auto hide-scrollbar relative z-10">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-3 xl:px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
                ? 'bg-[#3B1011] shadow-lg shadow-[#3B1011]/20 border border-[#5C1A1B]'
                : 'bg-transparent hover:bg-[#EADDC5] border border-transparent hover:border-[#3B1011]/10'
                }`}
            >
              {/* Active State Indicator Dot */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#7B2C2D] rounded-r-full"></div>
              )}

              <item.icon
                size={22}
                className={isActive ? 'text-[#FDFBF7] shrink-0' : 'text-[#5C1A1B]/70 shrink-0 group-hover:text-[#3B1011] transition-colors'}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span className={`hidden xl:block text-xs font-bold tracking-[0.1em] uppercase whitespace-nowrap ${isActive ? 'text-[#FDFBF7]' : 'text-[#3B1011]/70 group-hover:text-[#3B1011]'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Settings Footer */}
      <div className="w-full px-3 xl:px-4 mt-auto pt-4 relative z-10 border-t border-[#3B1011]/10">
        <Link
          to="/settings"
          className={`flex items-center gap-4 px-3 xl:px-4 py-3.5 rounded-xl transition-all duration-300 group ${location.pathname === '/settings'
            ? 'bg-[#3B1011] shadow-lg border border-[#5C1A1B]'
            : 'bg-transparent hover:bg-[#EADDC5] border border-transparent hover:border-[#3B1011]/10'
            }`}
        >
          <Settings
            size={22}
            className={location.pathname === '/settings' ? 'text-[#FDFBF7] shrink-0' : 'text-[#5C1A1B]/70 shrink-0 group-hover:text-[#3B1011] transition-colors'}
            strokeWidth={1.5}
          />
          <span className={`hidden xl:block text-xs font-bold tracking-[0.1em] uppercase whitespace-nowrap ${location.pathname === '/settings' ? 'text-[#FDFBF7]' : 'text-[#3B1011]/70 group-hover:text-[#3B1011]'}`}>
            Settings
          </span>
        </Link>
      </div>
    </aside>
  );
}