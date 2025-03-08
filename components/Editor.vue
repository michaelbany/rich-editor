<script setup lang="ts">
  import type { EditorContent } from "~/types";

  const props = defineProps<{
    content: EditorContent;
  }>();

  const editor = useEditor(props.content);

  onMounted(() => {
    document.addEventListener("selectionchange", editor.select.capture);
  });

  onUnmounted(() => {
    document.removeEventListener("selectionchange", editor.select.capture);
  });
</script>
<template>
  <UiButton @click="editor.restyle('bold')">Bold</UiButton>
  <UiButton @click="editor.restyle('italic')">Italic</UiButton>
  <div>
    <template v-for="block in editor.content">
      <EditorBlock :block="block">
        <EditorTextNode v-for="(node, i) in block.content" :node="node" :id="block.id + '/' + i" />
      </EditorBlock>
    </template>
  </div>

  <pre>
      {{ editor.state.selectedUnit }}
  </pre>
</template>
