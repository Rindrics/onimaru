'use client';

import { useEffect, useState } from 'react';

interface Stats {
  recordCount: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) {
          throw new Error('データの取得に失敗しました');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <main className="p-8">
      <div className="mt-8">
        <h1 className="text-2xl font-bold mb-4">データ統計</h1>
      {loading && <p>読み込み中...</p>}
      {error && <p className="text-red-500">エラー: {error}</p>}
      {!loading && !error && stats && (
          <div className="mt-4">
            <p>
              <strong>レコード数:</strong> {stats.recordCount.toLocaleString()} 件
            </p>
          </div>
      )}
      </div>
    </main>
  );
}

