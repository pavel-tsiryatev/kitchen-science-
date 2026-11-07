<script>
  /** Схема к статье по id из src/data/figures.json */
  import { FIGURES } from '../data/index.js';
  import FigBoil from '../figures/FigBoil.svelte';
  import FigOven from '../figures/FigOven.svelte';
  import FigOnion from '../figures/FigOnion.svelte';
  import FigDoneness from '../figures/FigDoneness.svelte';
  import FigLeidenfrost from '../figures/FigLeidenfrost.svelte';

  let { id } = $props();
  const C = { boil: FigBoil, oven: FigOven, onion: FigOnion, doneness: FigDoneness, leidenfrost: FigLeidenfrost };
  const f = $derived(FIGURES.find(x => x.id === id));
  const Comp = $derived(C[id]);
</script>

{#if f && Comp}
  <figure class="fig">
    <Comp />
    <figcaption>{f.caption}</figcaption>
  </figure>
{/if}
