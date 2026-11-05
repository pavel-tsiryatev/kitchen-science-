<script>
  /** Текст с подсветкой слов, совпавших с поисковым запросом (без HTML-вставок) */
  import { highlight } from '../search.js';
  let { text, stems = [] } = $props();
  const parts = $derived(stems.length ? highlight(text, stems) : [{ text, hit: false }]);
</script>

{#each parts as p}{#if p.hit}<mark>{p.text}</mark>{:else}{p.text}{/if}{/each}
