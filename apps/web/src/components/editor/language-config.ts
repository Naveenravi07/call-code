import * as vscode from 'vscode';
import {
  RegisteredFileSystemProvider,
  RegisteredMemoryFile,
  registerFileSystemOverlay,
} from '@codingame/monaco-vscode-files-service-override';
import { createDefaultWorkspaceFile, createDebugLaunchConfigFile } from './utils';
import type { ConfigParams, FileDefinition, LanguageSetup } from './types';

export const createDefaultConfigParams = (
  homeDir: string,
  htmlContainer: HTMLElement | undefined,
  setup: LanguageSetup,
): ConfigParams => {
  const files = new Map<string, FileDefinition>();
  const workspaceRoot = `${homeDir}/workspace`;
  const workspaceFile = vscode.Uri.file(`${homeDir}/.vscode/workspace.code-workspace`);

  for (const [filename, code] of Object.entries(setup.files)) {
    const filePath = `${workspaceRoot}/${filename}`;
    const fileUri = vscode.Uri.file(filePath);
    files.set(filename, { code, path: filePath, uri: fileUri });
  }

  const fileSystemProvider = new RegisteredFileSystemProvider(false);
  for (const file of files.values()) {
    fileSystemProvider.registerFile(new RegisteredMemoryFile(file.uri, file.code));
  }
  fileSystemProvider.registerFile(createDefaultWorkspaceFile(workspaceFile, workspaceRoot));
  if (setup.debuggerCommand) {
    fileSystemProvider.registerFile(createDebugLaunchConfigFile(workspaceRoot, setup.languageId));
  }

  registerFileSystemOverlay(1, fileSystemProvider);

  return {
    extensionName: setup.extensionName,
    languageId: setup.languageId,
    documentSelector: [setup.languageId],
    homeDir,
    workspaceRoot,
    workspaceFile,
    htmlContainer,
    protocol: 'ws',
    hostname: 'localhost',
    port: 55555,
    files,
    defaultFile: `${workspaceRoot}/${setup.defaultFile}`,
    helpContainerCmd: '',
    debuggerExecCall: setup.debuggerCommand ?? '',
  };
};
