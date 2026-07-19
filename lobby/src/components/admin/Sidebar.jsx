"use client";
import {
  Activity,
  BarChart3,
  BookOpenCheck,
  Car,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  MessagesSquare,
  Settings,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, activeTab, setActiveTab, onLogout, badges = {} }) {
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pilot', label: 'Pilot Readiness', icon: ClipboardCheck },
    { id: 'verifications', label: 'Verifications', icon: ShieldCheck },
    { id: 'bookings', label: 'Bookings', icon: BookOpenCheck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'riders',    label: 'Riders',    icon: Users },
    { id: 'drivers',   label: 'Drivers',   icon: Car },
    { id: 'complaints', label: 'Complaints', icon: MessagesSquare },
    { id: 'activity', label: 'Activity Log', icon: Activity },
    { id: 'settings',  label: 'Settings',  icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose}></div>}

      {/* Sidebar Container */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white text-slate-950 transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}>
        
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
          <span className="text-xl font-black tracking-tighter">THE LOBBY<span className="text-[#1A73E8]">.</span></span>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-950">
            <X size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-6 px-3 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); onClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium text-sm ${
                activeTab === item.id 
                  ? 'bg-[#E8F0FE] text-[#1A73E8] shadow-sm'
                  : 'text-slate-600 hover:bg-[#F1F3F4] hover:text-slate-950'
              }`}
            >
              <item.icon size={20} />
              <span className="flex-1 text-left">{item.label}</span>
              {badges[item.id] > 0 && (
                <span className="min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-black text-white">
                  {badges[item.id]}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition font-medium text-sm"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
