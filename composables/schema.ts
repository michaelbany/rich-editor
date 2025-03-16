import type { BlockType } from "~/types"

export const blockSchema:Record<BlockType,any> = {
    'paragraph': {
        props: {},
    },
    'heading': {
        props: {
            level: 1,
        },
    }
}