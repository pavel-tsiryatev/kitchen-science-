<!-- Три кастрюли: томление, умеренное и бурное кипение (пузырьки поднимаются с разной скоростью) -->
<script>
  const POTS = [
    { x: 8, label: 'Томление', t: '85–95 °C', n: 2, dur: 3.2 },
    { x: 112, label: 'Умеренное', t: 'около 100 °C', n: 5, dur: 1.7 },
    { x: 216, label: 'Бурное', t: '100 °C', n: 10, dur: 0.9 },
  ];
  const bubbles = (n, dur) => Array.from({ length: n }, (_, i) => ({ cx: 14 + ((i * 37) % 68), delay: -((i * dur) / n).toFixed(2), r: 2 + (i % 3) }));
</script>

<svg viewBox="0 0 312 150" role="img" aria-label="Режимы кипения: томление, умеренное и бурное кипение">
  {#each POTS as p}
    <g transform="translate({p.x} 10)">
      <path class="f-water" d="M6 40 h84 v52 a6 6 0 0 1 -6 6 h-72 a6 6 0 0 1 -6 -6z" />
      <path class="f-line" d="M2 34 h92 M6 34 v58 a6 6 0 0 0 6 6 h72 a6 6 0 0 0 6 -6 v-58" fill="none" />
      {#each bubbles(p.n, p.dur) as b}
        <circle class="f-bubble" cx={b.cx} cy="92" r={b.r} style="animation-duration:{p.dur}s;animation-delay:{b.delay}s" />
      {/each}
      <path class="f-flame" d="M30 112 q6 -10 0 -16 q10 6 6 16z M46 112 q6 -12 0 -18 q10 6 6 18z M62 112 q6 -10 0 -16 q10 6 6 16z" style="opacity:{0.35 + p.n / 16}" />
      <text x="48" y="128" class="f-label">{p.label}</text>
      <text x="48" y="140" class="f-sub">{p.t}</text>
    </g>
  {/each}
</svg>
