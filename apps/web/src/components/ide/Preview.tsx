export default function Preview() {
  return (
    <div className="h-full bg-[#1e1e1e] flex flex-col">
      <div className="bg-[#252526] text-sm px-4 py-1 text-gray-400 border-b border-[#333333] flex items-center">
        <span>Preview</span>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="flex justify-center space-x-8 mb-8">
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-G1DRb164JTXmONaEOGppSTDC0TBR2L.png" alt="Preview" className="w-32 h-32" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-4">
            Web IDE Preview
          </h2>
          <p className="text-gray-400">
            Edit your code on the left to see changes here
          </p>
        </div>
      </div>
    </div>
  )
}


