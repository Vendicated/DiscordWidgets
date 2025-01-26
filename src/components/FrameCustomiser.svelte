<script lang="ts">
    import InlineCode from "./InlineCode.svelte";

    const enum ActionState {
        None = "",
        Success = "action-success",
        Fail = "action-fail",
    }

    interface Command {
        title: string;
        description: string;
        command: string;
        state?: ActionState;
        timeout?: ReturnType<typeof setTimeout>;
    }

    interface Switch {
        key: string;
        name: string;
        value: boolean;
        param?(): string;
    }

    interface TextOption {
        key: string;
        name: string;
        value: string;
        placeholder: string;
    }

    function s(a: TemplateStringsArray, ...args: any[]) {
        let s = a.map((s, i) => s + (args[i] ?? "")).join("");

        const minIndent =
            s
                .match(/^ *(?=\S)/gm)
                ?.reduce(
                    (prev, curr) => Math.min(prev, curr.length),
                    Infinity
                ) ?? 0;

        return s.replace(new RegExp(`^ {${minIndent}}`, "gm"), "").trim();
    }

    let commands: Command[] = [
        {
            title: "Change Theme",
            description: "Theme: light | dark",
            command: s`
                widget.contentWindow.postMessage({
                    command: "setTheme",
                    theme: "dark"
                }, "*")
                `,
        },
        {
            title: "Change Colours",
            description: "Change the background and/or foreground colour",
            command: s`
                widget.contentWindow.postMessage({
                    command: "setColors",
                    backgroundColor: "#000000",
                    foregroundColor: "#ffffff",
                    foregroundSecondary: "#fefefe",
                }, "*")
                `,
        },
    ];

    const switches: Switch[] = [
        {
            key: "dark",
            name: "Dark Theme",
            value: true,
            param() {
                return `theme=${this.value ? "dark" : "light"}`;
            },
        },
        {
            key: "display-name",
            name: "Show Display Name",
            value: true,
        },
        {
            key: "banner",
            name: "Show Banner",
            value: true,
        },
        {
            key: "full-banner",
            name: "Show Full Banner",
            value: false,
        },
        {
            key: "rounded-corners",
            name: "Rounded Corners",
            value: true,
        },
        {
            key: "discord-icon",
            name: "Show Discord Icon",
            value: false,
        },
        {
            key: "badges",
            name: "Show Badges",
            value: false,
        },
        {
            key: "guess-nitro",
            name: "Guess whether user has Nitro (for Nitro badge)",
            value: false,
        },
    ];

    const textOptions: TextOption[] = [
        {
            key: "background-color",
            name: "Background Colour",
            placeholder: "#000000",
            value: "",
        },
        {
            key: "foreground-color",
            name: "Foreground Colour",
            placeholder: "#fff",
            value: "",
        },
        {
            key: "foreground-secondary",
            name: "Secondary Colour (for Display Name)",
            placeholder: "#fff",
            value: "",
        },
    ];

    let userId = "343383572805058560";

    $: url =
        `/user?id=${userId}&` +
        switches
            .map(sw => ("param" in sw ? sw.param!() : `${sw.key}=${sw.value}`))
            .join("&") +
        "&" +
        textOptions
            .filter(opt => opt.value)
            .map(o => `${o.key}=${encodeURIComponent(o.value)}`)
            .join("&");

    $: fullUrl = import.meta.env.SSR ? "" : location.origin + url;

    $: bannerHeight = switches.find(s => s.key === "banner")!.value
        ? switches.find(s => s.key === "full-banner")!.value
            ? 120
            : 48
        : 0;

    $: height = 72 + bannerHeight;

    $: code = s`
        <iframe
            title="Discord user embed"
            width="340"
            height="${height}"
            frameborder="0"
            sandbox="allow-scripts"
            src="${fullUrl}"
        ></iframe>
    `;

    let didCopy = false;
    let timeout: ReturnType<typeof setTimeout>;
    function copyToClip() {
        navigator.clipboard.writeText(code);

        didCopy = true;
        clearTimeout(timeout);
        timeout = setTimeout(() => (didCopy = false), 800);
    }

    function runCommand(target: any, command: (typeof commands)[number]) {
        const code =
            'const widget = document.querySelector("iframe");' +
            command.command;

        try {
            Function(code)();
            command.state = ActionState.Success;
        } catch {
            command.state = ActionState.Fail;
        }

        clearTimeout(command.timeout);
        command.timeout = setTimeout(() => {
            command.state = ActionState.None;
            commands = commands;
        }, 800);

        commands = commands;
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
        {#each textOptions as opt}
            <div>
                <label class="text-opt">
                    <h4>{opt.name}</h4>
                    <input
                        type="text"
                        placeholder={opt.placeholder}
                        bind:value={opt.value}
                    />
                </label>
            </div>
        {/each}
    </section>

    <section>
        <h3>Preview</h3>
        <iframe
            title="Discord user embed"
            src={url}
            width="340"
            {height}
            frameborder="0"
            sandbox="allow-scripts"
        />
    </section>

    <section>
        <h3>HTML</h3>
        <div class="code">
            <button
                on:click={copyToClip}
                class={didCopy ? "action-success" : ""}
            >
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

    <section class="api">
        <h3>postMessage() API</h3>
        <p>
            The widget supports some commands via <InlineCode
                >window.postMessage()</InlineCode
            >
            (<a
                href="https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage"
                >Docs on mdn</a
            >)
        </p>
        <p>
            To use them, you first need to allow the iframe to execute
            javascript via <InlineCode>sandbox="allow-scripts"</InlineCode> (this
            is already the default if you copied the iframe code from above)
            <br />
            <br />
            The snippets below assume <InlineCode>widget</InlineCode> is a variable
            holding the iframe element.
            <br />
            You can for example do this via
            <InlineCode
                >const widget = document.querySelector('iframe[title="Discord
                user embed"]')
            </InlineCode>
        </p>

        <div class="api-table">
            {#each commands as cmd}
                <div class="api-entry">
                    <h4>{cmd.title}</h4>
                    <p>{cmd.description}</p>
                    <div class="api-code">
                        <code
                            spellcheck="false"
                            contenteditable
                            bind:textContent={cmd.command}
                        />
                        <button
                            on:click={e => runCommand(e.currentTarget, cmd)}
                            class={cmd.state}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 -960 960 960"
                            >
                                <title>Run Code</title>
                                <path
                                    fill="currentColor"
                                    d="M320-203v-560l440 280-440 280Zm60-280Zm0 171 269-171-269-171v342Z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            {/each}
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

    input[type="text"]::placeholder {
        color: black;
        opacity: 0.4;
    }

    h3,
    h4 {
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

    .action-success {
        color: green;
    }

    .action-fail {
        color: red;
    }

    .api {
        margin-block: 1em;
    }

    .api-table {
        margin-top: 0.5em;
        border: 1px solid black;
        padding: 0.5em;
        display: grid;
        gap: 0.5em;
    }

    .api-code {
        position: relative;
    }

    .api-entry code {
        margin-top: 0.2em;
        display: block;
        padding: 0.5em;
        background: darksalmon;
        border-radius: 6px;
        white-space: pre-wrap;
    }

    .api-entry code:focus {
        outline: 1px solid black;
    }

    p {
        margin: 0;
    }
</style>
