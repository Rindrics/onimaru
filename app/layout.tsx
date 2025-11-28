import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Onimaru - 大槌湾観測データベース',
  description: '東京大学大気海洋研究所が提供するオープンデータ「大槌湾観測データベース」を再配布するサービス',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
        <footer className="mt-auto py-4 px-8 text-sm text-gray-600 border-t">
          <p>
            データ出典:{' '}
            <a
              href="https://opensci.aori.u-tokyo.ac.jp/otsuchi.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              大槌湾観測データベース
            </a>
            {' '}(<a href="https://opensci.aori.u-tokyo.ac.jp/index.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">東京大学大気海洋研究所 オープンサイエンス推進室</a>)
          </p>
        </footer>
      </body>
    </html>
  )
}
