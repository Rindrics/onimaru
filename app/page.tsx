import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h2>目次</h2>
      <ul>
        <li><Link href="/dashboard">ダッシュボード</Link></li>
      </ul>
    </main>
  )
}
