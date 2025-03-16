import type { Block, InlineNode, InlineStyle, NodeFragment } from "~/types";

export function nodeAPI(context: EditorContext) {
  return {
    /** Find NodeModel by id */
    find: (id?: NodeFragment['id']): NodeModel => context.model.node(id),

    /** Collect multiple NodeModels by ids[] */
    collect: (ids: NodeFragment['id'][]): NonNullable<NodeModel>[] =>
      ids.map((id) => context.model.node(id)).filter((node) => node !== undefined),

    /** Style selected NodeFragments */
    style: (style: InlineStyle) => {
      const selection = context.state.selection.get();
      if (!selection) return;

      const selectedBlock = context.Block.find(selection.block);
      if (!selectedBlock) return;

      const forceShareStyle = context.Node.cascadeStyle(selection.nodes, style);

      let newNodes: InlineNode[][] = [];

      for (const node of selection.nodes) {
        const originalNode = context.Node.find(node.id);
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

          const [prefix, middle, suffix] = context.Node.split(originalNode, selectedText, node.offset);

          middle.setStyle(style, forceShareStyle);

          newNodes[index] = [prefix, middle, suffix]
            .filter((node) => node !== undefined)
            .map((node) => node.original());
        }
      }

      let newBlockNodes = context.Node.insert(newNodes, selectedBlock);
      newBlockNodes = context.Node.merge(newBlockNodes);

      // Update Document
      context.document.blocks[selectedBlock.index].nodes = newBlockNodes;

      context.Selection.restore();
    },
    /** Split node to 3 parts */
    split: (
      node: NonNullable<NodeModel>,
      selectedText: string,
      startOffset: number
    ): [NodeModel, NonNullable<NodeModel>, NodeModel] => {
      const originalText = node.text;

      const startCut = startOffset;
      const endCut = startCut + selectedText.length;

      const [prefixText, middleText, suffixText] = [
        originalText.slice(0, startCut),
        originalText.slice(startCut, endCut),
        originalText.slice(endCut),
      ];

      const prefixNode = prefixText ? context.Node.clone(node, { text: prefixText }) : undefined;
      const middleNode = context.Node.clone(node, { text: middleText });
      const suffixNode = suffixText ? context.Node.clone(node, { text: suffixText }) : undefined;

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
          const sameStyle = prev.bold === node.bold && prev.italic === node.italic && prev.underline === node.underline && prev.strikethrough === node.strikethrough && prev.code === node.code;

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
      const nodeModes = context.Node.collect(nodes.map((node) => node.id));

      return (
        nodeModes.some((node) => node?.style.includes(style)) &&
        !nodeModes.every((node) => node?.style.includes(style))
      );
    },
    create: (block: NonNullable<BlockModel>): NonNullable<NodeModel> => {
      const node: InlineNode = { text: "" }
      block.original().nodes.push(node);

      return block.nodes()[block.nodes().length - 1];
    },
    remove: (node: NonNullable<NodeModel>) => {
        const block = node.block();
        if (!block || block.nodes().length === 1) return;
        
        const blockIndex = node.block()?.index ?? -1;
        context.document.blocks[blockIndex].nodes.splice(node.index, 1);
    },
  };
}

export type NodeAPI = ReturnType<typeof nodeAPI>;