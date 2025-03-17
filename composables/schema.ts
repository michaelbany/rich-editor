import BulletListItem from "@/components/EditorBlock/BulletListItem.vue"
import CheckListItem from "@/components/EditorBlock/CheckListItem.vue"
import Heading1 from "@/components/EditorBlock/Heading1.vue"
import Paragraph from "@/components/EditorBlock/Paragraph.vue"
import Quote from "@/components/EditorBlock/Quote.vue"
import Heading2 from "~/components/EditorBlock/Heading2.vue"
import Heading3 from "~/components/EditorBlock/Heading3.vue"
import Heading4 from "~/components/EditorBlock/Heading4.vue"
import Heading5 from "~/components/EditorBlock/Heading5.vue"
import Heading6 from "~/components/EditorBlock/Heading6.vue"
import Test from "~/components/EditorBlock/Test.vue"
import type { BlockType } from "~/types"

export const blockSchema:Record<BlockType, any> = {
    'test': {
        component: Test,
        placeholder: "This is a test...",
        name: "Test",
        icon: "lucide:bug-play",
    },
    'paragraph': {
        component: Paragraph,
        placeholder: "Write, press '/' for command...",
        name: "Paragraph",
        icon: "lucide:text",
    },
    'heading-1': {
        component: Heading1,
        placeholder: "Heading 1...",
        name: "Heading 1",
        icon: "lucide:heading-1",
    },
    'heading-2': {
        component: Heading2,
        placeholder: "Heading 2...",
        name: "Heading 2",
        icon: "lucide:heading-2",
    },
    'heading-3': {
        component: Heading3,
        placeholder: "Heading 3...",
        name: "Heading 3",
        icon: "lucide:heading-3",
    },
    'heading-4': {
        component: Heading4,
        placeholder: "Heading 4...",
        name: "Heading 4",
        icon: "lucide:heading-4",
    },
    'heading-5': {
        component: Heading5,
        placeholder: "Heading 5...",
        name: "Heading 5",
        icon: "lucide:heading-5",
    },
    'heading-6': {
        component: Heading6,
        placeholder: "Heading 6...",
        name: "Heading 6",
        icon: "lucide:heading-6",
    },
    'bullet-list-item': {
        component: BulletListItem,
        placeholder: "Bullet list...",
        name: "Bullet List",
        icon: "lucide:list",
    },
    'check-list-item': {
        component: CheckListItem,
        placeholder: "Check list...",
        name: "Check List",
        icon: "lucide:list-checks",
    },
    'quote': {
        component: Quote,
        placeholder: "Quote...",
        name: "Quote",
        icon: "lucide:quote",
    }
}