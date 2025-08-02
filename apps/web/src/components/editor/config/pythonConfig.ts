import { LanguageSetup } from '../types';
import '@codingame/monaco-vscode-python-default-extension';

export const pythonSetup: LanguageSetup = {
  languageId: 'python',
  debugExtensionName: 'debugger-py-client',
  extensionName: 'mlc-python-example',
  defaultFile: 'hello2.py',
  languageServerPath: 'pyright',
  debuggerCommand: 'graalpy --dap --dap.WaitAttached --dap.Suspend=true',
};
