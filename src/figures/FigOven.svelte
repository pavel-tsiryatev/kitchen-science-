<!-- Духовка: три уровня, тэны сверху и снизу, вентилятор гонит воздух -->
<svg viewBox="0 0 312 180" role="img" aria-label="Уровни противня в духовке и вентилятор">
  <rect class="f-line" x="8" y="8" width="196" height="164" rx="10" fill="none" />
  <path class="f-heat" d="M20 22 l11 6 l11 -6 l11 6 l11 -6 l11 6 l11 -6 l11 6 l11 -6 l11 6 l11 -6 l11 6 l11 -6 l11 6 l11 -6 l11 6" fill="none" />
  <path class="f-heat" d="M20 158 l11 -6 l11 6 l11 -6 l11 6 l11 -6 l11 6 l11 -6 l11 6 l11 -6 l11 6 l11 -6 l11 6 l11 -6 l11 6 l11 -6" fill="none" style="animation-delay:-.8s" />
  <path class="f-air" d="M168 70 C 110 40 30 46 24 92 C 30 138 110 144 168 114" fill="none" />
  {#each [[52, 'Верх', 'румяный верх'], [92, 'Середина', 'ровный жар'], [132, 'Низ', 'хрустящее дно']] as [y, t, d], i}
    <line class="f-rack" x1="18" y1={y} x2="152" y2={y} />
    <rect class="f-tray" class:main={i === 1} x="34" y={y - 9} width="96" height="8" rx="2" />
    <line class="f-rack" x1="204" y1={y} x2="212" y2={y} />
    <text x="216" y={y} class="f-label f-left">{t}</text>
    <text x="216" y={y + 12} class="f-sub f-left">{d}</text>
  {/each}
  <g transform="translate(180 92)">
    <circle r="15" class="f-line" fill="none" />
    <g class="f-fan"><path class="f-blade" d="M0 0 C 4 -10 10 -12 12 -4 Z M0 0 C 10 4 12 10 4 12 Z M0 0 C -4 10 -10 12 -12 4 Z M0 0 C -10 -4 -12 -10 -4 -12 Z" /></g>
  </g>
</svg>
