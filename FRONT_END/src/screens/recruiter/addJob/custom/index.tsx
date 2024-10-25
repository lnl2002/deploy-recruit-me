import { useEffect, useState } from "react";

import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Bold from "@tiptap/extension-bold";
import Placeholder from "@tiptap/extension-placeholder";
import Italic from "@tiptap/extension-italic";
import { BoldIcon, ItalicIcon, List } from "lucide-react";
import Heading from "@tiptap/extension-heading";
import { Select, SelectItem } from "@nextui-org/react";

type Level = 1 | 2 | 3 | 4 | 5 | 6;

type TiptapProps = {
  label: string;
  handleChange: (value: string, label: string) => void;
  content?: string;
  isRequired: boolean;
  errorMessage?: string;
  isInvalid?: boolean;
};

const Tiptap: React.FC<TiptapProps> = ({
  handleChange,
  label,
  isRequired,
  content,
  errorMessage,
  isInvalid,
}): React.JSX.Element => {
  const [valueSelected, setValueSelected] = useState<number>(0);

  // Tạo editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      BulletList.configure({
        HTMLAttributes: {
          class: "px-2 py-1",
        },
      }),
      ListItem,
      Document,
      Paragraph,
      Bold.configure({ HTMLAttributes: { class: "font-bold" } }),
      Italic,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      Placeholder.configure({
        placeholder: "Chào mừng đến với Tiptap Editor!", // Set your placeholder text
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();

      handleChange(html, label.toLowerCase());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose-base outline ${
          !isInvalid ? "outline-[#DDD]" : "outline-none"
        } outline-[2px] lg:prose-lg xl:prose-2xl m-1 focus:outline-[#999] text-themeDark ${
          !isInvalid ? "bg-[#f4f4f5]" : "bg-[#fee7ef]"
        } shadow-sm px-4 py-2 rounded-lg`,
      },
    },
    immediatelyRender: false,
  });

  if (!editor) {
    return <div></div>;
  }

  const handleSelectionChange = (event: any) => {
    const level = Number(event.target.value);
    setValueSelected(level);
    if (level === 0) {
      editor.chain().focus().setParagraph().run();
    } else
      editor
        .chain()
        .focus()
        .toggleHeading({
          level: level as Level,
        })
        .run();
  };

  return (
    <div className="mt-[32px]">
      <div>
        <label className={`text-[14px] ${!isInvalid ? "" : "text-[#f31260]"}`}>
          {label}
        </label>
        <span className="text-[#f31260]">{isRequired && "*"}</span>
      </div>
      <div className="flex gap-2 items-center">
        <Select
          aria-label="Select header"
          size="sm"
          classNames={{
            trigger: "bg-themeWhite hover:bg-themeWhite",
            base: "w-36",
          }}
          defaultSelectedKeys={[0]}
          selectedKeys={String(valueSelected)}
          onChange={handleSelectionChange}
        >
          {Array.from({ length: 7 }).map((_, index) => (
            <SelectItem className="text-themeDark" key={index}>
              {index > 0 ? `Heading ${index}` : "Paragraph"}
            </SelectItem>
          ))}
        </Select>
        <List
          className="p-1 cursor-pointer"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          color="#000"
          size={28}
        />
        <BoldIcon
          className="p-1 cursor-pointer"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          color="#000"
          size={28}
        />
        <ItalicIcon
          className="p-1 cursor-pointer"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          color="#000"
          size={28}
        />
      </div>
      <EditorContent editor={editor} />
      {isInvalid && (
        <p className="text-tiny px-2 text-[#f31260] mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

export default Tiptap;
