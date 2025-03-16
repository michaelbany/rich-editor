<script setup lang="ts">
  import type { Block, EditorContent } from "~/types";

  const props = defineProps<{
    content: EditorContent;
  }>();

  const editor = useEditor(props.content);

  onMounted(() => {
    editor.capture();
  });

  onUnmounted(() => {
    editor.destroy();
  });

  const placeholder = {
    paragraph: "Write, press '/' for command...",
    heading: "Heading...",
  };

  function createItemsForBlock(block: Block) {
    return [
      {
        title: "Comment",
        icon: "lucide:message-circle",
      },
      { divider: true },
      {
        title: "Delete",
        icon: "lucide:trash",
        click: () => console.log("Delete block", block.id),
      },
      {
        title: "Duplicate",
        icon: "lucide:copy",
      },
      {
        title: "Turn into",
        icon: "lucide:repeat-2",
        items: [
          {
            title: "Paragraph",
            icon: "lucide:text",
          },
          {
            title: "Heading",
            icon: "lucide:heading-1",
            click: () => editor.block.convert(editor.block.find(block.id), "heading"),
          },
          // {
          //   title: "Heading 2",
          //   icon: "lucide:heading-2",
          // },
          // {
          //   title: "Heading 3",
          //   icon: "lucide:heading-3",
          // },
        ],
      },
      { divider: true },
      {
        title: "Move Up",
        icon: "lucide:arrow-up",
      },
      {
        title: "Move Down",
        icon: "lucide:arrow-down",
      },
      { divider: true },
      {
        title: "Style",
        icon: "lucide:paint-bucket",
        disabled: true,
      },
    ];
  }
</script>
<template>
  <div class="mb-12">
    <template v-for="block in editor.data.blocks">
      <div class="group flex items-baseline space-x-2">
        <div class="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <EditorDropdown :items="createItemsForBlock(block)">
            <UiButton size="icon-xs" variant="ghost" class="h-6 w-6">
              <Icon name="lucide:plus" />
            </UiButton>
          </EditorDropdown>
        </div>
        <EditorBlock :block="block">
          <EditorStylePopover :selection="editor.state.selection.get()" :block="block" :editor="editor" />
          <div
          class="pointer-events-none absolute opacity-35"
          v-if="
              block.nodes.length === 1 &&
              block.nodes[0].text === '' &&
              editor.state.cursor.get()?.block === block.id
              "
          >
          {{ placeholder[block.type] }}
          </div>
          <EditorTextNode v-for="(node, i) in block.nodes" :node="node" :id="block.id + '/' + i" />
        </EditorBlock>
      </div>
    </template>
  </div>

  Block texts:
  <pre>
    {{ editor.data.blocks.map((block) => block.nodes.map((node) => node.text)) }}
  </pre>

  Cursor position:
  <pre>
    {{ editor.state.cursor.get() }}
  </pre>

  Selected state:
  <pre>
    {{ editor.state.selection.get() }}
  </pre>

  <!-- Selected unit:
  <pre>
      {{ editor.state.selectedUnit }}
  </pre>

  Editor content: {{ editor.content.length }} {{ editor.content.map((block) => block.content.length) }}
  <pre>
    {{ editor.content }}
  </pre> -->
</template>
