import type { Metadata } from 'next'
import './globals.css'
import { Header } from './components/Header'
import { Footer } from './components/Footer'

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
        <Footer/>
      </body>
    </html>
  )
}
