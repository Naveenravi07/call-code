import { useState } from 'react';
import Editor from '@/components/ide/editor';

export default function Playground() {
  const [showFileTree, setShowFileTree] = useState(true);
  const [showTerminal, setShowTerminal] = useState(true);
  const [showTextEditor, setShowTextEditor] = useState(true);
  const [showPreview, setShowPreview] = useState(true);

  return (
    <Editor/>
  );
}
