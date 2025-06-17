import { RegisteredMemoryFile } from '@codingame/monaco-vscode-files-service-override';
import type { IStoredWorkspace } from '@codingame/monaco-vscode-configuration-service-override';
import { Uri } from 'vscode';
import * as vscode from 'vscode'
import {ConfigParams, InitMessage, } from "./types"
import type { ExtensionConfig } from 'monaco-editor-wrapper';


export const createDefaultWorkspaceFile = (workspaceFile: Uri, workspacePath: string) => {
    return new RegisteredMemoryFile(
        workspaceFile,
        JSON.stringify(
            <IStoredWorkspace>{
                folders: [
                    {
                        path: workspacePath
                    }
                ]
            },
            null,
            2
        )
    );
};

export const createDebugLaunchConfigFile = (workspacePath: string, type: string) => {
    return new RegisteredMemoryFile(
        Uri.file(`${workspacePath}/.vscode/launch.json`),
        JSON.stringify(
            {
                version: '0.2.0',
                configurations: [
                    {
                        name: 'Debugger: Lauch',
                        type,
                        request: 'attach',
                    }
                ]
            },
            null,
            2
        )
    );
};

export const provideDebuggerExtensionConfig = (config: ConfigParams): ExtensionConfig => {
    const filesOrContents = new Map<string, string | URL>();
    filesOrContents.set('./extension.js', '// nothing');

    return {
        config: {
            name: config.extensionName,
            publisher: 'TypeFox',
            version: '1.0.0',
            engines: {
                vscode: '*'
            },
            browser: 'extension.js',
            contributes: {
                debuggers: [
                    {
                        type: config.languageId,
                        label: 'Test',
                        languages: [config.languageId]
                    }
                ],
                breakpoints: [
                    {
                        language: config.languageId
                    }
                ]
            },
            activationEvents: [
                'onDebug'
            ]
        },
        filesOrContents
    };
};


export const configureDebugging = async (api: typeof vscode, config: ConfigParams) => {
    class WebsocketDebugAdapter implements vscode.DebugAdapter {
        private websocket: WebSocket;

        constructor(websocket: WebSocket) {
            this.websocket = websocket;
            this.websocket.onmessage = (message) => {
                this._onDidSendMessage.fire(JSON.parse(message.data));
            };
        }

        _onDidSendMessage = new api.EventEmitter<vscode.DebugProtocolMessage>();
        onDidSendMessage = this._onDidSendMessage.event;

        handleMessage(message: vscode.DebugProtocolMessage): void {
            // path with on Windows (Chrome/Firefox) arrive here with \\ and not like expected with /
            // Chrome on Ubuntu behaves as expected
            const msg = JSON.stringify(message).replace(/\\\\/g, '/');
            this.websocket.send(msg);
        }

        dispose() {
            this.websocket.close();
        }
    }

    api.debug.registerDebugAdapterDescriptorFactory(config.languageId, {
        async createDebugAdapterDescriptor() {
            const websocket = new WebSocket(`${config.protocol}://${config.hostname}:${config.port}`);

            await new Promise((resolve, reject) => {
                websocket.onopen = resolve;
                websocket.onerror = () =>
                    reject(new Error(`Unable to connect to debugger server. Run "${config.helpContainerCmd}"`));
            });

            const adapter = new WebsocketDebugAdapter(websocket);

            const initMessage: InitMessage = {
                id: 'init',
                files: {},
                // the default file is the one that will be used by the debugger
                defaultFile: config.defaultFile,
                debuggerExecCall: config.debuggerExecCall
            };
            for (const [name, fileDef] of config.files.entries()) {
                console.log(`Found: ${name} Sending file: ${fileDef.path}`);
                initMessage.files[name] = {
                    path: fileDef.path,
                    code: fileDef.code,
                    uri: fileDef.uri
                };
            }
            websocket.send(JSON.stringify(initMessage));

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            adapter.onDidSendMessage((message: any) => {
                if (message.type === 'event' && message.event === 'output') {
                    console.log('OUTPUT', message.body.output);
                }
            });
            return new api.DebugAdapterInlineImplementation(adapter);
        }
    });
};
