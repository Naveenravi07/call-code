import { ChevronRight, Folder, File } from 'lucide-react'

export default function FileTree() {
  return (
    <div className="text-sm text-gray-400 p-2">
      <div className="flex items-center py-1 hover:bg-[#2a2d2e] rounded px-2 cursor-pointer">
        <ChevronRight className="h-4 w-4 mr-1" />
        <Folder className="h-4 w-4 mr-2 text-[#dcb67a]" />
        <span>src</span>
      </div>
      <div className="ml-4">
        <div className="flex items-center py-1 hover:bg-[#2a2d2e] rounded px-2 cursor-pointer">
          <File className="h-4 w-4 mr-2 text-[#519aba]" />
          <span>App.tsx</span>
        </div>
        <div className="flex items-center py-1 hover:bg-[#2a2d2e] rounded px-2 cursor-pointer">
          <File className="h-4 w-4 mr-2 text-[#519aba]" />
          <span>main.tsx</span>
        </div>
        <div className="flex items-center py-1 hover:bg-[#2a2d2e] rounded px-2 cursor-pointer">
          <File className="h-4 w-4 mr-2 text-[#cc6699]" />
          <span>styles.css</span>
        </div>
      </div>
    </div>
  )
}


