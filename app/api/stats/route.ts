import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { ParquetReader } from 'parquetjs';

const PARQUET_FILE = path.join(process.cwd(), 'public', 'data', 'ctd_data.parquet');

export async function GET() {
  try {
    if (!fs.existsSync(PARQUET_FILE)) {
      return NextResponse.json(
        { error: 'Parquetファイルが見つかりません' },
        { status: 404 }
      );
    }

    const reader = await ParquetReader.openFile(PARQUET_FILE);
    const cursor = reader.getCursor();
    
    let recordCount = 0;
    while (await cursor.next()) {
      recordCount++;
    }

    await reader.close();

    return NextResponse.json({
      recordCount,
    });
  } catch (error) {
    console.error('エラー:', error);
    return NextResponse.json(
      { error: 'データの読み込みに失敗しました' },
      { status: 500 }
    );
  }
}
