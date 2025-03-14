export function keydownAPI(context: EditorContext) {
  return {
    trigger: (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          context.KeyDown.arrow(e, "up");
          break;
        case "ArrowDown":
          context.KeyDown.arrow(e, "down");
          break;
      }
    },
    /**
     * Simple implementation of arrow key navigation.
     * #note Have to be fixed to handle more complex cases.
     */
    arrow: (e: KeyboardEvent, direction: "up" | "down") => {
      const cursor = context.state.cursor.get();
      const currentBlock = context.Block.find(cursor?.block);
      if (!cursor || !currentBlock) return;

      const block = direction === "up" ? currentBlock.previous() : currentBlock.next();

      if (block) {

        if (direction === "up" && cursor.absolute.start === 0) {
          e.preventDefault();
          context.Cursor.move(block, cursor.absolute.start);
          return;
        }
        if (direction === "down" && cursor.absolute.end === 0) {
          e.preventDefault();
          context.Cursor.move(block, cursor.absolute.start);
          return;
        }

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (direction === "up" && context.state.cursor.get()?.absolute.start === 0) {
              e.preventDefault();
              context.Cursor.move(block, cursor.absolute.start);
              return;
            }
            if (direction === "down" && context.state.cursor.get()?.absolute.end === 0) {
              e.preventDefault();
              context.Cursor.move(block, cursor.absolute.start);
              return;
            }
          });
        });
      }
    },
    validate: (e: KeyboardEvent): boolean => {
      if (!e.target) return false;

      if (!(e.target instanceof HTMLElement) || !context.Block.find(e.target.id)) {
        console.warn("Input event target is not a valid block element.");
        return false;
      }

      return true;
    },
  };
}

export type KeydownAPI = ReturnType<typeof keydownAPI>;
