import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { ParquetWriter, ParquetSchema } from 'parquetjs';

const CSV_DIR = './data/csv';
const OUTPUT_FILE = './public/data/ctd_data.parquet';

interface CtdRecord {
  CTDPRS: number;
  CTDTMP: number;
  CTDSAL: number;
  CTDDEPTH: number;
  filename: string;
  date?: string;
  time?: string;
  latitude?: number;
  longitude?: number;
  stnnbr?: string;
}

// CSVファイルをパースしてデータを抽出
function parseCsvFile(filepath: string): CtdRecord[] {
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split('\n');
  
  // メタデータを抽出
  let date: string | undefined;
  let time: string | undefined;
  let latitude: number | undefined;
  let longitude: number | undefined;
  let stnnbr: string | undefined;
  let dataStartLine = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('DATE =')) {
      date = line.split('=')[1]?.trim();
    } else if (line.startsWith('TIME =')) {
      time = line.split('=')[1]?.trim();
    } else if (line.startsWith('LATITUDE =')) {
      latitude = parseFloat(line.split('=')[1]?.trim() || '0');
    } else if (line.startsWith('LONGITUDE =')) {
      longitude = parseFloat(line.split('=')[1]?.trim() || '0');
    } else if (line.startsWith('STNNBR =')) {
      stnnbr = line.split('=')[1]?.trim();
    } else if (line.includes('CTDPRS') && line.includes('CTDTMP')) {
      // データ行の開始位置を特定（カラム名行の次の行が単位行、その次がデータ）
      dataStartLine = i + 2; // カラム名行と単位行の次
      break;
    }
  }
  
  if (dataStartLine === 0) {
    console.warn(`  警告: データ開始行が見つかりません: ${path.basename(filepath)}`);
    return [];
  }
  
  // データ部分を抽出（END_DATAまで）
  const dataLines: string[] = [];
  for (let i = dataStartLine; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed === 'END_DATA' || trimmed.startsWith('END_DATA')) {
      break;
    }
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes(',')) {
      // データ行はtrimしてから追加（先頭のスペースを除去）
      dataLines.push(trimmed);
    }
  }
  
  if (dataLines.length === 0) {
    return [];
  }
  
  // カラム名を取得（カラム名行から、trimして正規化）
  const headerLine = lines[dataStartLine - 2]; // 12行目（インデックス11）
  const headers = headerLine.split(',').map(h => h.trim());
  
  // データ行を結合（先頭のスペースを保持）
  const dataContent = dataLines.join('\n');
  
  // CSVパーサーでパース
  const records = parse(dataContent, {
    columns: headers,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as Array<Record<string, string>>;
  
  const filename = path.basename(filepath);
  
  // レコードを変換（カラム名のバリエーションに対応）
  return records.map(record => {
    // カラム名のバリエーションに対応（スペースの有無）
    const ctDPRS = record['CTDPRS'] || record[' CTDPRS'] || '0';
    const ctDTMP = record['CTDTMP'] || record[' CTDTMP'] || '0';
    const ctDSAL = record['CTDSAL'] || record[' CTDSAL'] || '0';
    const ctDDEPTH = record['CTDDEPTH'] || record['CTDDEPTH'] || '0';
    
    return {
      CTDPRS: parseFloat(String(ctDPRS).trim() || '0'),
      CTDTMP: parseFloat(String(ctDTMP).trim() || '0'),
      CTDSAL: parseFloat(String(ctDSAL).trim() || '0'),
      CTDDEPTH: parseFloat(String(ctDDEPTH).trim() || '0'),
      filename,
      date,
      time,
      latitude,
      longitude,
      stnnbr,
    };
  }).filter(record => !isNaN(record.CTDPRS));
}

// すべてのCSVファイルを読み込んで結合
function loadAllCsvFiles(): CtdRecord[] {
  const csvFiles = fs.readdirSync(CSV_DIR)
    .filter(file => file.endsWith('.csv'))
    .map(file => path.join(CSV_DIR, file));
  
  console.log(`${csvFiles.length} 件のCSVファイルを処理中...`);
  
  const allRecords: CtdRecord[] = [];
  
  for (const csvFile of csvFiles) {
    try {
      const records = parseCsvFile(csvFile);
      allRecords.push(...records);
      console.log(`  ✓ ${path.basename(csvFile)}: ${records.length} レコード`);
    } catch (error) {
      console.error(`  ✗ エラー: ${path.basename(csvFile)}`, error);
    }
  }
  
  return allRecords;
}

// Parquetファイルに書き出し
async function writeParquetFile(records: CtdRecord[]): Promise<void> {
  // 出力ディレクトリを作成
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Parquetスキーマを定義（圧縮を有効化）
  const schema = new ParquetSchema({
    CTDPRS: { type: 'DOUBLE', compression: 'GZIP' },
    CTDTMP: { type: 'DOUBLE', compression: 'GZIP' },
    CTDSAL: { type: 'DOUBLE', compression: 'GZIP' },
    CTDDEPTH: { type: 'DOUBLE', compression: 'GZIP' },
    filename: { type: 'UTF8', compression: 'GZIP' },
    date: { type: 'UTF8', optional: true, compression: 'GZIP' },
    time: { type: 'UTF8', optional: true, compression: 'GZIP' },
    latitude: { type: 'DOUBLE', optional: true, compression: 'GZIP' },
    longitude: { type: 'DOUBLE', optional: true, compression: 'GZIP' },
    stnnbr: { type: 'UTF8', optional: true, compression: 'GZIP' },
  });
  
  console.log(`\nParquetファイルに書き出し中: ${OUTPUT_FILE}`);
  
  // 行グループサイズを大きく設定（メタデータのオーバーヘッドを減らす）
  const writer = await ParquetWriter.openFile(schema, OUTPUT_FILE, {
    rowGroupSize: 50000,
  });
  
  for (const record of records) {
    await writer.appendRow(record);
  }
  
  await writer.close();
  
  const stats = fs.statSync(OUTPUT_FILE);
  console.log(`✓ 完了: ${records.length} レコード、${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

// メイン処理
async function main() {
  try {
    if (!fs.existsSync(CSV_DIR)) {
      console.error(`エラー: ${CSV_DIR} ディレクトリが見つかりません`);
      process.exit(1);
    }
    
    const records = loadAllCsvFiles();
    
    if (records.length === 0) {
      console.error('エラー: データが見つかりませんでした');
      process.exit(1);
    }
    
    await writeParquetFile(records);
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

main();

