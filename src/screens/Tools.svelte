<script>
  import { TROUBLESHOOTING, COMPARISONS } from '../data/index.js';
  import { state } from '../store.svelte.js';
  import { navigate } from '../router.js';
  import LabBar from '../components/LabBar.svelte';
  import Calculator from '../components/Calculator.svelte';
</script>

<LabBar />
{#if state.subTab === 'calc'}
  <Calculator />
{:else if state.subTab === 'trouble'}
  {#each TROUBLESHOOTING as t (t.id)}
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <h3 style="margin:0 0 8px 0;font-size:1.05rem;color:var(--danger);">{t.title}</h3>
      </div>
      <div style="font-size:0.88rem;margin-bottom:8px;">
        <strong>Вероятные причины:</strong>
        <ul style="margin:4px 0;padding-left:18px;">
          {#each t.causes as c}<li>{c}</li>{/each}
        </ul>
      </div>
      <div style="font-size:0.88rem;margin-bottom:8px;padding:8px 10px;border-radius:10px;background:var(--surface-alt);">
        <strong>Диагностика:</strong> {t.diag}
      </div>
      <div style="font-size:0.88rem;padding:8px 10px;border-radius:10px;background:var(--secondary-soft);">
        <strong>✅ Решение:</strong> {t.fix}
      </div>
      <button class="btn outline" style="margin-top:10px;padding:7px 12px;font-size:0.8rem;" onclick={() => navigate('article', t.rel)}>
        Открыть научную статью по теме →
      </button>
    </div>
  {/each}
{:else}
  {#each COMPARISONS as c (c.id)}
    <div class="card" style="overflow-x:auto;">
      <h3 style="margin:0 0 8px 0;font-size:1.02rem;color:var(--primary);">⚡ {c.title}</h3>
      <table class="comp-table">
        <thead>
          <tr>{#each c.headers as h}<th>{h}</th>{/each}</tr>
        </thead>
        <tbody>
          {#each c.rows as r}<tr>{#each r as cell}<td>{cell}</td>{/each}</tr>{/each}
        </tbody>
      </table>
    </div>
  {/each}
{/if}
