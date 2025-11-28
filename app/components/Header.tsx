'use client';

import Link from 'next/link';

const pageTitles: Record<string, string> = {
  '/': 'ホーム',
  '/dashboard': 'ダッシュボード',
  '/playground': 'Playground',
};

export function Header() {
  return (
    <header className="h-[48pt] p-4 flex items-center justify-left bg-gray-200 gap-16">
      <div className="flex m-4 items-center">
        <Link href="/" className="text-xl font-bold text-gray-800 hover:text-gray-600">
          大槌湾観測データベース
        </Link>
      </div>
      <nav className="flex m-4 gap-4">
        <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
          {pageTitles['/dashboard']}
        </Link>
        <Link href="/playground" className="text-gray-700 hover:text-gray-900">
          {pageTitles['/playground']}
        </Link>
      </nav>
    </header>
  );
}

