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
    arrow: (e: KeyboardEvent, direction: "up" | "down") => {
      const cursor = context.state.cursor.get();
      const currentBlock = context.Block.find(cursor?.block);
      const caretRect = context.Cursor.boundary();
      const blockRect = currentBlock?.element()?.getBoundingClientRect();
      if (!cursor || !currentBlock || !caretRect || !blockRect) return;

      const block = direction === "up" ? currentBlock.previous() : currentBlock.next();

      if (block) {
        if (direction === "up" && Math.abs(caretRect.top - blockRect.top) <= caretRect.height) {
          e.preventDefault();
          context.Cursor.move(block, cursor.absolute.start);
          return;
        }

        if (
          direction === "down" &&
          Math.abs(caretRect.bottom - blockRect.bottom) <= caretRect.height
        ) {
          e.preventDefault();
          context.Cursor.move(block, cursor.absolute.start);
          return;
        }
      }
    },
    findOffsetForX: (text: string, baseX: number, targetY: number): number => {
      const range = window.getSelection()?.getRangeAt(0);
      if (!range) return -1;

      let bestOffset = -1;
      let bestDistance = Infinity;

      for (let offset = 0; offset <= text.length; offset++) {
        // Nastavit caret do offset
        range.setStart(range.startContainer, offset);
        range.collapse(true);
        const rect = range.getClientRects()[0];
        if (!rect) continue;

        // Vzdálenost: abs(rect.y - targetY) + horizontální odchylka
        const distY = Math.abs(rect.y - targetY);
        const distX = Math.abs(rect.x - baseX);
        const dist = distY * 5 + distX;
        // Koeficient 5 je jen heuristika, preferujeme menší vertikální odchylku.

        if (dist < bestDistance) {
          bestDistance = dist;
          bestOffset = offset;
        }
      }

      return bestOffset;
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
