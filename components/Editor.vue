<script setup lang="ts">
  import type { Block, BlockType, EditorContent } from "~/types";

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

  provide<typeof editor>("editor", editor);

  function createItemsForBlock(block: Block) {
    return [
      {
        title: "Comment",
        icon: "lucide:message-circle",
        disabled: true,
      },
      { divider: true },
      {
        title: "Delete",
        icon: "lucide:trash",
        disabled: editor.data.blocks.length === 1,
        click: () => editor.block.remove(editor.block.find(block.id) as NonNullable<BlockModel>),
      },
      {
        title: "Duplicate",
        icon: "lucide:copy",
        click: () => editor.block.clone(editor.block.find(block.id) as NonNullable<BlockModel>),
      },
      {
        title: "Turn into",
        icon: "lucide:repeat-2",
        items: Object.entries(blockSchema).map(([key, value]) => ({
          title: value.name,
          icon: value.icon,
          click: () => editor.block.convert(editor.block.find(block.id), key as BlockType),
        })),
      },
      { divider: true },
      {
        title: "Move Up",
        icon: "lucide:arrow-up",
        disabled: editor.data.blocks.indexOf(block) === 0,
        click: () => editor.block.move(editor.block.find(block.id) as NonNullable<BlockModel>, -1),
      },
      {
        title: "Move Down",
        icon: "lucide:arrow-down",
        disabled: editor.data.blocks.indexOf(block) === editor.data.blocks.length - 1,
        click: () => editor.block.move(editor.block.find(block.id) as NonNullable<BlockModel>, 1),
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
          <EditorStylePopover
            :selection="editor.state.selection.get()"
            :block="block"
            :editor="editor"
          />
          <div
            class="pointer-events-none absolute opacity-35"
            v-if="
              block.nodes.length === 1 &&
              block.nodes[0].text === '' &&
              editor.state.cursor.get()?.block === block.id
            "
          >
            {{ blockSchema[block.type].placeholder }}
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
</template>
