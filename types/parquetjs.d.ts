declare module 'parquetjs' {
  export interface ParquetSchema {
    [key: string]: {
      type: string;
      compression?: string;
      optional?: boolean;
    };
  }

  export class ParquetReader {
    static openFile(path: string): Promise<ParquetReader>;
    getCursor(): ParquetCursor;
    close(): Promise<void>;
  }

  export interface ParquetCursor {
    next(): Promise<boolean>;
    [Symbol.asyncIterator](): AsyncIterableIterator<any>;
  }

  export class ParquetWriter {
    static openFile(
      schema: ParquetSchema,
      path: string,
      options?: { rowGroupSize?: number }
    ): Promise<ParquetWriter>;
    appendRow(row: any): Promise<void>;
    close(): Promise<void>;
  }

  export class ParquetSchema {
    constructor(schema: ParquetSchema);
  }
}

