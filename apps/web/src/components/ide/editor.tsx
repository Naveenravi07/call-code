import * as vscode from 'vscode';
import { type RegisterLocalProcessExtensionResult } from '@codingame/monaco-vscode-api/extensions';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';
import { createWrapperConfig } from '../editor/wrapper-factory'; 
import { configureDebugging } from '../editor/utils';
import { pythonSetup } from '../editor/config/pythonConfig';

export default function Editor(){
    const appConfig = createWrapperConfig(pythonSetup)

    const onLoad = async (wrapper: MonacoEditorLanguageClientWrapper) => {
        const result = wrapper.getExtensionRegisterResult('mlc-python-example') as RegisterLocalProcessExtensionResult;
        result.setAsDefaultApi();

        const initResult = wrapper.getExtensionRegisterResult('debugger-py-client') as RegisterLocalProcessExtensionResult | undefined;
        if (initResult !== undefined) {
            configureDebugging(await initResult.getApi(), appConfig.configParams);
        }

        await vscode.commands.executeCommand('workbench.view.explorer');
        await vscode.window.showTextDocument(appConfig.configParams.files.get('hello2.py')!.uri);
    };
    return(
        <MonacoEditorReactComp
        wrapperConfig={appConfig.wrapperConfig}
        style={{ 'height': '100%' }}
        onLoad={onLoad}
        onError={(e) => {
            console.error(e);
        }} />
    )

}
