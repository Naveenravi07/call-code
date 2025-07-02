import * as vscode from 'vscode';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';
import { createWrapperConfig } from '../editor/wrapper-factory';
import { pythonSetup } from '../editor/config/pythonConfig';

export default function Editor() {
    const appConfig = createWrapperConfig(pythonSetup);
    console.log(appConfig);

    const onLoad = async (_wrapper: MonacoEditorLanguageClientWrapper) => {
        console.log('Loading................');
        await vscode.commands.executeCommand('workbench.view.explorer');
        await vscode.window.showTextDocument(appConfig.configParams.files.get('hello2.py')!.uri);
    };

    return (
        <div className='monaco-editor-root'>
            <MonacoEditorReactComp
                style={{ height: '100vh' }}
                wrapperConfig={appConfig.wrapperConfig}
                onLoad={onLoad}
                onError={e => {
                    console.log("OOOMBI")
                    console.error(e);
                }}
            />
        </div>
    );
}
