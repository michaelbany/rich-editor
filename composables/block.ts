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
}

export type BlockAPI = ReturnType<typeof blockAPI>;
