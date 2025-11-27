'use client';

import { useEffect, useState } from 'react';

interface Stats {
  recordCount: number;
}

// キャッシュ用のグローバル変数（ページが再マウントされても保持）
let cachedStats: Stats | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1日間

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(cachedStats);
  const [loading, setLoading] = useState(!cachedStats);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // キャッシュが有効な場合は使用
    const now = Date.now();
    if (cachedStats && (now - cacheTimestamp) < CACHE_DURATION) {
      setStats(cachedStats);
      setLoading(false);
      return;
    }

    async function fetchStats() {
      try {
        const response = await fetch('/api/stats', {
          cache: 'force-cache', // ブラウザキャッシュも活用
        });
        if (!response.ok) {
          throw new Error('データの取得に失敗しました');
        }
        const data = await response.json();
        // キャッシュを更新
        cachedStats = data;
        cacheTimestamp = Date.now();
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

