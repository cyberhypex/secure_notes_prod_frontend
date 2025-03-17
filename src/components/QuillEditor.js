import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css"; // Ensure styles are imported
import PropTypes from "prop-types";
import React from "react";

const QuillEditor = forwardRef(
  ({ readOnly, defaultValue, onTextChange, onSelectionChange, modules }, ref) => {
    const containerRef = useRef(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);
    const quillInstance = useRef(null);

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    }, [onTextChange, onSelectionChange]);

    useEffect(() => {
      if (quillInstance.current) {
        quillInstance.current.enable(!readOnly);
      }
    }, [readOnly]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const editorContainer = document.createElement("article");
      container.appendChild(editorContainer);

      const quill = new Quill(editorContainer, {
        theme: "snow",
        modules: modules || { toolbar: false }, // Allow custom toolbar
      });

      quillInstance.current = quill;
      if (ref) ref.current = quill;

      if (defaultValueRef.current) {
        quill.setContents(defaultValueRef.current);
      }

      quill.on("text-change", (...args) => {
        if (onTextChangeRef.current) {
          onTextChangeRef.current(...args);
        }
      });

      quill.on("selection-change", (...args) => {
        if (onSelectionChangeRef.current) {
          onSelectionChangeRef.current(...args);
        }
      });

      return () => {
        if (quillInstance.current) {
          quillInstance.current.off("text-change");
          quillInstance.current.off("selection-change");
          quillInstance.current = null;
        }
        if (ref) ref.current = null;
        container.innerHTML = "";
      };
    }, []);

    return <section ref={containerRef} className="quill-container"></section>;
  }
);

QuillEditor.displayName = "QuillEditor";

export default QuillEditor;

QuillEditor.propTypes = {
  readOnly: PropTypes.bool,
  defaultValue: PropTypes.object,
  onTextChange: PropTypes.func,
  onSelectionChange: PropTypes.func,
  modules: PropTypes.object, // Allow custom toolbar
};
