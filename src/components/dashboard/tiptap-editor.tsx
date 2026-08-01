"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { getCldImageUrl } from "next-cloudinary";
import { useEffect, useState } from "react";
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
import {
  ImagePickerDialog,
  type PickedMedia,
} from "@/components/dashboard/image-picker";
import type { MediaOption } from "@/components/dashboard/media-picker";

type Props = {
  value: unknown;
  onChange: (json: unknown) => void;
  /**
   * The media library the toolbar Image tool draws from. Passed through from
   * the post form's server-side fetch.
   */
  mediaOptions: MediaOption[];
};

/**
 * Tiptap editor locked to the PROJECT_CONTEXT §5 subset:
 *   bold, italic, H2/H3, ul/ol, link, code (inline + block), blockquote, image.
 * No fonts, no colors, no tables. Body JSON serialized via editor.getJSON().
 */
export function TiptapEditor({ value, onChange, mediaOptions }: Props) {
  const [focused, setFocused] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // StarterKit v3 bundles Link; disable it and add our configured Link
        // instance below (otherwise tiptap warns about duplicate 'link').
        link: false,
        // Don't allow bold inside headings — prose CSS already renders
        // headings bold, and letting the mark apply confuses the toolbar's
        // "is bold active" indicator.
        bold: { HTMLAttributes: {} },
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
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
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

  const handleImagePicked = (media: PickedMedia) => {
    // Insert a delivery-optimized Cloudinary URL (max 1200px wide, f_auto/q_auto).
    const src = getCldImageUrl({ src: media.publicId, width: 1200 });
    editor?.chain().focus().setImage({ src, alt: media.originalName }).run();
    setPickerOpen(false);
  };

  if (!editor) return null;

  return (
    // relative + isolate so the sticky toolbar stacks above the prose content
    // while the container itself scrolls with the outer page.
    <div className="border-input relative isolate rounded-md border">
      <Toolbar
        editor={editor}
        focused={focused}
        onImageClick={() => setPickerOpen(true)}
      />
      <EditorContent editor={editor} />
      <ImagePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        options={mediaOptions}
        onSelect={handleImagePicked}
      />
    </div>
  );
}

/* ---------------------------------- toolbar ---------------------------------- */

function Toolbar({
  editor,
  focused,
  onImageClick,
}: {
  editor: Editor;
  focused: boolean;
  onImageClick: () => void;
}) {
  // `active` only lights up while the selection is actually inside the editor.
  // When the user tabs into the title/meta fields, all buttons revert to idle.
  const isActive = (name: string, attrs?: Record<string, unknown>): boolean =>
    focused && editor.isActive(name, attrs);

  return (
    <div
      // sticky within the editor container so it hugs the top as the user
      // scrolls the body. Offset by 3.5rem to clear the dashboard header
      // (also sticky top-0, h-14). z-10 keeps it above the prose.
      className="border-input bg-background/95 sticky top-14 z-10 flex flex-wrap items-center gap-1 rounded-t-md border-b p-1 backdrop-blur"
    >
      <TB
        // preventDefault on mousedown keeps focus in the editor when the user
        // clicks a toolbar button, so `focused` doesn't flicker off.
        cmd={() => editor.chain().focus().toggleBold().run()}
        // Don't light up Bold while the cursor is inside a heading — headings
        // are rendered bold by prose CSS but no bold mark is actually applied.
        active={isActive("bold") && !editor.isActive("heading")}
        label="Bold"
        icon={Bold}
      />
      <TB
        cmd={() => editor.chain().focus().toggleItalic().run()}
        active={isActive("italic")}
        label="Italic"
        icon={Italic}
      />
      <TB
        cmd={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={isActive("heading", { level: 2 })}
        label="Heading 2"
        icon={Heading2}
      />
      <TB
        cmd={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={isActive("heading", { level: 3 })}
        label="Heading 3"
        icon={Heading3}
      />
      <TB
        cmd={() => editor.chain().focus().toggleBulletList().run()}
        active={isActive("bulletList")}
        label="Bullet list"
        icon={List}
      />
      <TB
        cmd={() => editor.chain().focus().toggleOrderedList().run()}
        active={isActive("orderedList")}
        label="Numbered list"
        icon={ListOrdered}
      />
      <TB
        cmd={() => editor.chain().focus().toggleBlockquote().run()}
        active={isActive("blockquote")}
        label="Blockquote"
        icon={Quote}
      />
      <TB
        cmd={() => editor.chain().focus().toggleCode().run()}
        active={isActive("code")}
        label="Inline code"
        icon={Code}
      />
      <TB
        cmd={() => editor.chain().focus().toggleCodeBlock().run()}
        active={isActive("codeBlock")}
        label="Code block"
        icon={SquareCode}
      />
      <TB
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
        active={isActive("link")}
        label="Link"
        icon={LinkIcon}
      />
      <TB cmd={onImageClick} active={false} label="Image" icon={ImageIcon} />

      <span className="border-border mx-1 h-4 w-px border-l" aria-hidden />

      <TB
        cmd={() => editor.chain().focus().undo().run()}
        active={false}
        disabled={!editor.can().undo()}
        label="Undo"
        icon={Undo2}
      />
      <TB
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
      // Prevent the editor from blurring when the user clicks a toolbar
      // button — clicking would otherwise fire mousedown → blur → click and
      // the `focused` state (which drives `active`) would flash off.
      onMouseDown={(e) => e.preventDefault()}
      onClick={cmd}
      aria-label={label}
      title={label}
      className="size-8"
    >
      <Icon className="size-4" />
    </Button>
  );
}
