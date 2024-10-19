import { useState } from "react";

import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";

const Tiptap = () => {
  const [htmlContent, setHtmlContent] = useState<string>("");

  // Tạo editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      BulletList.configure({ HTMLAttributes: { class: "px-2" } }),
      ListItem,
      Document,
      Paragraph,
      Bold,
      Italic,
    ],
    content: "Chào mừng đến với Tiptap Editor!",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setHtmlContent(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div>
      <button onClick={() => editor?.chain().focus().toggleBulletList().run()}>
        list item
      </button>

      <button
        onClick={() => {
          const html = editor?.getHTML(); // Lấy HTML từ editor
          console.log(html);
          setHtmlContent(html as string);
        }}
        style={{ marginTop: "20px" }}
      >
        Get HTML Content
      </button>
      <div className=" ">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Tiptap;
