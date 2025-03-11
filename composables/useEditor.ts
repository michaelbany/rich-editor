import {
  type Block,
  type EditorContent,
  type EditorDocument,
  type EditorStateHolder,
  type EditorStateSchema,
  type InlineNode,
  type InlineStyle,
  type NodeFragment,
} from "~/types";

import { modules } from "./modules";

/** Inteprates skeleton of useEditor */
export function useEditor(content: EditorContent) {
  const documentData = reactive<EditorDocument>({
    blocks: [],
  });

  _initialize(); // Initialize the editor

  function _initialize() {
    // Generate unique IDs for each block
    documentData.blocks = content.map((block) => {
      return {
        ...block,
        id: crypto.randomUUID(),
      };
    });
  }

  /**
   * The main function to capture user interactions
   * and update the editor state and data.
   *
   * This function is called when the editor is mounted.
   */
  function capture() {
    document.addEventListener("selectionchange", handleSelectionChange);
  }

  /**
   * The function to destroy the editor.
   *
   * This function is called when the editor is unmounted.
   */
  function destroy() {
    document.removeEventListener("selectionchange", handleSelectionChange);
  }

  /**
   * The reactive state holders for the editor.
   */
  const _states = reactive<EditorStateHolder>({
    cursor: null,
    selection: null,
  });

  /**
   * The state schema manager for the editor
   * that provides getter, setter and clear methods.
   */
  const state: EditorStateSchema = {
    cursor: {
      get: () => _states.cursor,
      set: (state) => (_states.cursor = state),
      clear: () => (_states.cursor = null),
    },
    selection: {
      get: () => _states.selection,
      set: (state) => (_states.selection = state),
      clear: () => (_states.selection = null),
    },
  };

  /**
   * The editor context provider that sum up all the modules
   * and make them available to the editor.
   */
  const context = reactive<EditorContext>(modules({ document: documentData, state: state }));

  /**
   * Handles the selection change event.
   * @returns void
   */
  function handleSelectionChange() {
    const s = window.getSelection();

    // Event ment the selection was cancelled so we sync that
    if (!s || s.rangeCount === 0) {
      return;
    }

    state.cursor.clear();
    state.selection.clear();

    // If text selected it's a selection event otherwise it's a cursor event
    if (!s.toString()) {
      context.Cursor.trigger(s);
    } else {
      context.Cursor.trigger(s);
      context.Selection.trigger(s);
    }
  }

  return {
    capture,
    destroy,
    data: {
      get document() {
        return documentData;
      },
      get blocks() {
        return documentData.blocks;
      },
    },
    state,
    node: context.Node,
    block: context.Block,
  };
}
