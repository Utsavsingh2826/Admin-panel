import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white/80 px-6 py-4 text-sm text-slate-500 backdrop-blur transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium text-slate-600 dark:text-slate-300">© {currentYear} Jewelry Admin Dashboard</p>
          <p className="text-xs">Crafted for premium retail operations and customer excellence.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            System Healthy
          </div>
          <span>Version 1.0.0</span>
          <a
            href="#"
            className="transition hover:text-teal-600 dark:hover:text-teal-300"
          >
            Release Notes
          </a>
          <a
            href="#"
            className="transition hover:text-teal-600 dark:hover:text-teal-300"
          >
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

