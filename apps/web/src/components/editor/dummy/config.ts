import { LogLevel } from '@codingame/monaco-vscode-api';
import getDebugServiceOverride from '@codingame/monaco-vscode-debug-service-override';
import getEnvironmentServiceOverride from '@codingame/monaco-vscode-environment-service-override';
import getExplorerServiceOverride from '@codingame/monaco-vscode-explorer-service-override';
import { RegisteredFileSystemProvider, RegisteredMemoryFile, registerFileSystemOverlay } from '@codingame/monaco-vscode-files-service-override';
import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';
import getLifecycleServiceOverride from '@codingame/monaco-vscode-lifecycle-service-override';
import getLocalizationServiceOverride from '@codingame/monaco-vscode-localization-service-override';
import getPreferencesServiceOverride from '@codingame/monaco-vscode-preferences-service-override';
import '@codingame/monaco-vscode-python-default-extension';
import getRemoteAgentServiceOverride from '@codingame/monaco-vscode-remote-agent-service-override';
import getSearchServiceOverride from '@codingame/monaco-vscode-search-service-override';
import getSecretStorageServiceOverride from '@codingame/monaco-vscode-secret-storage-service-override';
import getStorageServiceOverride from '@codingame/monaco-vscode-storage-service-override';
import getTestingServiceOverride from '@codingame/monaco-vscode-testing-service-override';
import getBannerServiceOverride from '@codingame/monaco-vscode-view-banner-service-override';
import getStatusBarServiceOverride from '@codingame/monaco-vscode-view-status-bar-service-override';
import getTitleBarServiceOverride from '@codingame/monaco-vscode-view-title-bar-service-override';
import type { WrapperConfig } from 'monaco-editor-wrapper';
import { defaultHtmlAugmentationInstructions, defaultViewsInit } from 'monaco-editor-wrapper/vscode/services';
import { configureDefaultWorkerFactory } from 'monaco-editor-wrapper/workers/workerLoaders';
import { MonacoLanguageClient } from 'monaco-languageclient';
import { createUrl } from 'monaco-languageclient/tools';
import { createDefaultLocaleConfiguration } from 'monaco-languageclient/vscode/services';
import * as vscode from 'vscode';
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc';
import helloPyCode from '../dummy/hello.py?raw';
import hello2PyCode from '../dummy/hello2.py?raw';
import type { IStoredWorkspace } from '@codingame/monaco-vscode-configuration-service-override';
import type { ExtensionConfig } from 'monaco-editor-wrapper';
import { Uri } from 'vscode';

export type FileDefinition = {
    path: string;
    code: string;
    uri: Uri;
}

export type InitMessage = {
    id: 'init',
    files: Record<string, FileDefinition>
    defaultFile: string;
    debuggerExecCall: string;
};

export type ConfigParams = {
    extensionName: string;
    languageId: string;
    documentSelector: string[];
    homeDir: string;
    workspaceRoot: string;
    workspaceFile: Uri;
    htmlContainer?: HTMLElement;
    protocol: 'ws' | 'wss';
    hostname: string;
    port: number;
    files: Map<string, FileDefinition>;
    defaultFile: string;
    helpContainerCmd: string;
    debuggerExecCall: string;
}

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
            // A browser field is mandatory for the extension to be flagged as `web`
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
            const msg = JSON.stringify(message).replaceAll('\\\\', '/');
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
export const disableElement = (id: string, disabled: boolean) => {
    const button = document.getElementById(id) as HTMLButtonElement | HTMLInputElement | null;
    if (button !== null) {
        button.disabled = disabled;
    }
};

export const createDefaultWorkspaceContent = (workspacePath: string) => {
    return JSON.stringify(
        <IStoredWorkspace>{
            folders: [
                {
                    path: workspacePath
                }
            ]
        },
        null,
        2
    );
};

export const delayExecution = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
export const createDefaultConfigParams = (homeDir: string, htmlContainer?: HTMLElement): ConfigParams => {
    const files = new Map<string, FileDefinition>();
    const workspaceRoot = `${homeDir}/workspace`;
    const configParams: ConfigParams = {
        extensionName: 'debugger-py-client',
        languageId: 'python',
        documentSelector: ['python', 'py'],
        homeDir,
        workspaceRoot: `${homeDir}/workspace`,
        workspaceFile: vscode.Uri.file(`${homeDir}/.vscode/workspace.code-workspace`),
        htmlContainer,
        protocol: 'ws',
        hostname: 'localhost',
        port: 55555,
        files,
        defaultFile: `${workspaceRoot}/hello2.py`,
        helpContainerCmd: 'docker compose -f ./packages/examples/resources/debugger/docker-compose.yml up -d',
        debuggerExecCall: 'graalpy --dap --dap.WaitAttached --dap.Suspend=true'
    };
    const helloPyPath = `${workspaceRoot}/hello.py`;
    const hello2PyPath = configParams.defaultFile;
    const badPyPath = `${workspaceRoot}/bad.py`;


    files.set('hello.py', { code: helloPyCode, path: helloPyPath, uri: vscode.Uri.file(helloPyPath) });
    files.set('hello2.py', { code: hello2PyCode, path: hello2PyPath, uri: vscode.Uri.file(hello2PyPath) });

    const fileSystemProvider = new RegisteredFileSystemProvider(false);
    fileSystemProvider.registerFile(new RegisteredMemoryFile(files.get('hello.py')!.uri, helloPyCode));
    fileSystemProvider.registerFile(new RegisteredMemoryFile(files.get('hello2.py')!.uri, hello2PyCode));
    fileSystemProvider.registerFile(new RegisteredMemoryFile(configParams.workspaceFile, createDefaultWorkspaceContent(configParams.workspaceRoot)));
    fileSystemProvider.registerFile(createDebugLaunchConfigFile(workspaceRoot, configParams.languageId));
    registerFileSystemOverlay(1, fileSystemProvider);
    
    return configParams;
};

