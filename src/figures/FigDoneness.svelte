<!-- Срезы стейка: от rare до well done -->
<svg viewBox="0 0 312 120" role="img" aria-label="Степени прожарки стейка и температуры в центре">
  <defs>
    {#each [['r', '#B3263F'], ['mr', '#C84D5B'], ['m', '#D4877F'], ['w', '#9B7462']] as [id, c]}
      <radialGradient id="g-{id}" cx="50%" cy="50%" r="60%"><stop offset="0%" stop-color={c} /><stop offset="70%" stop-color={c} stop-opacity=".85" /><stop offset="100%" stop-color="#7A5341" /></radialGradient>
    {/each}
  </defs>
  {#each [['r', 'rare', '50–52 °C'], ['mr', 'medium rare', '54–57 °C'], ['m', 'medium', '60–63 °C'], ['w', 'well done', 'от 70 °C']] as [id, n, t], i}
    <g transform="translate({6 + i * 77} 8)"><g class="f-pop" style="animation-delay:{i * 0.15}s">
      <rect x="4" y="12" width="66" height="44" rx="14" fill="url(#g-{id})" class="f-steak" />
      <text x="37" y="76" class="f-label">{n}</text>
      <text x="37" y="90" class="f-sub">{t}</text>
    </g></g>
  {/each}
</svg>
