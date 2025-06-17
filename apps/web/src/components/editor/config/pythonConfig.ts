import helloPy from '../dummy/hello.py';
import hello2Py from '../dummy/hello2.py';
import { LanguageSetup } from '../types';

export const pythonSetup: LanguageSetup = {
    languageId: 'python',
    extensionName: 'mlc-python-example',
    files: {
        'hello.py': helloPy,
        'hello2.py': hello2Py
    },
    defaultFile: 'hello2.py',
    languageServerPath: 'pyright',
    debuggerCommand: 'graalpy --dap --dap.WaitAttached --dap.Suspend=true'
};
