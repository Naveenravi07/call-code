import { LanguageSetup } from '../types';
import helloPyCode from '../dummy/hello.py?raw';
import '@codingame/monaco-vscode-python-default-extension';
import hello2PyCode from '../dummy/hello2.py?raw';

export const pythonSetup: LanguageSetup = {
  languageId: 'python',
  debugExtensionName:'debugger-py-client',
  extensionName: 'mlc-python-example',
  files: {
    'hello.py': helloPyCode,
    'hello2.py': hello2PyCode,
  },
  defaultFile: 'hello2.py',
  languageServerPath: 'pyright',
  debuggerCommand: 'graalpy --dap --dap.WaitAttached --dap.Suspend=true',
};
