export function Footer() {
    return (
        <footer className="h-[48pt] p-4 bg-gray-200 text-sm text-right flex items-center justify-center">
          <div className="flex items-center justify-center gap-2">
            <span>データ出典:</span>
          <a
            href="https://opensci.aori.u-tokyo.ac.jp/otsuchi.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-grey-600 hover:underline"
        >
            大槌湾観測データベース
        </a>
        </div>
        <div>
        （<a
          href="https://opensci.aori.u-tokyo.ac.jp/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-grey-600 hover:underline">
            東京大学大気海洋研究所 オープンサイエンス推進室
        </a>）
        </div>
        </footer>
    );
}