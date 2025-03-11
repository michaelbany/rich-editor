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
</script>
<template>
  <div class="mb-8 space-x-2">
    <UiButton size="icon" @click="editor.node.style('bold')"><Icon name="lucide:bold" /></UiButton>
    <UiButton size="icon" @click="editor.node.style('italic')"><Icon name="lucide:italic" /></UiButton>
  </div>
  <div class="mb-12">
    <template v-for="block in editor.data.blocks">
      <EditorBlock :block="block" @input="() => console.log(editor.data.blocks)">
        <EditorTextNode v-for="(node, i) in block.nodes" :node="node" :id="block.id + '/' + i" />
      </EditorBlock>
    </template>
  </div>

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
