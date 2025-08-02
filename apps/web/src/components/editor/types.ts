import { Uri } from 'vscode';

export type FileDefinition = {
  path: string;
  code: string;
  uri: Uri;
};

export type InitMessage = {
  id: 'init';
  defaultFile: string;
  debuggerExecCall: string;
};

export type LanguageSetup = {
  languageId: string;
  extensionName: string;
  debugExtensionName: string;
  defaultFile: string;
  languageServerPath: string;
  debuggerCommand?: string;
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
  defaultFile: string;
  helpContainerCmd: string;
  debuggerExecCall: string;
  debugExtensionName: string;
};
