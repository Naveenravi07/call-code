import * as vscode from 'vscode';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';
import { createWrapperConfig } from '../editor/wrapper-factory';
import { pythonSetup } from '../editor/config/pythonConfig';
//import { createWrapperConfig } from '../editor/dummy/config';


export default function Editor() {
  const appConfig = createWrapperConfig(pythonSetup);
  console.log(appConfig.wrapperConfig);

  const onLoad = async (_wrapper: MonacoEditorLanguageClientWrapper) => {
    console.log('Loading................');
    await vscode.commands.executeCommand('workbench.view.explorer');
    await vscode.window.showTextDocument(appConfig.configParams.files.get('hello.py')!.uri);
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
