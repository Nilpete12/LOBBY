import { LayoutDashboard, Users, Car, Settings, LogOut, X, MessagesSquare } from 'lucide-react';

export default function Sidebar({ isOpen, onClose, activeTab, setActiveTab, onLogout }) {
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'riders',    label: 'Riders',    icon: Users },
    { id: 'drivers',   label: 'Drivers',   icon: Car },
    { id: 'complaints', label: 'Complaints', icon: MessagesSquare },
    { id: 'settings',  label: 'Settings',  icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose}></div>}

      {/* Sidebar Container */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}>
        
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
          <span className="text-xl font-black tracking-tighter">THE LOBBY<span className="text-blue-500">.</span></span>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
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
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
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