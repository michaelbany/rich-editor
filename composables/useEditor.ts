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
    document.addEventListener("input", handleInput);
    document.addEventListener("keydown", handleKeydown);
  }

  /**
   * The function to destroy the editor.
   *
   * This function is called when the editor is unmounted.
   */
  function destroy() {
    document.removeEventListener("selectionchange", handleSelectionChange);
    document.removeEventListener("input", handleInput);
    document.removeEventListener("keydown", handleKeydown);
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
    if (!s || s.rangeCount === 0) return;

    state.cursor.clear();
    state.selection.clear();

    if (!s.toString()) {
      context.Cursor.trigger(s);
    } else {
      context.Cursor.trigger(s);
      context.Selection.trigger(s);
    }
  }

  /**
   * Handles the input event ment to update node's text.
   * Also handles 'Enter' key to create new block and 'Backspace' key to remove blocks.
   * @param e InputEvent
   */
  function handleInput(e: Event) {
    // We have to validate as soon as posible
    if (!context.Input.validate(e)) return;
    // Handle the input event
    context.Input.trigger(e as InputEvent);
  }

  /**
   * Handles the keydown event and updates the editor state.
   * @param e KeyboardEvent
   */
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') e.preventDefault(); // prozatím
    // if (e.key === 'Backspace') e.preventDefault(); // prozatím
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
