"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { type FileNode, useIDEStore } from "@/store/ideStore"
import { fetchFileStructure } from "@/services/ide-api"
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText, FileCode, FileType, Loader2 } from "lucide-react"
import ContextMenu from "./ContextMenu"
import FileNameInput from "./Filenameinput"

const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase()

  switch (ext) {
    case "tsx":
    case "ts":
    case "js":
    case "jsx":
      return <FileCode className="w-4 h-4 text-blue-400" />
    case "css":
    case "scss":
    case "sass":
      return <FileType className="w-4 h-4 text-pink-400" />
    case "html":
      return <FileType className="w-4 h-4 text-orange-400" />
    case "json":
      return <FileType className="w-4 h-4 text-yellow-400" />
    case "md":
      return <FileText className="w-4 h-4 text-gray-300" />
    default:
      return <FileText className="w-4 h-4 text-file-tree-file" />
  }
}

interface FileTreeItemProps {
  node: FileNode
  depth: number
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void
  renamingNode: string | null
  onRename: (node: FileNode, newName: string) => void
  onCancelRename: () => void
  creatingFile: string | null
  creatingFolder: string | null
  onCreateFileSubmit: (name: string) => void
  onCreateFolderSubmit: (name: string) => void
  onCancelCreate: () => void
  isLastChild?: boolean
  parentIsLastChild?: boolean[]
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({
  node,
  depth,
  onContextMenu,
  renamingNode,
  onRename,
  onCancelRename,
  creatingFile,
  creatingFolder,
  onCreateFileSubmit,
  onCreateFolderSubmit,
  onCancelCreate,
  isLastChild = false,
  parentIsLastChild = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2)
  const [isDragOver, setIsDragOver] = useState(false)
  const { activeFile, openFile, moveNode } = useIDEStore()
  const isSelected = activeFile === node.path
  const isRenaming = renamingNode === node.path

  const handleClick = () => {
    if (isRenaming) return

    if (node.type === "folder") {
      setIsExpanded(!isExpanded)
    } else {
      openFile(node.path)
    }
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", node.path)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (node.type === "folder") {
      e.preventDefault()
      e.dataTransfer.dropEffect = "move"
      setIsDragOver(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    if (node.type === "folder") {
      const sourcePath = e.dataTransfer.getData("text/plain")
      if (sourcePath && sourcePath !== node.path) {
        moveNode(sourcePath, node.path)
      }
    }
  }

  return (
    <div>
      <div className="relative">
        {depth > 0 && (
          <div className="absolute left-0 top-0 bottom-0 pointer-events-none">
            {parentIsLastChild.map((isLast, index) => (
              <div
                key={index}
                className={`absolute top-0 bottom-0 w-px ${isLast ? "bg-transparent" : "bg-border/30"}`}
                style={{ left: `${index * 12 + 14}px` }}
              />
            ))}
            <div className="absolute top-4 w-3 h-px bg-border/30" style={{ left: `${depth * 12 + 2}px` }} />
            {!isLastChild && (
              <div className="absolute top-4 bottom-0 w-px bg-border/30" style={{ left: `${depth * 12 + 14}px` }} />
            )}
          </div>
        )}

        <div
          className={`
            flex items-center px-2 py-1 cursor-pointer select-none transition-fast relative
            hover:bg-ide-sidebar-hover
            ${isSelected ? "bg-file-tree-selected/20 border-l-2 border-file-tree-selected" : ""}
            ${isDragOver ? "bg-blue-500/20 border border-blue-500" : ""}
          `}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={handleClick}
          onContextMenu={(e) => onContextMenu(e, node)}
          draggable={!isRenaming}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {node.type === "folder" ? (
            <>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 mr-1 text-file-tree-folder" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-1 text-file-tree-folder" />
              )}
              {isExpanded ? (
                <FolderOpen className="w-4 h-4 mr-2 text-file-tree-folder" />
              ) : (
                <Folder className="w-4 h-4 mr-2 text-file-tree-folder" />
              )}
            </>
          ) : (
            <>
              <div className="w-4 mr-1" />
              {getFileIcon(node.name)}
              <span className="ml-2" />
            </>
          )}

          {isRenaming ? (
            <FileNameInput
              initialValue={node.name}
              onSave={(newName) => onRename(node, newName)}
              onCancel={onCancelRename}
            />
          ) : (
            <span className={`text-sm ${node.type === "folder" ? "text-file-tree-folder" : "text-file-tree-file"}`}>
              {node.name}
            </span>
          )}
        </div>
      </div>

      {creatingFile === node.path && (
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 pointer-events-none">
            {[...parentIsLastChild, false].map((isLast, index) => (
              <div
                key={index}
                className={`absolute top-0 bottom-0 w-px ${isLast ? "bg-transparent" : "bg-border/30"}`}
                style={{ left: `${index * 12 + 14}px` }}
              />
            ))}
            <div className="absolute top-4 w-3 h-px bg-border/30" style={{ left: `${(depth + 1) * 12 + 2}px` }} />
          </div>

          <div className="flex items-center px-2 py-1" style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}>
            <div className="w-4 mr-1" />
            <FileText className="w-4 h-4 mr-2 text-file-tree-file" />
            <FileNameInput initialValue="" onSave={onCreateFileSubmit} onCancel={onCancelCreate} />
          </div>
        </div>
      )}

