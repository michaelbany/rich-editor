import {
  type CursorState,
  type EditorContent,
  type EditorDocument,
  type EditorState,
  type EditorStateHolder,
  type EditorStateSchema,
  type SelectionState,
} from "~/types/newTypes";

/** Inteprates skeleton of useEditor */
export function useEditor2(content: EditorContent) {
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
   * Handles the selection change event.
   * @returns void
   */
  function handleSelectionChange() {
    const windowSelection = window.getSelection();

    // Event ment the selection was cancelled so we sync that
    if (!windowSelection || windowSelection.rangeCount === 0) {
      state.cursor.clear();
      state.selection.clear();
      return;
    }

    // If text selected it's a selection event otherwise it's a cursor event
    if (windowSelection.toString()) {
      selection.trigger(windowSelection);
    } else {
      cursor.trigger(windowSelection);
    }
  }

  /** State holders */
  const _states = reactive<EditorStateHolder>({
    cursor: null,
    selection: null,
  });

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

  // #note: Compute on call instead of storing it in the state
  //   const selectedNodeState = ref<EditorState<SelectedNodesState>>();
  //   const focusedBlockState = ref<EditorState<FocusedBlockState>>();

  const selection = {
    trigger: (windowSelection: Selection) => {
      if (!selection.validate(windowSelection)) return;

      const direction = selection.direction(windowSelection);
      const anchorNode = node.find(windowSelection.anchorNode?.parentElement?.id);

      let selectionAbsoluteOffset = 0;

      anchorNode
        ?.block()
        ?.nodes()
        .forEach((node, index) => {
          if (index < anchorNode.index) {
            selectionAbsoluteOffset += node?.text?.length ?? 0;
          }
        });

      selectionAbsoluteOffset += windowSelection.anchorOffset;

      if (direction === "backward") {
        state.selection.set({
          type: "selection",
          block: anchorNode?.block_id ?? "",
          start: selectionAbsoluteOffset - windowSelection.toString().length,
          end: selectionAbsoluteOffset,
          nodes: [],
        });
      } else if (direction === "forward") {
        state.selection.set({
          type: "selection",
          block: anchorNode?.block_id ?? "",
          start: selectionAbsoluteOffset,
          end: selectionAbsoluteOffset + windowSelection.toString().length,
          nodes: [],
        });
      } else {
        state.selection.clear();
      }
    },
    direction: (windowSelection: Selection): "forward" | "backward" => {
      const onSameNode = windowSelection.anchorNode === windowSelection.focusNode;
      const onPrecedingNode = windowSelection.focusNode
        ? windowSelection.anchorNode?.compareDocumentPosition(windowSelection.focusNode) ===
          Node.DOCUMENT_POSITION_PRECEDING
        : false;
      const rangeBackwards = windowSelection.anchorOffset > windowSelection.focusOffset;

      return onSameNode
        ? rangeBackwards
          ? "backward"
          : "forward"
        : onPrecedingNode
          ? "backward"
          : "forward";
    },
    validate: (windowSelection: Selection): boolean => {
      const anchorNodeId = windowSelection.anchorNode?.parentElement?.id;
      const focusNodeId = windowSelection.focusNode?.parentElement?.id;

      /** Is the selection valid */
      if (!anchorNodeId || !focusNodeId) {
        // console.warn("Selection not defined");
        return false;
      }

      /** Does the selected nodes know by editor */
      if (
        !documentData.blocks.some(
          (block) => anchorNodeId.includes(block.id) && focusNodeId.includes(block.id)
        )
      ) {
        console.warn("Selection is not in the editor");
        return false;
      }

      /** Does focus & anchor part of the same block */
      if (!new RegExp(`^${anchorNodeId.split("/")[0]}/\\d+$`).test(focusNodeId)) {
        console.warn("Selection is not in the same block");
        return false;
      }

      return true;
    },
  };

  const cursor = {
    trigger: (windowSelection: Selection) => {
      if (!cursor.validate(windowSelection)) return;

      // console.log("Cursor triggered");
    },
    validate: (windowSelection: Selection): boolean => {
      const anchorNodeId = windowSelection.anchorNode?.parentElement?.id;
      const focusNodeId = windowSelection.focusNode?.parentElement?.id;

      /** Is the selection valid */
      if (!anchorNodeId || !focusNodeId) {
        // console.warn("Cursor not defined");
        return false;
      }

      /** Does the selected nodes know by editor */
      if (
        !documentData.blocks.some(
          (block) => anchorNodeId.includes(block.id) && focusNodeId.includes(block.id)
        )
      ) {
        console.warn("Cursor is not in the editor");
        return false;
      }

      return true;
    },
  };

  // const input = {
  //   trigger: () => {},
  // };

  /**
   * Block observer to interact with the blocks.
   */
  const block = {
    find: (id?: string): BlockModel => blockModel(id),
    // convert: () => {},
    // move: () => {},
    // remove: () => {},
    // insert: () => {},
  };

  /**
   * Node observer to interact with the nodes.
   */
  const node = {
    find: (id?: string): NodeModel => nodeModel(id),
    // style: () => {},
    // remove: () => {},
    // insert: () => {},
    // split: () => {},
    // merge: () => {},
  };

  function nodeModel(id?: string) {
    if (!id) return undefined;

    const self = documentData.blocks.find((block) => id?.includes(block.id))?.nodes?.[
      Number(id?.split("/")[1]) ?? "-1"
    ];

    return {
      id: id,
      text: self?.text,
      block_id: id?.split("/")[0],
      index: Number(id?.split("/")[1]) ?? -1,
      style: Object.keys(self ?? {}).filter((key) => key !== "text"),
      element() {
        return document.getElementById(id);
      },
      parent() {
        return document.getElementById(id.split("/")[0]);
      },
      block() {
        return blockModel(id.split("/")[0]);
      },
    };
  }

  type NodeModel = ReturnType<typeof nodeModel>;
  type BlockModel = ReturnType<typeof blockModel>;

  function blockModel(id?: string) {
    if (!id) return undefined;

    const self = documentData.blocks.find((block) => block.id === id);

    return {
      id: id,
      type: self?.type,
      index: documentData.blocks.findIndex((block) => block.id === id),
      element() {
        return document.getElementById(id);
      },
      children() {
        // #!!!: Has to wait to nextTick!!!
        return Array.from(this.element()?.children ?? []).filter(
          (child) => child.nodeType === Node.ELEMENT_NODE
        );
      },
      nodes() {
        return Array.from(self?.nodes ?? []).map((node, index) => nodeModel(`${id}/${index}`));
      },
      text(): string {
        return (
          this.nodes()
            .map((node) => node?.text)
            .join("") ?? ""
        );
      },
    };
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
  };
}
