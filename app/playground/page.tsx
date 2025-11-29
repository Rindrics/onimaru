'use client';

import { useEffect, useState, useRef } from 'react';
import Script from 'next/script';
import { CodeEditor } from './components/CodeEditor';
import { Console, ConsoleRef } from './components/Console';

type WebR = {
  init: () => Promise<void>;
  close: () => void;
  evalR: (code: string) => Promise<any>;
  [key: string]: any;
};

declare global {
  interface Window {
    WebR?: any;
    webrLoaded?: boolean;
  }
}

export default function PlaygroundPage() {
  const [webR, setWebR] = useState<WebR | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorCode, setEditorCode] = useState('');
  const consoleRef = useRef<ConsoleRef | null>(null);

  useEffect(() => {
    let webRInstance: WebR | null = null;

    async function initWebR() {
      if (!window.webrLoaded || !window.WebR || !window.WebR.WebR) {
        console.log('WebR の読み込み待機中...', {
          webrLoaded: window.webrLoaded,
          hasWebR: !!window.WebR,
          hasWebRClass: !!(window.WebR && window.WebR.WebR),
        });
        return;
      }

      try {
        console.log('WebR の初期化を開始...');
        const { WebR } = window.WebR;
        webRInstance = new WebR();
        if (webRInstance) {
          console.log('WebR インスタンスを作成、初期化中...');
          await webRInstance.init();
          console.log('WebR の初期化が完了しました');
          setWebR(webRInstance);
          setLoading(false);
        } else {
          throw new Error('WebR インスタンスの作成に失敗しました');
        }
      } catch (err) {
        console.error('WebR の初期化エラー:', err);
        setError(err instanceof Error ? err.message : 'WebR の初期化に失敗しました');
        setLoading(false);
      }
    }

    const checkAndInit = async () => {
      console.log('webr-ready イベントを受信', {
        webrLoaded: window.webrLoaded,
        hasWebR: !!window.WebR,
      });
      await initWebR();
    };

    const handleError = (event: Event) => {
      console.error('WebR の読み込みエラー:', event);
      setError('WebR スクリプトの読み込みに失敗しました');
      setLoading(false);
    };

    if (window.webrLoaded && window.WebR && window.WebR.WebR) {
      initWebR();
    }

    window.addEventListener('webr-ready', checkAndInit);
    window.addEventListener('webr-error', handleError);

    // Cleanup
    return () => {
      if (webRInstance) {
        webRInstance.close();
      }
      window.removeEventListener('webr-ready', checkAndInit);
      window.removeEventListener('webr-error', handleError);
    };
  }, []);

  const handleScriptLoad = () => {
    console.log('Script タグの読み込みが完了');
  };

  const handleScriptError = () => {
    console.error('Script タグの読み込みエラー');
    setError('WebR スクリプトの読み込みに失敗しました');
    setLoading(false);
  };

  const handleExecuteCode = async (code: string) => {
    if (!webR) {
      return;
    }

    try {
      const result = await webR.evalR(code);
      const jsResult = await result.toJs();
      
      // Format output based on result type
      let output = '';
      if (jsResult.type === 'double' || jsResult.type === 'integer') {
        output = jsResult.values?.join(', ') || String(jsResult);
      } else if (jsResult.type === 'character') {
        output = jsResult.values?.map((v: string) => `"${v}"`).join(', ') || String(jsResult);
      } else {
        output = JSON.stringify(jsResult, null, 2);
      }

      if (consoleRef.current) {
        consoleRef.current.addOutput(output, 'output');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (consoleRef.current) {
        consoleRef.current.addOutput(errorMessage, 'error');
      }
    }
  };

  return (
    <>
      <Script
        id="webr-loader"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            (async () => {
              try {
                console.log('WebR モジュールの読み込みを開始...');
                const { WebR } = await import('https://webr.r-wasm.org/latest/webr.mjs');
                console.log('WebR モジュールの読み込みが完了');
                window.WebR = { WebR };
                window.webrLoaded = true;
                console.log('webr-ready イベントを発火');
                window.dispatchEvent(new Event('webr-ready'));
              } catch (err) {
                console.error('WebR の読み込みエラー:', err);
                window.dispatchEvent(new CustomEvent('webr-error', { detail: err }));
              }
            })();
          `,
        }}
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />
      <div className="flex flex-col p-8 max-h-full">
        <h1 className="mb-4 text-2xl font-bold text-gray-600">Playground</h1>
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">WebR を初期化中...</p>
          </div>
        )}
        
        {error && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-red-500">エラー: {error}</p>
          </div>
        )}
        <CodeEditor
          initialCode={editorCode}
          onCodeChange={setEditorCode}
          onExecute={handleExecuteCode}
          disabled={false}
        />
      </div>
    </>
  );
}

