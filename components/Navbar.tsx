import React from 'react';
import { AppView } from '../types';
import { PhotoIcon } from './icons/PhotoIcon';
import { ThumbnailIcon } from './icons/ThumbnailIcon';
import { VideoIcon } from './icons/VideoIcon';
import { CartoonIcon } from './icons/CartoonIcon';
import { TemplateIcon } from './icons/TemplateIcon';

interface NavbarProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
}

interface NavItem {
    view: AppView;
    label: string;
    icon: React.ReactNode;
    disabled?: boolean;
}

const navItems: NavItem[] = [
    { view: AppView.PHOTO, label: 'Photo Editor', icon: <PhotoIcon /> },
    { view: AppView.VIDEO, label: 'Video Editor', icon: <VideoIcon /> },
    { view: AppView.CARTOON, label: 'Cartoon Gen', icon: <CartoonIcon /> },
    { view: AppView.THUMBNAIL, label: 'Thumbnails', icon: <ThumbnailIcon /> },
    { view: AppView.TEMPLATES, label: 'Templates', icon: <TemplateIcon /> },
];

const NavButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    disabled?: boolean;
}> = ({ label, isActive, onClick, icon, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-400
        ${
            isActive
            ? 'bg-cyan-500/10 text-cyan-300'
            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
    >
        {icon}
        <span>{label}</span>
        {isActive && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_theme(colors.cyan.400)]"></div>}
    </button>
)

export const Navbar: React.FC<NavbarProps> = ({ activeView, setActiveView }) => {
  return (
    <header className="sticky top-0 z-50 p-4">
        <div className="container mx-auto bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-2 flex items-center justify-between shadow-2xl shadow-black/30">
            <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 px-2 font-orbitron">
                    SloopNodge AI Suite
                </h1>
            </div>
            <nav className="flex items-center gap-2">
                {navItems.map(item => (
                    <NavButton
                        key={item.view}
                        label={item.label}
                        icon={item.icon}
                        isActive={activeView === item.view}
                        onClick={() => setActiveView(item.view)}
                        disabled={item.disabled}
                    />
                ))}
            </nav>
        </div>
    </header>
  );
};
