'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';

interface CodeEditorProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  onExecute?: (code: string) => Promise<void>;
  readOnly?: boolean;
  disabled?: boolean;
}

const DEFAULT_CODE = `# R コードの例
# 基本的な計算
1 + 1

# ベクトルの作成
x <- c(1, 2, 3, 4, 5)
mean(x)

# データフレームの作成
df <- data.frame(
  name = c("Alice", "Bob", "Charlie"),
  age = c(25, 30, 35)
)
print(df)

# スクロールバーのテスト用に多くの行を追加
# 行 1
# 行 2
# 行 3
# 行 4
# 行 5
# 行 6
# 行 7
# 行 8
# 行 9
# 行 10
# 行 11
# 行 12
# 行 13
# 行 14
# 行 15
# 行 16
# 行 17
# 行 18
# 行 19
# 行 20
# 行 21
# 行 22
# 行 23
# 行 24
# 行 25
# 行 26
# 行 27
# 行 28
# 行 29
# 行 30
`;

export function CodeEditor({ 
  initialCode = DEFAULT_CODE, 
  onCodeChange,
  onExecute,
  readOnly = false,
  disabled = false
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const handleChange = useCallback((value: string) => {
    setCode(value);
    onCodeChange?.(value);
  }, [onCodeChange]);

  const handleExecute = useCallback(async () => {
    if (!code.trim() || disabled || !onExecute) {
      return;
    }
    await onExecute(code);
  }, [code, disabled, onExecute]);

  const executeKeymap = useCallback(() => {
    return keymap.of([
      {
        key: 'Mod-Enter',
        run: () => {
          handleExecute();
          return true;
        },
      },
    ]);
  }, [handleExecute]);

  const extensions = useMemo(() => [
    lineNumbers(),
    EditorState.readOnly.of(readOnly || disabled),
    EditorView.lineWrapping,
    EditorView.contentAttributes.of({ 'data-gramm': 'false' }),
    executeKeymap(),
    oneDark,
  ], [readOnly, disabled, executeKeymap]);

  return (
    <>
      <div className="bg-gray-800 text-gray-200 px-4 py-2 text-sm font-semibold rounded-t flex items-center justify-between shrink-0">
        <span>analysis.R</span>        
      </div>
      <CodeMirror
          value={code}
          height="400pt"
          max-height="100%"
          extensions={extensions}
          onChange={handleChange}
          editable={!readOnly && !disabled}
      />
    </>
  );
}

