<script lang="ts">
    const switches = [
        {
            key: "dark",
            name: "Dark Theme",
            value: true,
            param() {
                return `theme=${this.value ? "dark" : "light"}`;
            },
        },
        {
            key: "show-banner",
            name: "Show Banner",
            value: true,
            param() {
                return `banner=${this.value}`;
            },
        },
        {
            key: "full-banner",
            name: "Show Full Banner",
            value: false,
            param() {
                return `full-banner=${this.value}`;
            },
        },
        {
            key: "rounded-corners",
            name: "Rounded Corners",
            value: true,
            param() {
                return `rounded-corners=${this.value}`;
            },
        },
        {
            key: "discord-icon",
            name: "Show Discord Icon",
            value: false,
            param() {
                return `discord-icon=${this.value}`;
            },
        },
        {
            key: "badges",
            name: "Show Badges",
            value: false,
            param() {
                return `badges=${this.value}`;
            },
        },
    ];

    let userId = "343383572805058560";

    $: url = `/user?id=${userId}&` + switches.map(sw => sw.param()).join("&");
    $: fullUrl = import.meta.env.SSR ? "" : location.origin + url;

    $: bannerHeight = switches.find(s => s.key === "show-banner")!.value
        ? switches.find(s => s.key === "full-banner")!.value
            ? 120
            : 48
        : 0;

    $: height = 72 + bannerHeight;

    $: code = `
<iframe
    title="Discord user embed"
    width="340"
    height=${height}
    frameborder="0"
    sandbox
    src="${fullUrl}"
></iframe>
`.trim();

    let didCopy = false;
    let timeout: ReturnType<typeof setTimeout>;
    function copyToClip() {
        navigator.clipboard.writeText(code);

        didCopy = true;
        clearTimeout(timeout);
        timeout = setTimeout(() => (didCopy = false), 800);
    }
</script>

<div class="root">
    <section>
        <label>
            <h3>User ID</h3>
            <input type="text" bind:value={userId} />
        </label>
    </section>

    <section>
        <h3>Options</h3>
        {#each switches as sw}
            <div>
                <label>
                    <input type="checkbox" bind:checked={sw.value} />
                    {sw.name}
                </label>
            </div>
        {/each}
    </section>

    <section>
        <h3>Preview</h3>
        <iframe
            title="User Embed"
            src={url}
            width="340"
            {height}
            frameborder="0"
            sandbox
        />
    </section>

    <section>
        <h3>HTML</h3>
        <div class="code">
            <button on:click={copyToClip} class={didCopy ? "did-copy" : ""}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960">
                    <title>Copy Code</title>
                    <path
                        fill="currentColor"
                        d="M180 975q-24 0-42-18t-18-42V312h60v603h474v60H180Zm120-120q-24 0-42-18t-18-42V235q0-24 18-42t42-18h440q24 0 42 18t18 42v560q0 24-18 42t-42 18H300Zm0-60h440V235H300v560Zm0 0V235v560Z"
                    />
                </svg>
            </button>
            <div class="code-wrapper">
                <code>{code}</code>
            </div>
        </div>
    </section>
</div>

<style>
    .root {
        display: inline-flex;
        flex-direction: column;
        gap: 0.5em;

        border-radius: 6px;
    }

    input[type="text"] {
        background-color: salmon;
        border: none;
        padding: 0.5em;
        border-radius: 6px;
    }

    h3 {
        margin: 0;
        margin-bottom: 0.2em;
    }

    .code {
        position: relative;
        border: 1px solid black;
        padding: 0.5em;
        max-width: 80vw;
    }

    .code-wrapper {
        overflow-wrap: anywhere;
        display: inline-block;
        white-space: pre-wrap;
    }

    button {
        all: unset;
        cursor: pointer;

        position: absolute;
        width: 24px;
        height: 24px;
        right: 4px;
        top: 4px;
    }

    .did-copy {
        color: green;
    }
</style>
