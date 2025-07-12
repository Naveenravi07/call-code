import { LanguageSetup } from '../types';
import helloPyCode from '../dummy/hello.py?raw';
import '@codingame/monaco-vscode-python-default-extension';
import '@codingame/monaco-vscode-typescript-language-features-default-extension';
import '@codingame/monaco-vscode-typescript-basics-default-extension';
import hello2PyCode from '../dummy/hello2.py?raw';

export const typescriptSetup: LanguageSetup = {
  languageId: 'typescript',
  debugExtensionName: 'debugger-py-client',
  extensionName: 'mlc-python-example',
  files: {
    'hello.ts': helloPyCode,
    'hello2.ts': hello2PyCode,
  },
  defaultFile: 'hello2.ts',
  languageServerPath: '',
  debuggerCommand: 'graalpy --dap --dap.WaitAttached --dap.Suspend=true',
};
