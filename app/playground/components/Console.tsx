'use client';

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface ConsoleOutput {
  type: 'input' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

interface ConsoleProps {
  onExecute?: (code: string) => Promise<void>;
  disabled?: boolean;
}

// Export addOutput function type for parent components
export type ConsoleRef = {
  addOutput: (content: string, type?: 'output' | 'error') => void;
};

export const Console = forwardRef<ConsoleRef, ConsoleProps>(({ onExecute, disabled = false }, ref) => {
  const [input, setInput] = useState('');
  const [outputs, setOutputs] = useState<ConsoleOutput[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto scroll to bottom when new output is added
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [outputs]);

  const handleExecute = async () => {
    if (!input.trim() || disabled || isExecuting) {
      return;
    }

    const code = input.trim();
    setInput('');
    setIsExecuting(true);

    // Add input to outputs
    setOutputs(prev => [...prev, {
      type: 'input',
      content: code,
      timestamp: new Date(),
    }]);

    try {
      if (onExecute) {
        await onExecute(code);
      }
    } catch (error) {
      setOutputs(prev => [...prev, {
        type: 'error',
        content: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      }]);
    } finally {
      setIsExecuting(false);
      // Focus back to input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd + Enter or Ctrl + Enter to execute
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    }
  };

  const addOutput = (content: string, type: 'output' | 'error' = 'output') => {
    setOutputs(prev => [...prev, {
      type,
      content,
      timestamp: new Date(),
    }]);
  };

  // Expose addOutput method via ref
  useImperativeHandle(ref, () => ({
    addOutput,
  }));

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-800 text-gray-200 px-4 py-2 text-sm font-semibold rounded-t">
        コンソール
      </div>
      <div 
        ref={outputRef}
        className="flex-1 bg-gray-900 text-gray-100 p-4 overflow-y-auto font-mono text-sm"
      >
        {outputs.length === 0 ? (
          <div className="text-gray-500 italic">
            コードを入力して Cmd + Enter (Mac) または Ctrl + Enter (Windows) で実行
          </div>
        ) : (
          outputs.map((output, index) => (
            <div key={index} className="mb-2">
              {output.type === 'input' && (
                <div className="text-blue-400">
                  <span className="text-gray-500">&gt; </span>
                  {output.content}
                </div>
              )}
              {output.type === 'output' && (
                <div className="text-green-400 whitespace-pre-wrap">
                  {output.content}
                </div>
              )}
              {output.type === 'error' && (
                <div className="text-red-400 whitespace-pre-wrap">
                  {output.content}
                </div>
              )}
            </div>
          ))
        )}
        {isExecuting && (
          <div className="text-yellow-400">実行中...</div>
        )}
      </div>
      <div className="border-t border-gray-700">
        <div className="flex items-center bg-gray-800">
          <span className="text-gray-400 px-4 py-2 text-sm">&gt;</span>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isExecuting}
            className="flex-1 bg-gray-900 text-gray-100 p-2 font-mono text-sm resize-none focus:outline-none disabled:opacity-50"
            placeholder={disabled ? '初期化中...' : 'R コードを入力...'}
            rows={1}
            style={{ minHeight: '2.5rem', maxHeight: '10rem' }}
          />
          <button
            onClick={handleExecute}
            disabled={!input.trim() || disabled || isExecuting}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            実行
          </button>
        </div>
      </div>
    </div>
  );
});

Console.displayName = 'Console';
