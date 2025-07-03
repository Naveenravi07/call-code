import { LanguageSetup } from '../types';

const helloPy = `
    print("Hello world")
`;

const hello2Py = `
    print("Hello world")

`;
export const pythonSetup: LanguageSetup = {
  languageId: 'python',
  extensionName: 'mlc-python-example',
  files: {
    'hello.py': helloPy,
    'hello2.py': hello2Py,
  },
  defaultFile: 'hello2.py',
  languageServerPath: 'pyright',
  debuggerCommand: 'graalpy --dap --dap.WaitAttached --dap.Suspend=true',
};
