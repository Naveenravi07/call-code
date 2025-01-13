import { useState } from 'react'

export default function Terminal() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState<string[]>(['Welcome to Web IDE Terminal'])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setOutput([...output, `$ ${input}`, 'Command executed successfully'])
    setInput('')
  }

  return (
    <div className="h-full bg-[#1e1e1e] font-mono text-sm p-2 overflow-auto">
      {output.map((line, index) => (
        <div key={index} className="text-gray-300 mb-1">{line}</div>
      ))}
      <form onSubmit={handleSubmit} className="flex items-center">
        <span className="text-gray-300 mr-2">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent text-gray-300 focus:outline-none"
        />
      </form>
    </div>
  )
}


