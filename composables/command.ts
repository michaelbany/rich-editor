export function commandAPI(context: EditorContext) {
    return {
        // keydown commands like 'ctrl+b', 'ctrl+i', etc.
        // #note: 'Enter' can be included here as well
    }
}

export type CommandAPI = ReturnType<typeof commandAPI>