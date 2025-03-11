/**
 * Handles text input that affects the node's text.
 */
export function inputAPI(context: EditorContext) {
  return {
    trigger: (e: InputEvent) => {
      switch (e.inputType) {
        case "insertText":
          e.preventDefault();
          context.Input.write(e);
          break;
        case "deleteContentBackward":
          e.preventDefault();
          context.Input.delete();
          break;
        case "deleteContentForward":
          e.preventDefault();
          context.Input.delete();
          break;
        case "formatBold":
          e.preventDefault();
          context.Node.style("bold");
          break;
        case "formatItalic":
          e.preventDefault();
          context.Node.style("italic");
          break;
        default:
          e.preventDefault();
          break;
      }
    },
    write: (e: InputEvent) => {
      const cursor = context.state.cursor.get();
      const block = context.Block.find((e.target as HTMLElement).id) as NonNullable<BlockModel>;

      if (!cursor || !block) return e.preventDefault();

      const node = context.Node.find(cursor.node) as NonNullable<NodeModel>;
      node.setText(e.data ?? "", cursor.offset);

      context.document.blocks[block.index].nodes[node.index].text = node.text;
      context.Cursor.move(block, cursor.absolute.start + 1);
    },
    delete: () => {
      console.log("Delete");
    },
    paste: () => {
      console.log("Paste");
    },
    cut: () => {
      console.log("Cut");
    },
    validate: (e: Event) => {
      if (!e.target || !e.isTrusted) return false;

      if (!(e.target instanceof HTMLElement) || !context.Block.find(e.target.id)) {
        console.warn("Input event target is not a valid block element.");
        e.preventDefault();
        return false;
      }

      return true;
    },
  };
}

export type InputAPI = ReturnType<typeof inputAPI>;
