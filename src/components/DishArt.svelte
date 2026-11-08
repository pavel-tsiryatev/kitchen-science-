<script>
  /** Простая иллюстрация блюда по его виду (см. dishArt.js). Декоративная: скрыта от экранного диктора. */
  let { kind, size = 'banner' } = $props();
</script>

<div class="dish-art dish-{size}" aria-hidden="true">
  <svg viewBox="0 0 120 90" role="presentation">
    {#if kind === 'soup'}
      <path class="steam" d="M48 22c-4-5 4-8 0-13M60 20c-4-5 4-8 0-13M72 22c-4-5 4-8 0-13" />
      <rect x="22" y="34" width="76" height="40" rx="10" class="pot" />
      <rect x="14" y="40" width="10" height="6" rx="3" class="pot-dark" /><rect x="96" y="40" width="10" height="6" rx="3" class="pot-dark" />
      <ellipse cx="60" cy="34" rx="38" ry="7" class="soup" />
      <circle cx="48" cy="33" r="3" class="carrot" /><circle cx="66" cy="35" r="2.5" class="green" /><circle cx="74" cy="32" r="2" class="carrot" />
    {:else if kind === 'fish'}
      <ellipse cx="60" cy="62" rx="48" ry="12" class="plate" />
      <path d="M26 52c10-16 44-18 60 0-16 16-50 14-60 0z" class="fish" />
      <path d="M86 52l16-12v24z" class="fish-dark" />
      <circle cx="36" cy="49" r="2.6" class="eye" />
      <path d="M50 44v16M60 43v18M70 44v16" class="cut" />
      <circle cx="30" cy="66" r="5" class="lemon" /><path d="M30 61v10M25 66h10" class="lemon-line" />
    {:else if kind === 'chicken'}
      <ellipse cx="60" cy="64" rx="48" ry="12" class="plate" />
      <path d="M38 58c-6-14 6-30 24-28 18 2 24 18 16 28-6 8-34 8-40 0z" class="roast" />
      <path d="M76 38l14-14" class="bone" /><circle cx="92" cy="21" r="4" class="bone-end" /><circle cx="94" cy="26" r="4" class="bone-end" />
      <path d="M48 44c4-3 10-4 16-2" class="shine" />
    {:else if kind === 'meat'}
      <ellipse cx="60" cy="64" rx="48" ry="12" class="plate" />
      <path d="M30 56c-4-16 14-26 34-24 22 2 30 14 24 24-6 9-52 10-58 0z" class="meat" />
      <path d="M40 50c8 4 22 5 36-2" class="fat" />
      <path d="M44 40l8 6M58 38l8 6M72 40l8 6" class="grill" />
      <circle cx="94" cy="60" r="4" class="green" /><circle cx="100" cy="64" r="3" class="green" />
    {:else if kind === 'pasta'}
      <ellipse cx="60" cy="62" rx="46" ry="14" class="bowl" />
      <path d="M18 56c0 18 84 18 84 0" class="bowl-side" />
      <path d="M30 54c8-14 16 8 24-6s16 8 24-6 12 6 14 8" class="noodle" />
      <path d="M34 58c8-12 14 6 22-6s16 8 24-4" class="noodle" />
      <circle cx="52" cy="48" r="4" class="tomato" /><circle cx="70" cy="50" r="3.5" class="tomato" /><circle cx="62" cy="44" r="2" class="green" />
    {:else if kind === 'eggs'}
      <circle cx="58" cy="52" r="30" class="pan" /><path d="M86 48h26" class="handle" />
      <path d="M38 50c-2-10 10-14 16-10 6-6 18-2 16 8 6 6-2 16-12 12-8 6-22 2-20-10z" class="white" />
      <circle cx="52" cy="50" r="6" class="yolk" /><circle cx="66" cy="56" r="5.5" class="yolk" />
    {:else if kind === 'pancakes'}
      <ellipse cx="60" cy="70" rx="46" ry="10" class="plate" />
      <ellipse cx="60" cy="62" rx="34" ry="8" class="pancake" /><ellipse cx="60" cy="55" rx="34" ry="8" class="pancake" />
      <ellipse cx="60" cy="48" rx="34" ry="8" class="pancake" /><ellipse cx="60" cy="41" rx="34" ry="8" class="pancake-top" />
      <path d="M54 37c4 2 10 2 14 0l-2 10c-3 1-7 1-10 0z" class="butter" />
      <path d="M42 41c4 8 4 14 2 20" class="syrup" />
    {:else if kind === 'dumplings'}
      <ellipse cx="60" cy="64" rx="48" ry="12" class="plate" />
      <path d="M26 58c0-12 22-12 22 0z" class="dough" /><path d="M50 52c0-14 24-14 24 0z" class="dough" /><path d="M72 60c0-12 22-12 22 0z" class="dough" />
      <path d="M30 54l3-3 3 3 3-3 3 3 3-3" class="pinch" /><path d="M54 46l3-3 3 3 3-3 3 3 3-3" class="pinch" />
      <ellipse cx="62" cy="66" rx="8" ry="3" class="cream" />
    {:else if kind === 'dairy'}
      <path d="M38 32h44l-6 42H44z" class="cup" />
      <ellipse cx="60" cy="32" rx="22" ry="6" class="cream" />
      <circle cx="54" cy="30" r="3" class="berry" /><circle cx="63" cy="31" r="3" class="berry" /><circle cx="58" cy="27" r="2.5" class="berry" />
      <path d="M86 26c6 0 10 4 10 10" class="spoon" />
    {:else if kind === 'cake'}
      <ellipse cx="60" cy="72" rx="46" ry="9" class="plate" />
      <path d="M28 66V40l64-10v36z" class="cake" />
      <path d="M28 40l64-10 0 0-6-4-58 8z" class="cake-top" />
      <path d="M28 50l64-8M28 58l64-8" class="cream-line" />
      <circle cx="74" cy="27" r="4" class="berry" />
    {:else if kind === 'bake'}
      <ellipse cx="60" cy="68" rx="48" ry="10" class="board" />
      <path d="M22 62c0-22 76-22 76 0z" class="crust" />
      <path d="M36 48c4 4 8 4 12 0M54 44c4 4 8 4 12 0M72 48c4 4 8 4 12 0" class="score" />
      <path d="M52 28c-3-4 3-6 0-10M64 28c-3-4 3-6 0-10" class="steam" />
    {:else if kind === 'salad'}
      <path d="M16 46c0 26 88 26 88 0z" class="bowl" />
      <path d="M26 46c-2-14 10-18 18-10 4-12 22-12 24 0 8-8 24-2 22 10z" class="leaf" />
      <circle cx="44" cy="40" r="5" class="tomato" /><circle cx="70" cy="38" r="5" class="tomato" />
      <path d="M54 34h10" class="cucumber" /><circle cx="84" cy="42" r="3" class="olive" />
    {:else if kind === 'sauce'}
      <path d="M26 52c0-14 16-18 34-18s30 6 40 0c-2 12-8 18-16 24-10 8-48 8-58-6z" class="boat" />
      <ellipse cx="60" cy="40" rx="28" ry="5" class="sauce" />
      <path d="M30 56c-8 2-12 8-8 12" class="handle-thin" />
      <ellipse cx="60" cy="74" rx="40" ry="6" class="plate" />
    {:else if kind === 'grain'}
      <path d="M18 44c0 30 84 30 84 0z" class="bowl" />
      <ellipse cx="60" cy="44" rx="42" ry="9" class="grain" />
      <path d="M40 42h2M50 46h2M60 40h2M70 45h2M80 42h2M46 40h2M66 47h2" class="grain-dot" />
      <path d="M58 40c4-6 10-6 14-4l-4 6z" class="butter" />
      <path d="M50 30c-3-4 3-6 0-10M66 28c-3-4 3-6 0-10" class="steam" />
    {:else if kind === 'veg'}
      <ellipse cx="60" cy="70" rx="48" ry="9" class="board" />
      <path d="M24 64l30-30c4-4 10 2 6 6L30 70z" class="carrot" /><path d="M58 34l6-10M60 38l10-6" class="green-line" />
      <path d="M64 44c0-10 16-12 20-4 6-6 16 0 12 10-2 10-10 18-18 18s-14-12-14-24z" class="pepper" />
      <path d="M78 38l2-8" class="green-line" />
      <ellipse cx="40" cy="62" rx="8" ry="5" class="tomato" />
    {:else if kind === 'jar'}
      <rect x="38" y="26" width="44" height="52" rx="8" class="glass" />
      <rect x="40" y="18" width="40" height="10" rx="3" class="lid" />
      <rect x="42" y="40" width="36" height="34" rx="5" class="pickle" />
      <circle cx="52" cy="50" r="5" class="cucumber-slice" /><circle cx="66" cy="60" r="5" class="cucumber-slice" /><circle cx="56" cy="66" r="3" class="carrot" />
      <path d="M68 46c3-3 6-2 7 1" class="green-line" />
      <path d="M44 30h8" class="glare" />
    {/if}
  </svg>
</div>

<style>
  .dish-art { background: var(--primary-soft); border-radius: 16px; display: grid; place-items: center; overflow: hidden; }
  .dish-banner { height: 132px; margin: 0 0 14px; }
  .dish-banner svg { height: 120px; width: auto; }
  .dish-tile { flex: 0 0 46px; height: 46px; border-radius: 12px; }
  .dish-tile svg { width: 60px; height: 45px; }
  svg { display: block; }
  path, rect, circle, ellipse { stroke-linecap: round; stroke-linejoin: round; }
  .plate { fill: #F4EFE6; stroke: #CFC5B5; stroke-width: 1.5; }
  .board { fill: #C9A27A; }
  .bowl { fill: #E9DFD0; stroke: #BFAF98; stroke-width: 1.5; }
  .bowl-side { fill: #E9DFD0; stroke: #BFAF98; stroke-width: 1.5; }
  .pot { fill: #8A9099; } .pot-dark { fill: #6B7078; }
  .soup { fill: #D98B3A; } .carrot { fill: #E07B2E; } .green { fill: #6F9A4A; } .tomato { fill: #D2453A; }
  .steam { fill: none; stroke: #B9AFA2; stroke-width: 2.5; opacity: .8; }
  .fish { fill: #9FB4C2; } .fish-dark { fill: #7F97A8; } .eye { fill: #2E3338; } .cut { fill: none; stroke: #7F97A8; stroke-width: 2; }
  .lemon { fill: #F2C94C; } .lemon-line { stroke: #E0B23A; stroke-width: 1; fill: none; }
  .roast { fill: #C97B3A; } .shine { fill: none; stroke: #E3A66A; stroke-width: 3; }
  .bone { stroke: #EFE6D6; stroke-width: 7; } .bone-end { fill: #EFE6D6; }
  .meat { fill: #A4513A; } .fat { fill: none; stroke: #E9C9B5; stroke-width: 3; } .grill { fill: none; stroke: #6E3324; stroke-width: 3; }
  .noodle { fill: none; stroke: #EAC66A; stroke-width: 4; }
  .pan { fill: #4A4F57; } .handle { stroke: #3A3E45; stroke-width: 7; }
  .white { fill: #FBFAF6; } .yolk { fill: #F2A93B; }
  .pancake { fill: #E4B36A; stroke: #C99448; stroke-width: 1; } .pancake-top { fill: #EDC27B; stroke: #C99448; stroke-width: 1; }
  .butter { fill: #F6E08A; } .syrup { fill: none; stroke: #B5652A; stroke-width: 3; }
  .dough { fill: #F5EEDC; stroke: #D8CBB0; stroke-width: 1.5; } .pinch { fill: none; stroke: #D8CBB0; stroke-width: 1.5; }
  .cream { fill: #FFFDF7; stroke: #E6DCCB; stroke-width: 1; }
  .cup { fill: #DCE5EC; stroke: #AFC0CC; stroke-width: 1.5; } .berry { fill: #B23A55; } .spoon { fill: none; stroke: #9AA3AB; stroke-width: 3; }
  .cake { fill: #E8C48C; } .cake-top { fill: #FFF6E6; } .cream-line { fill: none; stroke: #FFF6E6; stroke-width: 3; }
  .crust { fill: #C98A47; } .score { fill: none; stroke: #9E6430; stroke-width: 2.5; }
  .leaf { fill: #7FAE57; } .cucumber { stroke: #4E8A3E; stroke-width: 5; } .olive { fill: #3B3A2E; }
  .boat { fill: #F4EFE6; stroke: #CFC5B5; stroke-width: 1.5; } .sauce { fill: #F3E7C9; } .handle-thin { fill: none; stroke: #CFC5B5; stroke-width: 3; }
  .grain { fill: #D9B77E; } .grain-dot { stroke: #B48E54; stroke-width: 2.5; }
  .pepper { fill: #D2453A; } .green-line { fill: none; stroke: #5E8E3E; stroke-width: 3; }
  .glass { fill: #DDEBE9; stroke: #A9C4C0; stroke-width: 1.5; opacity: .9; } .lid { fill: #C9A23A; }
  .pickle { fill: #B9C98A; opacity: .8; } .cucumber-slice { fill: #8DB463; stroke: #5E8E3E; stroke-width: 1.5; }
  .glare { stroke: #FFFFFF; stroke-width: 3; opacity: .7; }
</style>
