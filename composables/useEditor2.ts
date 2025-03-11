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
      if (!anchorNode) return;

      const { start, end } = _Selection.offsets(s, anchorNode);

      state.selection.set({
        type: "selection",
        block: anchorNode.block_id,
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
    offsets: (s: Selection, node: NonNullable<NodeModel>): { start: number; end: number } => {
      let selectionAbsoluteOffset = 0;
      const direction = _Selection.direction(s);

      node.siblings()?.forEach((sibling, index) => {
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
    restore: async () => {
      const selection = state.selection.get();
      if (!selection) return;

      await nextTick();

      const block = _Block.find(selection.block);
      if (!block) return;

      const { startNode, endNode, endOffset, startOffset } = _Block.childrenInRange(
        block,
        selection.start,
        selection.end
      );

      const startChild = startNode?.element()?.firstChild;
      const endChild = endNode?.element()?.firstChild;

      // 3) Vytvořit Range
      if (startChild && endChild) {
        const s = window.getSelection();
        const r = document.createRange();

        r.setStart(startChild, startOffset);
        r.setEnd(endChild, endOffset);

        s?.removeAllRanges();
        s?.addRange(r);
      }
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
      if (!anchorNode) return;

      state.cursor.set({
        type: "cursor",
        block: anchorNode.block_id,
        node: anchorNode.id,
        offset: s.anchorOffset,
        absolute: _Cursor.offsets(s, anchorNode),
      });
    },
    offsets: (s: Selection, node: NonNullable<NodeModel>): { start: number; end: number } => {
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
    childrenInRange: (block: NonNullable<BlockModel>, start: number, end: number) => {
      const nodes = block.nodes();
      let currentOffset = 0;

      let startNode = null,
        endNode = null;
      let startOffset = 0,
        endOffset = 0;

      for (const node of nodes) {
        const length = node.text.length;

        if (!startNode && currentOffset + length > start) {
          startNode = node;
          startOffset = start - currentOffset;
        }

        if (!endNode && currentOffset + length >= end) {
          endNode = node;
          endOffset = end - currentOffset;
          break;
        }

        currentOffset += length;
      }

      return { startNode, startOffset, endNode, endOffset };
    },
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
    /** Find NodeModel by id */
    find: (id?: string): NodeModel => nodeModel(id),

    /** Collect multiple NodeModels by ids[] */
    collect: (ids: string[]): NonNullable<NodeModel>[] =>
      ids.map((id) => nodeModel(id)).filter((node) => node !== undefined),

    /** Style selected NodeFragments */
    style: (style: InlineStyle) => {
      const selection = state.selection.get();
      if (!selection) return;

      const selectedBlock = _Block.find(selection.block);
      if (!selectedBlock) return;

      const forceShareStyle = _Node.cascadeStyle(selection.nodes, style);

      let newNodes: InlineNode[][] = [];

      for (const node of selection.nodes) {
        const originalNode = _Node.find(node.id);
        if (!originalNode) continue;

        const index = originalNode.index;
        const selectedText = node.text;

        if (selectedText.trim() === originalNode.text.trim()) {
          // Whole node selected
          originalNode.setStyle(style, forceShareStyle);
          newNodes[index] = [originalNode.original()];
        } else {
          // Partial node selected
          if (!selectedText.trim()) continue; // pokud je vyběr prázdný, vracíme beze změny

          const [prefix, middle, suffix] = _Node.split(originalNode, selectedText);

          middle.setStyle(style, forceShareStyle);

          newNodes[index] = [prefix, middle, suffix]
            .filter((node) => node !== undefined)
            .map((node) => node.original());
        }
      }

      let newBlockNodes = _Node.insert(newNodes, selectedBlock);
      newBlockNodes = _Node.merge(newBlockNodes);

      // Update Document
      documentData.blocks[selectedBlock.index].nodes = newBlockNodes;

      _Selection.restore();
    },
    /** Split node to 3 parts */
    split: (
      node: NonNullable<NodeModel>,
      selectedText: string
    ): [NodeModel, NonNullable<NodeModel>, NodeModel] => {
      const originalText = node.text;

      const startCut = originalText.indexOf(selectedText);
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
      let blockNodes = block.nodes().map((node) => node?.original()) as Array<
        InlineNode | InlineNode[]
      >;

      nodes.forEach((nodeArray, index) => {
        blockNodes[index] = nodeArray;
      });

      return blockNodes.flat();
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
    cascadeStyle: (nodes: NodeFragment[], style: InlineStyle): boolean => {
      const nodeModes = _Node.collect(nodes.map((node) => node.id));

      return (
        nodeModes.some((node) => node?.style.includes(style)) &&
        !nodeModes.every((node) => node?.style.includes(style))
      );
    },
    // update: (node: NodeModel) => {},
    // remove: (node: NodeModel) => {},
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
      setStyle(style: InlineStyle, force?: boolean) {
        if (!this.style.includes(style)) {
          this.style.push(style);
        } else if (!force) {
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
      element(): HTMLElement | null {
        return document.getElementById(id);
      },
      /** @returns DOM element */
      parent(): HTMLElement | null {
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
      original(): Block {
        return self;
      },
      /** @returns DOM element */
      element(): HTMLElement | null {
        return document.getElementById(id);
      },
      /** @returns DOM element[] could return HTMLElement instead */
      children(): HTMLElement[] {
        return Array.from(this.element()?.children ?? []).filter(
          (child): child is HTMLElement => child.nodeType === Node.ELEMENT_NODE
        );
      },
      /** @returns NodeModel[] */
      nodes(): NonNullable<NodeModel>[] {
        return Array.from(self.nodes)
          .map((node, index) => nodeModel(`${id}/${index}`))
          .filter((node) => node !== undefined);
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
