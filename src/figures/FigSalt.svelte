<!-- Соль проникает в мясо: фронт соли медленно движется от поверхности к центру -->
<svg viewBox="0 0 312 130" role="img" aria-label="Проникновение соли в кусок мяса со временем">
  <defs>
    <clipPath id="salt-clip"><rect x="0" y="0" width="80" height="60" rx="12" /></clipPath>
  </defs>
  {#each [['15 минут', 0.08], ['2 часа', 0.25], ['сутки', 0.42]] as [t, f], i}
    <g transform="translate({14 + i * 100} 14)">
      <rect x="0" y="0" width="80" height="60" rx="12" class="f-meat" />
      <g clip-path="url(#salt-clip)">
        <rect x="0" y="0" width="80" height="60" class="f-salt-zone f-salt-grow" style="--d:{f * 60}px;animation-delay:{i * 0.3}s" />
      </g>
      <rect x="0" y="0" width="80" height="60" rx="12" class="f-meat-edge" />
      {#each [[8, 6], [40, 4], [70, 8], [6, 50], [72, 52], [38, 56]] as [x, y]}<rect x={x} y={y} width="3" height="3" class="f-crystal" />{/each}
      <text x="40" y="80" class="f-label">{t}</text>
    </g>
  {/each}
  <text x="156" y="118" class="f-sub">светлая зона — куда уже дошла соль</text>
</svg>
