import { FC, TextareaHTMLAttributes, useMemo } from "react";
import { SerializedRichText } from "types";
import { createEditor, Descendant } from "slate";
import { Editable, RenderLeafProps, Slate, withReact } from "slate-react";
import { withHistory } from "slate-history";
import { deserializeRichText } from "helpers";
import { Toolbar } from "./Toolbar";

const DEFAULT_FONT = "Arial";
const DEFAULT_FONT_SIZE = 11;

type Props = {
  serializedContent?: SerializedRichText;
  canEdit?: boolean;
} & Omit<TextareaHTMLAttributes<HTMLDivElement>, "readOnly">;

const RichTextContent: FC<Props> = ({
  serializedContent,
  canEdit,
  ...attributes
}) => {
  const editor = useMemo(() => withReact(withHistory(createEditor())), []);
  const content = useMemo<Descendant[]>(() => {
    if (!serializedContent) {
      return [{ type: "paragraph", children: [{ text: "" }] }]; // empty rich text editor
    }

    return (
      deserializeRichText(serializedContent) ?? [
        {
          type: "paragraph",
          children: [
            {
              text: "Uh oh! The serialized rich text data seems to be corrupted...",
              bold: true,
              color: "#ff0000",
              font: "Courier New",
              size: 13,
            },
          ],
        },
      ]
    );
  }, [serializedContent]);

  return (
    <Slate
      editor={editor}
      value={content}
      onChange={(v) => console.log(JSON.stringify(v))}
    >
      {canEdit && <Toolbar />}
      <Editable renderLeaf={renderLeaf} readOnly={!canEdit} {...attributes} />
    </Slate>
  );
};

const renderLeaf = ({
  attributes,
  children,
  leaf: { bold, italic, underline, strike, align, font, size, color, bgColor },
}: RenderLeafProps): JSX.Element => {
  switch (align) {
    case "super":
      children = <sup style={{ verticalAlign: "super" }}>{children}</sup>;
      break;
    case "sub":
      children = <sub style={{ verticalAlign: "sub" }}>{children}</sub>;
      break;
  }

  return (
    <span
      {...attributes}
      style={{
        fontWeight: bold ? "bold" : "normal",
        fontStyle: italic ? "italic" : "normal",
        textDecoration:
          underline || strike
            ? `${underline ? "underline" : ""} ${strike ? "line-through" : ""}`
            : "none",
        fontFamily: font ?? DEFAULT_FONT,
        fontSize: `${size ?? DEFAULT_FONT_SIZE}pt`,
        color: color ?? "#000000",
        backgroundColor: bgColor ?? "transparent",
      }}
    >
      {children}
    </span>
  );
};

export { RichTextContent };
