import { FileNode } from '@/store/ideStore';

// Mock data - simulating remote server files
const mockFileStructure: FileNode[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    path: '/src',
    children: [
      {
        id: '2',
        name: 'components',
        type: 'folder',
        path: '/src/components',
        children: [
          {
            id: '3',
            name: 'Button.tsx',
            type: 'file',
            path: '/src/components/Button.tsx',
            language: 'typescript'
          },
          {
            id: '4',
            name: 'Header.tsx',
            type: 'file',
            path: '/src/components/Header.tsx',
            language: 'typescript'
          }
        ]
      },
      {
        id: '5',
        name: 'utils',
        type: 'folder',
        path: '/src/utils',
        children: [
          {
            id: '6',
            name: 'helpers.ts',
            type: 'file',
            path: '/src/utils/helpers.ts',
            language: 'typescript'
          }
        ]
      },
      {
        id: '7',
        name: 'App.tsx',
        type: 'file',
        path: '/src/App.tsx',
        language: 'typescript'
      },
      {
        id: '8',
        name: 'index.css',
        type: 'file',
        path: '/src/index.css',
        language: 'css'
      }
    ]
  },
  {
    id: '9',
    name: 'public',
    type: 'folder',
    path: '/public',
    children: [
      {
        id: '10',
        name: 'index.html',
        type: 'file',
        path: '/public/index.html',
        language: 'html'
      }
    ]
  },
  {
    id: '11',
    name: 'package.json',
    type: 'file',
    path: '/package.json',
    language: 'json'
  },
  {
    id: '12',
    name: 'README.md',
    type: 'file',
    path: '/README.md',
    language: 'markdown'
  }
];

// Mock file contents
const mockFileContents: Record<string, string> = {
  '/src/components/Button.tsx': `import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={\`btn btn-\${variant}\`}
    >
      {children}
    </button>
  );
};`,

  '/src/components/Header.tsx': `import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="header">
      <h1>{title}</h1>
      {subtitle && <p className="subtitle">{subtitle}</p>}
    </header>
  );
};`,

  '/src/utils/helpers.ts': `export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};`,

  '/src/App.tsx': `import React from 'react';
import { Header } from './components/Header';
import { Button } from './components/Button';
import './index.css';

function App() {
  const handleClick = () => {
    console.log('Button clicked!');
  };

  return (
    <div className="App">
      <Header 
        title="My React App" 
        subtitle="Built with TypeScript and love" 
      />
      <main>
        <Button onClick={handleClick} variant="primary">
          Click me!
        </Button>
      </main>
    </div>
  );
}

export default App;`,

  '/src/index.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

.App {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}`,

  '/public/index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="React TypeScript App" />
    <title>React App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`,

  '/package.json': `{
  "name": "my-react-app",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^4.9.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`,

  '/README.md': `# My React TypeScript Project

This project was bootstrapped with Create React App and TypeScript.

## Available Scripts

In the project directory, you can run:

### \`npm start\`

Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### \`npm test\`

Launches the test runner in interactive watch mode.

### \`npm run build\`

Builds the app for production to the \`build\` folder.

## Features

- TypeScript support
- Modern React with hooks
- CSS modules
- Hot reloading

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).
`
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions - replace these URLs with your actual endpoints
export const fetchFileStructure = async (): Promise<FileNode[]> => {
  await delay(500); // Simulate network delay
  
  // TODO: Replace with actual API call
  // const response = await fetch('/api/files');
  // return response.json();
  

  return mockFileStructure;
};

export const fetchFileContent = async (filePath: string): Promise<string> => {
  await delay(300); // Simulate network delay
  
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/files/content?path=${encodeURIComponent(filePath)}`);
  // return response.text();
  
  return mockFileContents[filePath] || `// File content for ${filePath}\n// This file is empty or not found.`;
};

export const saveFileContent = async (filePath: string, content: string): Promise<void> => {
  await delay(200);
  
  // TODO: Replace with actual API call
  // await fetch(`/api/files/content`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ path: filePath, content })
  // });
  
  mockFileContents[filePath] = content;
  console.log(`File saved: ${filePath}`);
};

export const deleteFile = async (filePath: string): Promise<void> => {
  await delay(200);
  
  // TODO: Replace with actual API call
  // await fetch(`/api/files?path=${encodeURIComponent(filePath)}`, {
  //   method: 'DELETE'
  // });
  
  delete mockFileContents[filePath];
  console.log(`File deleted: ${filePath}`);
};

export const createFile = async (filePath: string, content: string = ''): Promise<void> => {
  await delay(200);
  
  // TODO: Replace with actual API call
  // await fetch(`/api/files`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ path: filePath, content })
  // });
  
  mockFileContents[filePath] = content;
  console.log(`File created: ${filePath}`);
};