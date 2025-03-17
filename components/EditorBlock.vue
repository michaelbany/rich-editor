<script setup lang="ts">
  import type { Block, HeadingBlock } from "~/types";

  const props = defineProps<{
    block: Block;
  }>();

  const editor = inject("editor");
</script>
<template>
  <component
    :is="blockSchema[props.block.type].component"
    :id="props.block.id"
    contenteditable
    @dragstart.prevent
    @dragover.prevent
    @drop.prevent
    class="focus:outline-none w-full"
  >
    <slot />
  </component>
</template>
