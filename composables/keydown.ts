export function keydownAPI(context: EditorContext) {
    return {
        trigger: (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowUp":
                    context.KeyDown.arrow(e, 'up');
                    break;
                case "ArrowDown":
                    context.KeyDown.arrow(e, 'down');
                    break;
            }
        },
        /**
         * #todo: If block has more rows should move to the next row
         * instead of the next block.
         */
        arrow: (e: KeyboardEvent, direction: 'up'|'down') => {
            const oldCursor = context.state.cursor.get();
            if (!oldCursor) return;

            const oldOffset = oldCursor.absolute.start;

            requestAnimationFrame(() => {
                const newCursor = context.state.cursor.get();
                if (!newCursor) return;

                if (newCursor.absolute.start === oldOffset) {
                    console.log('Move to the previous block WRONG');
                } else {
                    console.log('Stay WRONG');
                }
            });


            // const currentBlock = context.Block.find(context.state.cursor.get()?.block);
            // let block;
            // const startIndex = context.state.cursor.get()?.absolute.start;

            // if (direction === 'up') {
            //     block = currentBlock?.previous();
            // } else {
            //     block = currentBlock?.next();
            // }

            // if (block) {
            //     e.preventDefault();
            //     context.Cursor.move(block, startIndex ?? 0);
            // }
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