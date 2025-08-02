import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';
import { createWrapperConfig } from '../editor/wrapper-factory';
import { pythonSetup } from '../editor/config/pythonConfig';
//import { createWrapperConfig } from '../editor/dummy/config';

interface EditorProps {
  sessionId: string;
}
export default function Editor({sessionId}: EditorProps) {
  const appConfig = createWrapperConfig(pythonSetup,sessionId);
  console.log(appConfig.wrapperConfig);

  const onLoad = async (_wrapper: MonacoEditorLanguageClientWrapper) => {
    console.log('Loading................');
  };

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
