"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect } from "react";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  SquareCode,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  value: unknown;
  onChange: (json: unknown) => void;
};

/**
 * Tiptap editor locked to the PROJECT_CONTEXT §5 subset:
 *   bold, italic, H2/H3, ul/ol, link, code (inline + block), blockquote, image.
 * No fonts, no colors, no tables. Body JSON serialized via editor.getJSON().
 */
export function TiptapEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: { class: "rounded-md" },
      }),
    ],
    content: value ?? { type: "doc", content: [] },
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => onChange(e.getJSON()),
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm sm:prose-base max-w-none min-h-[24rem] focus:outline-none px-4 py-3",
      },
    },
  });

  // If the parent replaces `value` (e.g. reset on edit page), sync the editor.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getJSON();
    if (JSON.stringify(current) !== JSON.stringify(value)) {
      editor.commands.setContent(value ?? { type: "doc", content: [] }, {
        emitUpdate: false,
      });
    }
    // Only run when the value ref changes, not on every render.
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className="border-input rounded-md border">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

/* ---------------------------------- toolbar ---------------------------------- */

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="border-input bg-muted/40 flex flex-wrap items-center gap-1 border-b p-1">
      <TB
        editor={editor}
        cmd={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        label="Bold"
        icon={Bold}
      />
      <TB
        editor={editor}
        cmd={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        label="Italic"
        icon={Italic}
      />
      <TB
        editor={editor}
        cmd={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        label="Heading 2"
        icon={Heading2}
      />
      <TB
        editor={editor}
        cmd={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        label="Heading 3"
        icon={Heading3}
      />
      <TB
        editor={editor}
        cmd={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        label="Bullet list"
        icon={List}
      />
      <TB
        editor={editor}
        cmd={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        label="Numbered list"
        icon={ListOrdered}
      />
      <TB
        editor={editor}
        cmd={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        label="Blockquote"
        icon={Quote}
      />
      <TB
        editor={editor}
        cmd={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        label="Inline code"
        icon={Code}
      />
      <TB
        editor={editor}
        cmd={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
        label="Code block"
        icon={SquareCode}
      />
      <TB
        editor={editor}
        cmd={() => {
          const prev = (editor.getAttributes("link").href as string) ?? "";
          const url = window.prompt("URL", prev);
          if (url === null) return; // cancelled
          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();
        }}
        active={editor.isActive("link")}
        label="Link"
        icon={LinkIcon}
      />
      <TB
        editor={editor}
        cmd={() => {
          const url = window.prompt("Image URL");
          if (!url) return;
          editor.chain().focus().setImage({ src: url }).run();
        }}
        active={false}
        label="Image"
        icon={ImageIcon}
      />

      <span className="mx-1 h-4 w-px bg-white/10" aria-hidden />

      <TB
        editor={editor}
        cmd={() => editor.chain().focus().undo().run()}
        active={false}
        disabled={!editor.can().undo()}
        label="Undo"
        icon={Undo2}
      />
      <TB
        editor={editor}
        cmd={() => editor.chain().focus().redo().run()}
        active={false}
        disabled={!editor.can().redo()}
        label="Redo"
        icon={Redo2}
      />
    </div>
  );
}

type TBProps = {
  editor: Editor;
  cmd: () => void;
  active: boolean;
  disabled?: boolean;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

function TB({ cmd, active, disabled, label, icon: Icon }: TBProps) {
  return (
    <Button
      type="button"
      size="icon"
      variant={active ? "default" : "ghost"}
      disabled={disabled}
      onClick={cmd}
      aria-label={label}
      title={label}
      className="size-8"
    >
      <Icon className="size-4" />
    </Button>
  );
}
