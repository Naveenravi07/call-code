import { Button } from "@/components/ui/button"
import { FolderTree, TerminalIcon, Edit, Layout } from 'lucide-react'

interface BottomControlBarProps {
  showFileTree: boolean
  showTerminal: boolean
  showTextEditor: boolean
  showPreview: boolean
  setShowFileTree: (show: boolean) => void
  setShowTerminal: (show: boolean) => void
  setShowTextEditor: (show: boolean) => void
  setShowPreview: (show: boolean) => void
}

export default function BottomControlBar({
  showFileTree,
  showTerminal,
  showTextEditor,
  showPreview,
  setShowFileTree,
  setShowTerminal,
  setShowTextEditor,
  setShowPreview,
}: BottomControlBarProps) {
  return (
    <div className="bg-[#252526] p-2 flex justify-center space-x-4 border-t border-[#333333]">
      <Button
        variant={showFileTree ? "default" : "outline"}
        size="icon"
        onClick={() => setShowFileTree(!showFileTree)}
        className="h-8 w-8"
      >
        <FolderTree className="h-4 w-4" />
      </Button>
      <Button
        variant={showTerminal ? "default" : "outline"}
        size="icon"
        onClick={() => setShowTerminal(!showTerminal)}
        className="h-8 w-8"
      >
        <TerminalIcon className="h-4 w-4" />
      </Button>
      <Button
        variant={showTextEditor ? "default" : "outline"}
        size="icon"
        onClick={() => setShowTextEditor(!showTextEditor)}
        className="h-8 w-8"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant={showPreview ? "default" : "outline"}
        size="icon"
        onClick={() => setShowPreview(!showPreview)}
        className="h-8 w-8"
      >
        <Layout className="h-4 w-4" />
      </Button>
    </div>
  )
}


