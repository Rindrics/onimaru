import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://opensci.aori.u-tokyo.ac.jp';
const LIST_URL = `${BASE_URL}/otsuchi/list?start=2009%2F04%2F01&end=2025%2F10%2F01`;
const DOWNLOAD_DIR = './data/csv';
const SLEEP_INTERVAL = 2000; // 2秒

// ダウンロードディレクトリを作成
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

// スリープ関数
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ページネーションから最終ページ番号を取得
async function getLastPageNumber(html: string): Promise<number> {
  const $ = cheerio.load(html);
  const pagination = $('ul.pagination.pagination-sm.m-0');
  
  if (pagination.length === 0) {
    throw new Error('ページネーションが見つかりませんでした');
  }
  
  // 最後の li 要素からページ番号を取得
  const lastPageLi = pagination.find('li').last();
  const lastPageText = lastPageLi.text().trim();
  const lastPageNumber = parseInt(lastPageText, 10);
  
  if (isNaN(lastPageNumber)) {
    throw new Error(`ページ番号を取得できませんでした: ${lastPageText}`);
  }
  
  return lastPageNumber;
}

// ページからCSVダウンロードリンクを抽出
function extractCsvLinks(html: string): string[] {
  const $ = cheerio.load(html);
  const links: string[] = [];
  
  // href="/otsuchi/ctd/..." の形式のリンクを抽出
  $('a[href*="/otsuchi/ctd/"][href$=".csv"]').each((_, element) => {
    const href = $(element).attr('href');
    if (href) {
      links.push(href);
    }
  });
  
  return links;
}

// CSVファイルをダウンロード
// 戻り値: ダウンロードした場合はtrue、スキップした場合はfalse
async function downloadCsv(linkPath: string): Promise<boolean> {
  const filename = path.basename(linkPath);
  const filepath = path.join(DOWNLOAD_DIR, filename);
  
  // 既にダウンロード済みかチェック
  if (fs.existsSync(filepath)) {
    console.log(`  スキップ: ${filename} (既に存在)`);
    return false;
  }
  
  const downloadUrl = `${BASE_URL}${linkPath}`;
  
  try {
    console.log(`  ダウンロード中: ${filename}`);
    const response = await axios.get(downloadUrl, {
      responseType: 'arraybuffer',
    });
    
    fs.writeFileSync(filepath, response.data);
    console.log(`  ✓ 完了: ${filename}`);
    return true;
  } catch (error) {
    console.error(`  ✗ エラー: ${filename}`, error);
    throw error;
  }
}

// メイン処理
async function main() {
  try {
    console.log('データ一覧ページにアクセス中...');
    const listResponse = await axios.get(LIST_URL);
    const listHtml = listResponse.data;
    
    const lastPage = await getLastPageNumber(listHtml);
    console.log(`総ページ数: ${lastPage}`);
    
    // 各ページを処理
    for (let page = 1; page <= lastPage; page++) {
      console.log(`\nページ ${page}/${lastPage} を処理中...`);
      
      const pageUrl = `${LIST_URL}&p=${page}`;
      const pageResponse = await axios.get(pageUrl);
      const pageHtml = pageResponse.data;
      
      const csvLinks = extractCsvLinks(pageHtml);
      console.log(`  ${csvLinks.length} 件のCSVリンクを発見`);
      
      // 各リンクをダウンロード
      for (const link of csvLinks) {
        const downloaded = await downloadCsv(link);
        
        // ダウンロードした場合のみ、サーバー負荷を避けるため待機
        if (downloaded) {
          await sleep(SLEEP_INTERVAL);
        }
      }
    }
    
    console.log(`\nダウンロード完了: ${DOWNLOAD_DIR}`);
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

main();
