<!-- Капля на сковороде при разной температуре: растекается, шипит, катается на паре -->
<svg viewBox="0 0 312 120" role="img" aria-label="Капля воды на сковороде при разной температуре">
  <defs><linearGradient id="pan-heat" x1="0" x2="1"><stop offset="0" stop-color="var(--secondary)" stop-opacity=".35" /><stop offset="1" stop-color="var(--primary)" stop-opacity=".9" /></linearGradient></defs>
  <rect x="6" y="66" width="300" height="10" rx="4" fill="url(#pan-heat)" />
  <ellipse class="f-water-s" cx="52" cy="63" rx="26" ry="4" />
  {#each [40, 52, 64] as x, i}<circle class="f-bubble-s" cx={x} cy="61" r="1.6" style="animation-delay:{-i * 0.4}s" />{/each}
  <ellipse class="f-water-s" cx="156" cy="58" rx="14" ry="8" />
  {#each [[140, 50], [172, 48], [150, 44], [164, 42]] as [x, y], i}<circle class="f-spark" cx={x} cy={y} r="1.8" style="animation-delay:{-i * 0.15}s" />{/each}
  <g class="f-skate"><circle class="f-water-s" cx="250" cy="52" r="9" /><path class="f-vapor" d="M238 63 h24" /></g>
  <text x="52" y="94" class="f-label">растекается</text><text x="52" y="106" class="f-sub">холодно</text>
  <text x="156" y="94" class="f-label">шипит</text><text x="156" y="106" class="f-sub">горячо</text>
  <text x="252" y="94" class="f-label">катается</text><text x="252" y="106" class="f-sub">от ~200 °C</text>
</svg>
