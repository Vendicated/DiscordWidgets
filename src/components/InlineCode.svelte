<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";

    interface $$Props extends HTMLAttributes<HTMLSpanElement> {}
</script>

<code spellcheck="false" {...$$restProps}><slot /></code>

<style>
    code {
        background: darksalmon;
        padding: 0 0.2em;
        border-radius: 4px;
    }
</style>
