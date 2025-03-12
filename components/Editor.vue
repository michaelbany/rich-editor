<script setup lang="ts">
  import type { EditorContent } from "~/types";

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
</script>
<template>
  <div class="mb-8 space-x-2">
    <UiButton size="icon" @click="editor.node.style('bold')"><Icon name="lucide:bold" /></UiButton>
    <UiButton size="icon" @click="editor.node.style('italic')"
      ><Icon name="lucide:italic"
    /></UiButton>
  </div>
  <div class="mb-12">
    <template v-for="block in editor.data.blocks">
      <EditorBlock :block="block">
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
