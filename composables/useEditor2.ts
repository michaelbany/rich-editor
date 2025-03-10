import {
  type Block,
  type EditorContent,
  type EditorDocument,
  type EditorStateHolder,
  type EditorStateSchema,
  type InlineNode,
  type InlineStyle,
  type NodeFragment,
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
    const s = window.getSelection();

    // Event ment the selection was cancelled so we sync that
    if (!s || s.rangeCount === 0) {
      return;
    }

    state.cursor.clear();
    state.selection.clear();

    // If text selected it's a selection event otherwise it's a cursor event
    if (!s.toString()) {
      _Cursor.trigger(s);
    } else {
      _Cursor.trigger(s);
      _Selection.trigger(s);
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

  const _Selection = {
    trigger: (s: Selection) => {
      if (!_Selection.validate(s)) return;

      const anchorNode = _Node.find(s.anchorNode?.parentElement?.id);

      const { start, end } = _Selection.offsets(s, anchorNode);

      state.selection.set({
        type: "selection",
        block: anchorNode?.block_id ?? "",
        start: start,
        end: end,
        nodes: [..._Selection.nodes(s)],
      });
    },
    nodes: (s: Selection): NodeFragment[] => {
      const range = s.getRangeAt(0);
      const nodes: NodeFragment[] = [];

      if (s.anchorNode !== s.focusNode) {
        const fragment = range.cloneContents();
        const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT);

        let node;
        while ((node = walker.nextNode())) {
          const parentElement = node.parentElement;
          if (parentElement) {
            nodes.push({
              id: parentElement.id,
              text: parentElement.textContent ?? "",
            });
          }
        }
      } else {
        if (s.anchorNode?.parentElement) {
          nodes.push({
            id: s.anchorNode?.parentElement.id,
            text: s.toString(),
          });
        }
      }

      return nodes;
    },
    offsets: (s: Selection, node: NodeModel): { start: number; end: number } => {
      let selectionAbsoluteOffset = 0;
      const direction = _Selection.direction(s);

      node?.siblings()?.forEach((sibling, index) => {
        if (index < node.index) {
          selectionAbsoluteOffset += sibling?.text?.length ?? 0;
        }
      });

      selectionAbsoluteOffset += s.anchorOffset;

      if (direction === "backward") {
        return {
          start: selectionAbsoluteOffset - s.toString().length,
          end: selectionAbsoluteOffset,
        };
      } else if (direction === "forward") {
        return {
          start: selectionAbsoluteOffset,
          end: selectionAbsoluteOffset + s.toString().length,
        };
      } else {
        return { start: 0, end: 0 };
      }
    },
    direction: (s: Selection): "forward" | "backward" => {
      const onSameNode = s.anchorNode === s.focusNode;
      const onPrecedingNode = s.focusNode
        ? s.anchorNode?.compareDocumentPosition(s.focusNode) === Node.DOCUMENT_POSITION_PRECEDING
        : false;
      const rangeBackwards = s.anchorOffset > s.focusOffset;

      return onSameNode
        ? rangeBackwards
          ? "backward"
          : "forward"
        : onPrecedingNode
          ? "backward"
          : "forward";
    },
    restore: () => {
      if (!state.selection.get()) return;

      console.log("Restoring selection...");
    },
    validate: (s: Selection): boolean => {
      const anchorNodeId = s.anchorNode?.parentElement?.id;
      const focusNodeId = s.focusNode?.parentElement?.id;

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

  const _Cursor = {
    trigger: (s: Selection) => {
      if (!_Cursor.validate(s)) return;

      const anchorNode = _Node.find(s.anchorNode?.parentElement?.id);

      state.cursor.set({
        type: "cursor",
        block: anchorNode?.block_id ?? "",
        node: anchorNode?.id ?? "",
        offset: s.anchorOffset,
        absolute: _Cursor.offsets(s, anchorNode),
      });
    },
    offsets: (s: Selection, node: NodeModel): { start: number; end: number } => {
      let selectionAbsoluteOffset = 0;

      node?.siblings()?.forEach((sibling, index) => {
        if (index < node.index) {
          selectionAbsoluteOffset += sibling?.text?.length ?? 0;
        }
      });

      selectionAbsoluteOffset += s.anchorOffset;

      return {
        start: selectionAbsoluteOffset,
        end: (node?.block()?.text().length ?? 0) - selectionAbsoluteOffset,
      };
    },
    validate: (s: Selection): boolean => {
      const anchorNodeId = s.anchorNode?.parentElement?.id;
      const focusNodeId = s.focusNode?.parentElement?.id;

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
   * Block observer to manipulate with the block models.
   * Every method should except BlockModel|BlockModel[] as a parameter.
   */
  const _Block = {
    find: (id?: string): BlockModel => blockModel(id),
    collect: (ids: string[]): BlockModel[] => ids.map((id) => blockModel(id)),
    // convert: () => {},
    // move: () => {},
    // remove: () => {},
    // insert: () => {},
  };

  /**
   * Node observer to manipulate with the node models.
   * Every method should except NodeModel|NodeModel[] as a parameter.
   */
  const _Node = {
    find: (id?: string): NodeModel => nodeModel(id),
    collect: (ids: string[]): NodeModel[] => ids.map((id) => nodeModel(id)),
    style: (style: InlineStyle) => {
      if (!state.selection.get()) return;

      const selectedBlock = _Block.find(state.selection.get()?.block);
      if (!selectedBlock) return;
      const nodesOfSelectedBlock = selectedBlock?.nodes();

      const selectedNodes = _Node.collect(
        state.selection.get()?.nodes.map((node) => node.id) ?? []
      );

      const someNodeHasPickedStyle = selectedNodes.some((node) => node?.style.includes(style));
      const everyNodeHasPickedStyle = selectedNodes.every((node) => node?.style.includes(style));

      let newNodes: InlineNode[][] = [];

      for (const selectedNode of state.selection.get()?.nodes as NodeFragment[]) {
        const originalNode = _Node.find(selectedNode.id);

        if (!originalNode) continue;

        const index = originalNode?.index as number;
        const selectedText = selectedNode.text;

        if (selectedText?.trim() === originalNode?.text?.trim()) {
          // Whole node selected
          // originalNode.style = [style]; // something like this
          originalNode.setStyle(style, true);
          newNodes[index] = [originalNode.original()];
        } else {
          // Partial node selected
          if (!selectedText.trim()) continue; // pokud je vyběr prázdný, vracíme beze změny

          const [prefix, middle, suffix] = _Node.split(originalNode, selectedText);

          middle.setStyle(style, true); // #todo - set styling right depending on other siblings

          // console.log("Splitting node", { prefix, middle, suffix });

          newNodes[index] = [prefix, middle, suffix]
            .filter((node) => node !== undefined)
            .map((node) => node.original());
        }

        // console.log("New nodes", newNodes);
      }

      let newBlockNodes = _Node.insert(newNodes, selectedBlock);

      newBlockNodes = _Node.merge(newBlockNodes);

      console.log("New block nodes", newBlockNodes);

      // UPDATE DOCUMENT
      // documentData.blocks[selectedBlock.index] = {
      //   ...selectedBlock.original(),
      //   nodes: newBlockNodes,
      // }
      // // OR
      // documentData.blocks[selectedBlock.index].nodes = newBlockNodes;

      _Selection.restore(); // restore selection

      // console.log("Applying style", style);
    },
    /** Split node to 3 parts */
    split: (
      node: NonNullable<NodeModel>,
      selectedText: string
    ): [NodeModel, NonNullable<NodeModel>, NodeModel] => {
      const originalText = node?.text ?? "";

      const startCut = originalText?.indexOf(selectedText);
      const endCut = startCut + selectedText.length;

      const [prefixText, middleText, suffixText] = [
        originalText.slice(0, startCut),
        originalText.slice(startCut, endCut),
        originalText.slice(endCut),
      ];

      const prefixNode = prefixText ? _Node.clone(node, { text: prefixText }) : undefined;
      const middleNode = _Node.clone(node, { text: middleText });
      const suffixNode = suffixText ? _Node.clone(node, { text: suffixText }) : undefined;

      return [prefixNode, middleNode, suffixNode];
    },
    clone: (base: NonNullable<NodeModel>, attr: { text?: string }): NonNullable<NodeModel> => {
      return {
        ...base,
        text: attr.text ?? base.text,
        style: [...base.style],
        setStyle: base.setStyle,
        original: base.original,
        element: base.element,
        parent: base.parent,
        block: base.block,
        siblings: base.siblings,
      };
    },
    insert: (nodes: InlineNode[][], block: NonNullable<BlockModel>): InlineNode[] => {
      let blockNodes = block.nodes().map((node) => node?.original());

      nodes.forEach((node, index) => {
        /** @ts-ignore */
        blockNodes[index] = node;
      });

      blockNodes = blockNodes.flat();

      return blockNodes as InlineNode[];
    },
    merge: (nodes: InlineNode[]) => {
      const result: InlineNode[] = [];

      for (const node of nodes) {
        if (!result.length) {
          result.push(node);
        } else {
          const prev: InlineNode = result[result.length - 1];
          // #note: It's necessary to add here more conditions when adding more styles
          const sameStyle = prev.bold === node.bold && prev.italic === node.italic;

          if (sameStyle) {
            // Merge nodes
            result[result.length - 1] = {
              ...prev,
              text: prev.text + node.text,
            };
          } else {
            result.push(node);
          }
        }
      }
      return result;
    },
    // remove: () => {},
  };

  /**
   * The function to create runtime NodeModel.
   * @param id DOM id of the node
   * @returns NodeModel
   */
  function nodeModel(id?: string) {
    if (!id) return undefined;

    const self = documentData.blocks.find((block) => id?.includes(block.id))?.nodes?.[
      Number(id?.split("/")[1]) ?? "-1"
    ] as InlineNode;

    return {
      id: id,
      text: self.text,
      block_id: id.split("/")[0],
      index: Number(id.split("/")[1]) ?? -1,
      style: Object.keys(self).filter((key) => key !== "text") as InlineStyle[],
      setStyle(style: InlineStyle, value?: boolean) {
        // #test!! should work also as a toggle (probably works)
        if (value) {
          if (!this.style.includes(style)) {
            this.style.push(style);
          }
        } else {
          this.style = this.style.filter((s) => s !== style);
        }
      },
      /** @returns InlineNode */
      original(): InlineNode {
        return {
          text: this.text,
          ...this.style.reduce((acc: Partial<Record<InlineStyle, boolean>>, style: InlineStyle) => {
            acc[style] = true;
            return acc;
          }, {}),
        };
      },
      /** @returns DOM element */
      element() {
        return document.getElementById(id);
      },
      /** @returns DOM element */
      parent() {
        return document.getElementById(id.split("/")[0]);
      },
      /** @returns BlockModel */
      block() {
        return blockModel(id.split("/")[0]);
      },
      /** @returns NodeModel[] */
      siblings() {
        return this.block()?.nodes();
      },
    };
  }

  /**
   * The function to create runtime BlockModel.
   * @param id DOM id of the block
   * @returns BlockModel
   */
  function blockModel(id?: string) {
    if (!id) return undefined;

    const self = documentData.blocks.find((block) => block.id === id) as Block;

    return {
      id: id,
      type: self.type,
      index: documentData.blocks.findIndex((block) => block.id === id),
      /** @returns Block */
      original() {
        return self;
      },
      /** @returns DOM element */
      element() {
        return document.getElementById(id);
      },
      /** @returns DOM element[] */
      children() {
        // #!!!: Has to wait to nextTick!!!
        return Array.from(this.element()?.children ?? []).filter(
          (child) => child.nodeType === Node.ELEMENT_NODE
        );
      },
      /** @returns NodeModel[] */
      nodes() {
        return Array.from(self.nodes).map((node, index) => nodeModel(`${id}/${index}`));
      },
      /** @returns full text of the block */
      text(): string {
        return (
          this.nodes()
            .map((node) => node?.text)
            .join("") ?? ""
        );
      },
    };
  }

  type NodeModel = ReturnType<typeof nodeModel>;
  type BlockModel = ReturnType<typeof blockModel>;

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
    node: _Node,
    block: _Block,
  };
}
