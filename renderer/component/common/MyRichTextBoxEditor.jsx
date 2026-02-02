import React, { useState, useEffect } from "react";
import RichTextEditor from "react-rte";

const MyRichTextEditor = ({ value, onChange, initialText }) => {
  const [editorValue, setEditorValue] = useState(
    RichTextEditor.createEmptyValue()
  );

  useEffect(() => {
    if (initialText) {
      setEditorValue(RichTextEditor.createValueFromString(initialText, "html"));
    }
  }, [initialText]);

  const handleChange = (value) => {
    setEditorValue(value);
    if (onChange) {
      onChange(value.toString("html"));
    }
  };

  return (
    <RichTextEditor
      value={editorValue}
      onChange={handleChange}
      placeholder="Start typing..."
      readOnly={false}
      height="120px"
      rootStyle={{
        border: "1px solid #ccc",
        minHeight: "250px",
      }}
    />
  );
};

export default MyRichTextEditor;