export type PythonAppConfig = {
    wrapperConfig: WrapperConfig;
    configParams: ConfigParams;
}

export const createWrapperConfig = (): PythonAppConfig => {
    const configParams = createDefaultConfigParams('/home/mlc', document.body);

    const url = createUrl({
        secured: false,
        host: 'localhost',
        port: 30001,
        path: 'pyright',
        extraParams: {
            authorization: 'UserAuth'
        }
    });
    const webSocket = new WebSocket(url);
    const iWebSocket = toSocket(webSocket);
    const reader = new WebSocketMessageReader(iWebSocket);
    const writer = new WebSocketMessageWriter(iWebSocket);

    const wrapperConfig: WrapperConfig = {
        $type: 'extended',
        htmlContainer: configParams.htmlContainer,
        logLevel: LogLevel.Debug,
        languageClientConfigs: {
            configs: {
                python: {
                    name: 'Python Language Server Exampleeasas',
                    connection: {
                        options: {
                            $type: 'WebSocketDirect',
                            webSocket: webSocket,
                            startOptions: {
                                onCall: (languageClient?: MonacoLanguageClient) => {
                                    setTimeout(() => {
                                        ['pyright.restartserver', 'pyright.organizeimports'].forEach((cmdName) => {
                                            vscode.commands.registerCommand(cmdName, (...args: unknown[]) => {
                                                languageClient?.sendRequest('workspace/executeCommand', { command: cmdName, arguments: args });
                                            });
                                        });
                                    }, 250);
                                },
                                reportStatus: true,
                            }
                        },
                        messageTransports: { reader, writer }
                    },
                    clientOptions: {
                        documentSelector: [configParams.languageId],
                        workspaceFolder: {
                            index: 0,
                            name: configParams.workspaceRoot,
                            uri: vscode.Uri.parse(configParams.workspaceRoot)
                        },
                    }
                }
            }
        },
        extensions: [
            {
                config: {
                    name: 'mlc-python-example',
                    publisher: 'TypeFox',
                    version: '1.0.0',
                    engines: {
                        vscode: '*'
                    }
                }
            },
            provideDebuggerExtensionConfig(configParams)
        ],
        editorAppConfig: {
            monacoWorkerFactory: configureDefaultWorkerFactory
        },
        vscodeApiConfig: {
            serviceOverrides: {
                ...getKeybindingsServiceOverride(),
                ...getLifecycleServiceOverride(),
                ...getLocalizationServiceOverride(createDefaultLocaleConfiguration()),
                ...getBannerServiceOverride(),
                ...getStatusBarServiceOverride(),
                ...getTitleBarServiceOverride(),
                ...getExplorerServiceOverride(),
                ...getRemoteAgentServiceOverride(),
                ...getEnvironmentServiceOverride(),
                ...getSecretStorageServiceOverride(),
                ...getStorageServiceOverride(),
                ...getSearchServiceOverride(),
                ...getDebugServiceOverride(),
                ...getTestingServiceOverride(),
                ...getPreferencesServiceOverride()
            },
            viewsConfig: {
                viewServiceType: 'ViewsService',
                htmlAugmentationInstructions: defaultHtmlAugmentationInstructions,
                viewsInitFunc: defaultViewsInit
            },
            userConfiguration: {
                json: JSON.stringify({
                    'workbench.colorTheme': 'Default Dark Modern',
                    'editor.guides.bracketPairsHorizontal': 'active',
                    'editor.wordBasedSuggestions': 'off',
                    'editor.experimental.asyncTokenization': true,
                    'debug.toolBarLocation': 'docked'
                })
            },
            workspaceConfig: {
                enableWorkspaceTrust: true,
                windowIndicator: {
                    label: 'mlc-python-example',
                    tooltip: '',
                    command: ''
                },
                workspaceProvider: {
                    trusted: true,
                    async open() {
                        window.open(window.location.href);
                        return true;
                    },
                    workspace: {
                        workspaceUri: configParams.workspaceFile
                    }
                },
                configurationDefaults: {
                    'window.title': 'mlc-python-example${separator}${dirty}${activeEditorShort}'
                },
                productConfiguration: {
                    nameShort: 'mlc-python-example',
                    nameLong: 'mlc-python-example'
                }
            },
        },

    };

    return {
        wrapperConfig,
        configParams: configParams
    };
};
