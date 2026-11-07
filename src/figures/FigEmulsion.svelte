<!-- Эмульсия: капли масла с эмульгатором — и расслоившаяся смесь -->
<script>
  const drops = [[30, 40, 9], [62, 30, 7], [52, 62, 8], [86, 52, 9], [24, 78, 7], [80, 84, 8], [112, 34, 7], [114, 74, 9], [44, 100, 7], [96, 108, 8], [128, 104, 7]];
</script>
<svg viewBox="0 0 312 150" role="img" aria-label="Эмульсия масла в воде и расслоившаяся смесь">
  <g transform="translate(6 6)">
    <rect x="0" y="0" width="146" height="124" rx="12" class="f-water" />
    {#each drops as [x, y, r], i}
      <g class="f-drift" style="animation-delay:{-i * 0.37}s">
        <circle cx={x} cy={y} {r} class="f-oil" />
        {#each Array(8) as _, k}<line class="f-emul" x1={x + Math.cos(k * 0.785) * r} y1={y + Math.sin(k * 0.785) * r} x2={x + Math.cos(k * 0.785) * (r + 4)} y2={y + Math.sin(k * 0.785) * (r + 4)} />{/each}
      </g>
    {/each}
    <text x="73" y="140" class="f-label">эмульсия</text>
  </g>
  <g transform="translate(160 6)">
    <rect x="0" y="0" width="146" height="124" rx="12" class="f-water" />
    <rect x="0" y="0" width="146" height="38" rx="12" class="f-oil" />
    <rect x="0" y="26" width="146" height="12" class="f-oil" />
    <circle cx="40" cy="60" r="5" class="f-oil f-rise-oil" /><circle cx="100" cy="80" r="4" class="f-oil f-rise-oil" style="animation-delay:-1s" />
    <text x="73" y="140" class="f-label">расслоилась</text>
  </g>
</svg>
