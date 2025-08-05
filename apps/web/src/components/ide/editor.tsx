import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';
import { createWrapperConfig } from '../editor/wrapper-factory';
import { typescriptSetup } from '../editor/config/typescriptConfig';
import React, { useEffect } from 'react';

interface EditorProps {
  sessionId: string;
}
export default function Editor({sessionId}: EditorProps) {
  const wrapperRef = React.useRef<MonacoEditorLanguageClientWrapper | null>(null);    
  const appConfig = createWrapperConfig(typescriptSetup,sessionId);
  console.log(appConfig.wrapperConfig);

  const onLoad = async (_wrapper: MonacoEditorLanguageClientWrapper) => {
    console.log('Loading................');
    wrapperRef.current = _wrapper;
  };

  useEffect(() => {
    return () => {
      if (wrapperRef.current) {
        wrapperRef.current.dispose();
      }
    };
  }, [wrapperRef]);

  return (
    <div className="">
      <MonacoEditorReactComp
        wrapperConfig={appConfig.wrapperConfig}
        style={{ height: '100%' }}
        onLoad={onLoad}
      />
    </div>
  );
}
