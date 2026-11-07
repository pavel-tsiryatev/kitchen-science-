<!-- Нарезка лука кубиком (вид сверху, корешок слева); шаги подсвечиваются по очереди -->
<svg viewBox="0 0 312 120" role="img" aria-label="Четыре шага нарезки лука кубиком">
  <defs><clipPath id="onion-clip"><ellipse cx="40" cy="40" rx="30" ry="22" /></clipPath></defs>
  {#each [0, 1, 2, 3] as k}
    <g transform="translate({4 + k * 77} 6)"><g class="f-step" style="animation-delay:{k * 0.9}s">
      <ellipse class="f-onion" cx="40" cy="40" rx="30" ry="22" />
      <rect class="f-root" x="6" y="34" width="6" height="12" rx="2" />
      <g clip-path="url(#onion-clip)">
        {#if k >= 1}{#each [26, 33, 40, 47, 54] as y}<line class="f-cut" x1="20" y1={y} x2="74" y2={y} />{/each}{/if}
        {#if k === 2}<line class="f-cut2" x1="20" y1="40" x2="74" y2="40" stroke-dasharray="3 3" stroke-width="3" />{/if}
        {#if k >= 3}{#each [28, 36, 44, 52, 60, 68] as x}<line class="f-cut2" x1={x} y1="14" x2={x} y2="66" />{/each}{/if}
      </g>
      <text x="40" y="84" class="f-label">{k + 1}</text>
      <text x="40" y="96" class="f-sub">{['половинка', 'надрезы вдоль', 'горизонтальный', 'поперёк'][k]}</text>
    </g></g>
  {/each}
</svg>
