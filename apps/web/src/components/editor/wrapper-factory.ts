import type { WrapperConfig } from 'monaco-editor-wrapper';
import { createUrl } from 'monaco-languageclient/tools';
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc';
import { LogLevel } from '@codingame/monaco-vscode-api';
import { MonacoLanguageClient } from 'monaco-languageclient';
import { provideDebuggerExtensionConfig } from "./utils";
import { configureDefaultWorkerFactory } from 'monaco-editor-wrapper/workers/workerLoaders';
import { getAllOverrides } from './overrides';
import * as vscode from 'vscode';
import { createDefaultConfigParams } from './language-config';
import type { LanguageSetup } from './types'
import '@codingame/monaco-vscode-python-default-extension';

export const createWrapperConfig = (
    setup: LanguageSetup,
    homeDir = '/home/shastri',
) => {
    let htmlContainer = document.getElementById('monaco-editor-root') as HTMLElement
    const configParams = createDefaultConfigParams(homeDir, htmlContainer, setup);

    const url = createUrl({
        secured: false,
        host: 'localhost',
        port: 30001,
        path: setup.languageServerPath,
        extraParams: { authorization: 'UserAuth' }
    });

    const socket = new WebSocket(url);
    const isocket = toSocket(socket);
    const reader = new WebSocketMessageReader(isocket)
    const writer = new WebSocketMessageWriter(isocket)

    const wrapperConfig: WrapperConfig = {
        $type: 'extended',
        htmlContainer,
        logLevel: LogLevel.Debug,
        languageClientConfigs: {
            configs: {
                [setup.languageId]: {
                    name: `${setup.languageId} LSP`,
                    connection: {
                        options: {
                            $type: 'WebSocketDirect',
                            webSocket: socket,
                            startOptions: {
                                reportStatus: true,
                                onCall: (client?: MonacoLanguageClient) => {
                                    setTimeout(() => {
                                        ['restartserver', 'organizeimports'].forEach(cmd =>
                                            vscode.commands.registerCommand(`${setup.languageId}.${cmd}`, (...args) => {
                                                client?.sendRequest('workspace/executeCommand', {
                                                    command: `${setup.languageId}.${cmd}`,
                                                    arguments: args
                                                });
                                            })
                                        );
                                    }, 250);
                                }
                            }
                        },
                        messageTransports:{reader,writer}
                    },
                    clientOptions: {
                        documentSelector: [configParams.languageId],
                        workspaceFolder: {
                            index: 0,
                            name: configParams.workspaceRoot,
                            uri: vscode.Uri.parse(configParams.workspaceRoot)
                        }
                    }
                }
            }
        },
        
        vscodeApiConfig: getAllOverrides(configParams),
        extensions: [
            {
                config: {
                    name: setup.extensionName,
                    publisher: 'TypeFox',
                    version: '1.0.0',
                    engines: { vscode: '*' }
                }
            },
            ...(setup.debuggerCommand ? [provideDebuggerExtensionConfig(configParams)] : [])
        ],
        editorAppConfig: {
            monacoWorkerFactory: configureDefaultWorkerFactory
        }
    };

    return { wrapperConfig, configParams };
};
