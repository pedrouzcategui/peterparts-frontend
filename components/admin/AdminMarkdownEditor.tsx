"use client";

import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-80 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 text-sm text-muted-foreground">
      Cargando editor...
    </div>
  ),
});

interface AdminMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function AdminMarkdownEditor({
  value,
  onChange,
  placeholder,
}: AdminMarkdownEditorProps) {
  return (
    <div
      data-color-mode="light"
      className="markdown-editor"
      suppressHydrationWarning
    >
      <MDEditor
        value={value}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        preview="live"
        height={360}
        visibleDragbar={false}
        textareaProps={{
          placeholder,
        }}
      />
    </div>
  );
}
