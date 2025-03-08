<script setup lang="ts">
  const dark = useDark();
  dark === true;
</script>
<template>
  <div class="m-8">
    <slot />
  </div>
</template>
