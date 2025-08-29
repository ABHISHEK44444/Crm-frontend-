



import React from 'react';
import { NavItem, User, Role } from '../types';
import { DashboardIcon, CrmIcon, TendersIcon, FinanceIcon, UsersIcon, TargetIcon, BuildingIcon, ReportingIcon, ClipboardListIcon, ChevronLeftIcon, ChevronRightIcon } from '../constants';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  currentUser: User;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, currentUser, isSidebarCollapsed, setIsSidebarCollapsed }) => {
  const navItems: NavItem[] = [
    { name: 'Dashboard', icon: <DashboardIcon className="w-5 h-5" />, view: 'dashboard', roles: [Role.Admin, Role.Sales, Role.Viewer] },
    // { name: 'CRM', icon: <CrmIcon className="w-5 h-5" />, view: 'crm' },
    { name: 'Tenders', icon: <TendersIcon className="w-5 h-5" />, view: 'tenders', roles: [Role.Admin, Role.Viewer] },
    { name: 'My Tenders', icon: <TargetIcon className="w-5 h-5" />, view: 'my-feed', roles: [Role.Admin, Role.Sales, Role.Viewer] },
    { name: 'OEMs', icon: <BuildingIcon className="w-5 h-5" />, view: 'oems', roles: [Role.Admin, Role.Sales] },
    { name: 'Reporting', icon: <ReportingIcon className="w-5 h-5" />, view: 'reporting', roles: [Role.Admin, Role.Sales] },
    { name: 'SOPs', icon: <ClipboardListIcon className="w-5 h-5" />, view: 'processes', roles: [Role.Admin, Role.Sales] },
    { name: 'Finance', icon: <FinanceIcon className="w-5 h-5" />, view: 'finance', roles: [Role.Admin, Role.Finance] },
    { name: 'Admin', icon: <UsersIcon className="w-5 h-5" />, view: 'admin', roles: [Role.Admin] },
  ];

  const visibleNavItems = navItems.filter(item => !item.roles || item.roles.includes(currentUser.role));

  return (
    <div className={`bg-[#0d1117] text-gray-400 flex flex-col h-screen fixed border-r border-[#30363d] transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute top-6 -right-3.5 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 z-10 border border-slate-300/50 dark:border-slate-600/50 shadow-lg"
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
            {isSidebarCollapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
        </button>

      <div className="h-20 flex items-center px-6">
        <TendersIcon className="w-8 h-8 text-cyan-400 flex-shrink-0" />
        <h1 className={`text-xl font-bold ml-3 text-gray-100 whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
          M Intergraph
        </h1>
      </div>
      <nav className={`flex-1 py-4 ${isSidebarCollapsed ? 'px-2' : 'px-4'}`}>
        <ul>
          {visibleNavItems.map((item) => (
            <li key={item.name} className="relative group">
              <button
                onClick={() => setCurrentView(item.view)}
                className={`flex items-center w-full my-1 rounded-lg transition-colors duration-200 text-base py-3 ${ isSidebarCollapsed ? 'justify-center' : 'px-4'} ${
                  currentView === item.view
                    ? 'bg-white/10 text-white font-semibold'
                    : 'hover:bg-white/5 hover:text-white'
                }`}
                aria-label={isSidebarCollapsed ? item.name : undefined}
              >
                {item.icon}
                <span className={`whitespace-nowrap ml-4 transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>{item.name}</span>
              </button>
              {isSidebarCollapsed && (
                 <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-gray-900 border border-slate-700 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                    {item.name}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className={`border-t border-[#30363d] transition-all duration-300 ${isSidebarCollapsed ? 'h-0 p-0 overflow-hidden' : 'p-6 h-auto'}`}>
        <p className="text-sm text-gray-500">© 2024 M Intergraph Inc.</p>
      </div>
    </div>
  );
};

export default Sidebar;