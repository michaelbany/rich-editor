import type { Block, BlockType, InlineNode, ParagraphBlock } from "~/types";

export function blockAPI(context: EditorContext) {
  return {
    find: (id?: string): BlockModel => context.model.block(id),
    collect: (ids: string[]): BlockModel[] => ids.map((id) => context.model.block(id)),
    childrenInRange: (block: NonNullable<BlockModel>, start: number, end: number) => {
      const nodes = block.nodes();
      let currentOffset = 0;

      let startNode = null,
        endNode = null;
      let startOffset = 0,
        endOffset = 0;

      for (const node of nodes) {
        const length = node.text.length;

        // Obscure condition when manipulating with cursor
        let shouldBeStart =
          start === end ? currentOffset + length >= start : currentOffset + length > start;

        if (!startNode && shouldBeStart) {
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
    create: async (
      index: number,
      attr?: { nodes?: InlineNode[]; type?: BlockType; props?: Record<string, any> }
    ) => {
      const block: ParagraphBlock = {
        id: crypto.randomUUID(),
        type: attr?.type ?? "paragraph",
        nodes: attr?.nodes?.length ? attr.nodes : [{ text: "" }],
        props: attr?.props ?? {},
      };

      context.document.blocks.splice(index, 0, block);

      await nextTick();

      const newBlock = context.Block.find(block.id) as NonNullable<BlockModel>;

      context.Cursor.move(newBlock, 0);
    },
    /**
     * Remove block from the document
     * @returns true if block was removed, false otherwise
     */
    remove: (block: NonNullable<BlockModel>, force: boolean = false): boolean => {
      const index = block.index;
      const previousBlock = block.previous();

      if (!previousBlock && !force) return false;

      context.document.blocks.splice(index, 1);

      if (previousBlock) context.Cursor.move(previousBlock, previousBlock.text().length);

      return true;
    },
    /**
     * Merge two blocks into one
     */
    merge: (block: BlockModel, into: BlockModel) => {
      if (into && block) {
        const nodes = block.nodes().map((node) => node.original());
        const intoLength = into.text().length;
        into.original().nodes.push(...nodes);

        context.Block.remove(block);

        context.Cursor.move(into, intoLength);
      }
    },
    /**
     * Split block into two blocks by given node and offset
     */
    split: (
      block: NonNullable<BlockModel>,
      at: { node: NonNullable<NodeModel>; offset: number }
    ) => {
      const [prefix, suffix] = context.Node.split(
        at.node,
        at.node.text.slice(at.offset),
        at.offset
      );

      const before = [...at.node.before(), prefix]
        .filter((n) => n !== undefined)
        .filter((n) => n.text.length > 0)
        .map((n) => n.original());

      const after = [suffix, ...at.node.after()]
        .filter((n) => n !== undefined)
        .filter((n) => n.text.length > 0)
        .map((n) => n.original());

      // Force remove original node
      context.Block.remove(block, true);

      // Create new blocks
      context.Block.create(block.index, {
        nodes: before,
        type: block.type,
        props: block.props,
      });

      context.Block.create(block.index + 1, {
        nodes: after,
        type: block.type,
        props: block.props,
      });
    },
    // convert: () => {},
    // move: () => {},
    // insert: () => {},
  };
}

export type BlockAPI = ReturnType<typeof blockAPI>;
