import * as vscode from 'vscode';
import {
  registerFileSystemOverlay,
} from '@codingame/monaco-vscode-files-service-override';
import type { ConfigParams, LanguageSetup } from './types';
import { remoteFileSystemProvider } from './remoteFileSystemProvider';

const homeDir = '/home/code'

export const createDefaultConfigParams = (
  htmlContainer: HTMLElement | undefined,
  setup: LanguageSetup,
  sessionId: string,
): ConfigParams => {

  const workspaceRoot = `${homeDir}`;
  const workspaceFile = vscode.Uri.file(`${homeDir}/.vscode/workspace.code-workspace`);
 
  const fileSystemProvider = new remoteFileSystemProvider(sessionId);
  registerFileSystemOverlay(1, fileSystemProvider );

  return {
    extensionName: setup.extensionName,
    debugExtensionName: setup.debugExtensionName,
    languageId: setup.languageId,
    documentSelector: [setup.languageId],
    homeDir,
    workspaceRoot,
    workspaceFile,
    htmlContainer,
    protocol: 'ws',
    hostname: 'localhost',
    port: 55555,
    defaultFile: `${workspaceRoot}/${setup.defaultFile}`,
    helpContainerCmd: '',
    debuggerExecCall: setup.debuggerCommand ?? '',
  };
};
