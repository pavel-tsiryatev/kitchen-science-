<script>
  /** Свои заметки к статье: «в следующий раз меньше соли», «духовка печёт сильнее» */
  import { state as app, saveState } from '../store.svelte.js';

  let { id, open = false } = $props();
  let timer = null;
  const text = $derived(app.notes[id] || '');
  function input(e) {
    const v = e.currentTarget.value;
    if (v.trim()) app.notes[id] = v.slice(0, 2000); else delete app.notes[id];
    clearTimeout(timer); timer = setTimeout(saveState, 400);
  }
</script>

<details class="card notes" open={open || !!text}>
  <summary>Мои заметки{#if text}<span class="notes-dot" aria-label="есть заметка"></span>{/if}</summary>
  <textarea class="field" rows="3" maxlength="2000" value={text} oninput={input} onblur={saveState}
    placeholder="Например: в следующий раз меньше соли, духовка печёт сильнее, понравилось с укропом" aria-label="Мои заметки к рецепту"></textarea>
</details>
