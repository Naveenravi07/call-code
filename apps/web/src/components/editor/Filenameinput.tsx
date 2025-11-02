'use client';

import type React from 'react';
import { useState, useEffect, useRef } from 'react';

interface FileNameInputProps {
  initialValue: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}

const FileNameInput: React.FC<FileNameInputProps> = ({ initialValue, onSave, onCancel }) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSave(value.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="inline-block">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => (value.trim() ? onSave(value.trim()) : onCancel())}
        className="bg-background border border-border rounded px-1 py-0.5 text-sm w-full min-w-[100px]"
      />
    </form>
  );
};

export default FileNameInput;