      {creatingFolder === node.path && (
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 pointer-events-none">
            {[...parentIsLastChild, false].map((isLast, index) => (
              <div
                key={index}
                className={`absolute top-0 bottom-0 w-px ${isLast ? "bg-transparent" : "bg-border/30"}`}
                style={{ left: `${index * 12 + 14}px` }}
              />
            ))}
            <div className="absolute top-4 w-3 h-px bg-border/30" style={{ left: `${(depth + 1) * 12 + 2}px` }} />
          </div>

          <div className="flex items-center px-2 py-1" style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}>
            <ChevronRight className="w-4 h-4 mr-1 text-file-tree-folder" />
            <Folder className="w-4 h-4 mr-2 text-file-tree-folder" />
            <FileNameInput initialValue="" onSave={onCreateFolderSubmit} onCancel={onCancelCreate} />
          </div>
        </div>
      )}

      {node.type === "folder" && isExpanded && node.children && (
        <div>
          {node.children.map((child, index) => (
            <FileTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              onContextMenu={onContextMenu}
              renamingNode={renamingNode}
              onRename={onRename}
              onCancelRename={onCancelRename}
              creatingFile={creatingFile}
              creatingFolder={creatingFolder}
              onCreateFileSubmit={onCreateFileSubmit}
              onCreateFolderSubmit={onCreateFolderSubmit}
              onCancelCreate={onCancelCreate}
              isLastChild={index === (node?.children?.length ?? 0) - 1}
              parentIsLastChild={[...parentIsLastChild, isLastChild]}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const FileTree: React.FC = () => {
  const {
    files,
    setFiles,
    connurl,
    createFile,
    createFolder,
    renameNode,
    deleteNode,
  } = useIDEStore()

  const [initialLoading, setInitialLoading] = useState(true)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    node: FileNode | null
  } | null>(null)
  const [renamingNode, setRenamingNode] = useState<string | null>(null)
  const [creatingFile, setCreatingFile] = useState<string | null>(null)
  const [creatingFolder, setCreatingFolder] = useState<string | null>(null)

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null)
    }

    if (contextMenu) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [contextMenu])

  useEffect(() => {
    if (!connurl) return
    const loadFiles = async () => {
      try {
        const fileStructure = await fetchFileStructure(connurl)
        setFiles(fileStructure)
      } catch (error) {
        console.error("Error fetching file structure:", error)
      } finally {
        setInitialLoading(false)
      }
    }

    loadFiles() // eslint-disable-line
  }, [connurl, setFiles])

  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      node,
    })
  }

  const handleCreateFile = (parentPath: string) => {
    setCreatingFile(parentPath)
  }

  const handleCreateFolder = (parentPath: string) => {
    setCreatingFolder(parentPath)
  }

  const handleRename = (node: FileNode) => {
    setRenamingNode(node.path)
  }

  const handleDelete = (node: FileNode) => {
    if (confirm(`Are you sure you want to delete "${node.name}"?`)) {
      deleteNode(node.path)
    }
  }

  const handleRenameSubmit = (node: FileNode, newName: string) => {
    if (newName !== node.name) {
      renameNode(node.path, newName)
    }
    setRenamingNode(null)
  }

  const handleCreateFileSubmit = (name: string) => {
    if (creatingFile !== null) {
      createFile(creatingFile, name)
      setCreatingFile(null)
    }
  }

  const handleCreateFolderSubmit = (name: string) => {
    if (creatingFolder !== null) {
      createFolder(creatingFolder, name)
      setCreatingFolder(null)
    }
  }

  const handleCancelCreate = () => {
    setCreatingFile(null)
    setCreatingFolder(null)
  }

  if (initialLoading) {
    return (
      <div className="w-64 h-full bg-ide-sidebar border-r border-ide-sidebar-border flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="w-64 h-full overflow-y-auto bg-ide-sidebar border-r border-ide-sidebar-border">
      <div className="p-3 border-b border-ide-sidebar-border">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Explorer</h2>
      </div>
      <div className="py-2">
        {files.map((node, index) => (
          <FileTreeItem
            key={node.id}
            node={node}
            depth={1}
            onContextMenu={handleContextMenu}
            renamingNode={renamingNode}
            onRename={handleRenameSubmit}
            onCancelRename={() => setRenamingNode(null)}
            creatingFile={creatingFile}
            creatingFolder={creatingFolder}
            onCreateFileSubmit={handleCreateFileSubmit}
            onCreateFolderSubmit={handleCreateFolderSubmit}
            onCancelCreate={handleCancelCreate}
            isLastChild={index === files.length - 1}
            parentIsLastChild={[]}
          />
        ))}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          node={contextMenu.node}
          onClose={() => setContextMenu(null)}
          onCreateFile={handleCreateFile}
          onCreateFolder={handleCreateFolder}
          onRename={handleRename}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

export default FileTree