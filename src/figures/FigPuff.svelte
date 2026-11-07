<!-- Слоёное тесто: слои теста и жира; в духовке пар раздвигает слои -->
<svg viewBox="0 0 312 140" role="img" aria-label="Слои слоёного теста до и во время выпечки">
  <g transform="translate(10 20)">
    {#each Array(7) as _, i}<rect x="0" y={i * 10} width="120" height="6" class="f-dough" /><rect x="0" y={i * 10 + 6} width="120" height="4" class="f-fat" />{/each}
    <text x="60" y="94" class="f-label">до выпечки</text><text x="60" y="106" class="f-sub">тесто и жир слоями</text>
  </g>
  <path class="f-arrow" d="M140 55 h28 m-8 -6 l8 6 l-8 6" fill="none" />
  <g transform="translate(180 6)">
    {#each Array(7) as _, i}
      <g class="f-lift" style="--i:{i}"><rect x="0" y={i * 13} width="120" height="6" class="f-dough baked" /></g>
      {#if i < 6}<g class="f-steam-g" style="animation-delay:{-i * 0.2}s">{#each [20, 60, 100] as x}<circle cx={x} cy={i * 13 + 9.5} r="1.6" class="f-steam" />{/each}</g>{/if}
    {/each}
    <text x="60" y="108" class="f-label">в духовке</text><text x="60" y="120" class="f-sub">пар раздвигает слои</text>
  </g>
</svg>
