export default function TextEditor() {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-[#252526] text-sm px-4 py-1 text-gray-400 border-b border-[#333333] flex items-center">
        <span>App.tsx</span>
      </div>
      <div className="flex-1 p-4 font-mono text-sm overflow-auto">
        <pre className="text-gray-300">
          <code>{`import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="container">
      <h1>Web IDE Example</h1>
      <button onClick={() => setCount(count + 1)}>
        Count is {count}
      </button>
    </div>
  );
}`}</code>
        </pre>
      </div>
    </div>
  )
}


