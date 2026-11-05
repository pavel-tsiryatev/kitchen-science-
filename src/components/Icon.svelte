<script>
  /** Иконка из SVG-спрайта в index.html */
  let { name, size = 0 } = $props();
</script>

<svg class="ic" style={size ? `width:${size}px;height:${size}px` : undefined} aria-hidden="true"><use href="#i-{name}" /></svg>
