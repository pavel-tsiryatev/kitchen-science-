<!-- Кристаллы льда в клетках: медленная и быстрая заморозка -->
<script>
  const cells = [[0, 0], [44, 0], [88, 0], [0, 40], [44, 40], [88, 40]];
</script>
<svg viewBox="0 0 312 130" role="img" aria-label="Крупные кристаллы при медленной заморозке и мелкие при быстрой">
  <g transform="translate(8 8)">
    {#each cells as [x, y]}<rect x={x} y={y} width="40" height="36" rx="8" class="f-cell" />{/each}
    {#each [[22, 18, 0], [66, 38, 30], [110, 18, 60], [40, 58, 15], [96, 58, 45]] as [x, y, a], i}
      <path class="f-ice big" d="M{x - 14} {y} L{x + 14} {y} M{x} {y - 14} L{x} {y + 14} M{x - 10} {y - 10} L{x + 10} {y + 10} M{x - 10} {y + 10} L{x + 10} {y - 10}" transform="rotate({a} {x} {y})" style="animation-delay:{i * 0.2}s" />
    {/each}
    <text x="64" y="96" class="f-label">медленно</text><text x="64" y="108" class="f-sub">крупные кристаллы рвут клетки</text>
  </g>
  <g transform="translate(166 8)">
    {#each cells as [x, y]}<rect x={x} y={y} width="40" height="36" rx="8" class="f-cell" />{/each}
    {#each cells as [x, y], i}{#each [[10, 10], [26, 12], [16, 24], [30, 28], [8, 30]] as [dx, dy]}<path class="f-ice small" d="M{x + dx - 3} {y + dy} h6 M{x + dx} {y + dy - 3} v6" style="animation-delay:{i * 0.1}s" />{/each}{/each}
    <text x="64" y="96" class="f-label">быстро</text><text x="64" y="108" class="f-sub">мелкие кристаллы, клетки целы</text>
  </g>
</svg>
