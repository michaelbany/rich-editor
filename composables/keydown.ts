export function keydownAPI(context: EditorContext) {
    return {
        trigger: (e: KeyboardEvent) => {
            switch (e.key) {

                /**
                 * #todo:
                 * Je třeba zajistit že když má obsah více řádků
                 * tak aby se kurzor posunul ještě v rámci jednoho
                 * blocku. Ale nevím jak to udělat.
                 * 
                 * - A udělat toto do 1 funkce
                 */
                case "ArrowUp":
                    const block = context.Block.find(context.state.cursor.get()?.block);
                    const previousBlock = block?.previous();

                    const startIndex = context.state.cursor.get()?.absolute.start;

                    if (previousBlock) {
                        e.preventDefault();
                        context.Cursor.move(previousBlock, startIndex ?? 0);
                    }

                    break;
                case "ArrowDown":
                    const blockL = context.Block.find(context.state.cursor.get()?.block);
                    const nextBlock = blockL?.next();
                    
                    const startIndexL = context.state.cursor.get()?.absolute.start;
                    
                    if (nextBlock) {
                        e.preventDefault();
                        context.Cursor.move(nextBlock, startIndexL ?? 0);
                    }
                    
                    break;
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
    }
}

export type KeydownAPI = ReturnType<typeof keydownAPI>