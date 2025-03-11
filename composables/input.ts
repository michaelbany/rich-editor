/**
 * Handles text input that affects the node's text.
 */
export function inputAPI(context: EditorContext) {
  return {
    trigger: (e: InputEvent) => {
      const target = e.target as HTMLElement;
      const block = context.Block.find(target.id) as NonNullable<BlockModel>;
      const cursor = context.state.cursor.get();
      if (!cursor) return;

      const node = context.Node.find(cursor.node) as NonNullable<NodeModel>;
      const nodeIndex = node.index;

      node.setText(node.element()?.textContent ?? "");

    //   console.log(block.nodes());

      context.document.blocks[block.index].nodes[nodeIndex].text = node.text;

      context.document.blocks[block.index].nodes = context.document.blocks[block.index].nodes.filter((n) => n.text !== "")

    //   context.Block.cleanEmptyChildren(block);
    },
    validate: (e: Event) => {
      if (!e.target || !e.isTrusted) return false;

      if (!(e.target instanceof HTMLElement) || !context.Block.find(e.target.id)) {
        console.warn("Input event target is not a valid block element.");
        return false;
      }

      return true;
    },
  };
}

export type InputAPI = ReturnType<typeof inputAPI>;
