import {
  type CursorState,
  type EditorContent,
  type EditorDocument,
  type EditorState,
  type FocusedBlockState,
  type SelectedNodesState,
  type SelectionState,
} from "~/types/newTypes";

/** Inteprates skeleton of useEditor */
function useEditor(content: EditorContent) {
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

  /** State holders */
  const selectionState = ref<EditorState<SelectionState>>();
  const cursorState = ref<EditorState<CursorState>>();

  // #note: Compute on call instead of storing it in the state
  //   const selectedNodeState = ref<EditorState<SelectedNodesState>>();
  //   const focusedBlockState = ref<EditorState<FocusedBlockState>>();

  /**
   * The main function to capture user interactions
   * and update the editor state and data.
   *
   * This function is called when the editor is mounted.
   */
  function capture() {}

  /**
   * The function to destroy the editor.
   *
   * This function is called when the editor is unmounted.
   */
  function destroy() {}

  const selection = {
    trigger: () => {},
    clear: () => {},
  };

  const cursor = {
    trigger: () => {},
    clear: () => {},
  };

  const input = {
    trigger: () => {},
  };

  const block = {
    convert: () => {},
    move: () => {},
    remove: () => {},
    insert: () => {},
  };

  const node = {
    style: () => {},
    remove: () => {},
    insert: () => {},
    split: () => {},
    merge: () => {},
  };

  return {
    capture,
    destroy,
    data: {
      document: documentData,
      blocks: documentData.blocks,
    },
    state: {
      cursor: cursorState,
      selection: selectionState,
      // node: selectedNodeState,
      // block: focusedBlockState,
    },
  };
}
