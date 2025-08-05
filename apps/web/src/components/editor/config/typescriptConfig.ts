import { LanguageSetup } from '../types';
import '@codingame/monaco-vscode-typescript-basics-default-extension';
import '@codingame/monaco-vscode-typescript-language-features-default-extension';

export const typescriptSetup: LanguageSetup = {
  languageId: 'typescript',
  debugExtensionName: 'debugger-ts-client',
  extensionName: 'mlc-ts-example',
  defaultFile: 'src/App.jsx',
  languageServerPath: '',
  debuggerCommand: 'graalpy --dap --dap.WaitAttached --dap.Suspend=true',
};
