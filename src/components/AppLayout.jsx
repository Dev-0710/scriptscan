import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, MonitorPlay, BarChart2, Zap, User, Loader2, Menu, X } from 'lucide-react';
import { useDocumentContext } from '../context/DocumentContext';

export default function AppLayout() {
  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'Workspace', path: '/workspace', icon: MonitorPlay },
    { name: 'Batch & Analytics', path: '/batch', icon: BarChart2 },
  ];

  const { setDocuments } = useDocumentContext();
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLaunchBatch = () => {
    setIsBatchRunning(true);
    setTimeout(() => {
      setDocuments(prev => prev.map(doc => {
        if (doc.status !== 'Completed') {
          return {
            ...doc,
            status: 'Completed',
            confidence: (95 + Math.random() * 4).toFixed(1)
          };
        }
        return doc;
      }));
      setIsBatchRunning(false);
    }, 2000);
  };

  return (
    <div className="h-screen w-screen flex flex-col font-sans bg-gray-50 overflow-hidden">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 shrink-0 z-50">
        <div className="flex items-center justify-between px-3 sm:px-4 h-14">
          {/* Logo */}
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg shrink-0">
            <Zap className="w-5 h-5 fill-current" />
            <span className="hidden xs:inline sm:inline">ScriptScan AI</span>
            <span className="xs:hidden sm:hidden">ScriptScan</span>
          </div>

          {/* Desktop: project selector + nav */}
          <div className="hidden md:flex items-center gap-2 border-l pl-4 border-gray-200 text-sm ml-4">
            <span className="text-gray-500">Project:</span>
            <select className="bg-transparent font-medium focus:outline-none cursor-pointer">
              <option>Default Corpus</option>
            </select>
            <div className="flex items-center gap-1.5 ml-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium border border-green-100">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              Operational
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center h-full ml-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 lg:px-4 h-full text-sm font-medium transition-colors border-b-2 ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                      : 'border-transparent text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden lg:inline">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 ml-3">
            {/* Engine badge — hidden on mobile */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              CNN+CTC
            </div>

            {/* Launch Batch — icon-only on small screens */}
            <button
              onClick={handleLaunchBatch}
              disabled={isBatchRunning}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-2 ${isBatchRunning ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isBatchRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span className="hidden sm:inline">{isBatchRunning ? 'Processing...' : 'Launch Batch'}</span>
              <span className="sm:hidden">{isBatchRunning ? '...' : 'Run'}</span>
            </button>

            {/* User avatar */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center hover:bg-indigo-200 transition-colors"
              >
                <User className="w-4 h-4" />
              </button>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <p className="text-sm font-semibold text-gray-900">Research Admin</p>
                      <p className="text-xs text-gray-500 truncate">admin@scriptscan.ai</p>
                    </div>
                    <div className="py-1">
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700" onClick={() => setShowUserMenu(false)}>Profile Settings</button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700" onClick={() => setShowUserMenu(false)}>Manage API Keys</button>
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50" onClick={() => setShowUserMenu(false)}>Log Out</button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-1.5 rounded text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {mobileNavOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[60]" onClick={() => setMobileNavOpen(false)} />
          <div className="fixed top-0 left-0 h-full w-72 bg-white z-[70] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
                <Zap className="w-5 h-5 fill-current" />
                ScriptScan AI
              </div>
              <button onClick={() => setMobileNavOpen(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Project info */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2 text-sm">
              <span className="text-gray-500">Project:</span>
              <span className="font-medium text-gray-900">Default Corpus</span>
              <div className="flex items-center gap-1 ml-auto bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium border border-green-100">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                Online
              </div>
            </div>

            <nav className="flex-1 py-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-indigo-600 bg-indigo-50 border-r-4 border-indigo-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              ))}
            </nav>

            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
              Engine: CNN+CTC • v2.4-online
            </div>
          </div>
        </>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        <Outlet />
      </main>

      {/* Bottom Status Bar */}
      <footer className="bg-white border-t border-gray-200 h-8 flex items-center justify-between px-3 sm:px-4 text-xs text-gray-500 shrink-0 z-50 overflow-hidden">
        <div className="flex items-center gap-3 sm:gap-6 overflow-hidden">
          <span className="shrink-0">42ms/seg</span>
          <span className="hidden sm:inline shrink-0">CER: 1.2%</span>
          <span className="hidden sm:inline shrink-0">WER: 2.8%</span>
          <span className="hidden md:inline shrink-0">API: v2.4-online</span>
        </div>
        <div className="hidden sm:block truncate text-right">
          © 2026 ScriptScan AI. All systems operational.
        </div>
      </footer>
    </div>
  );
}
