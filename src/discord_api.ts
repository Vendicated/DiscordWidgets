import { getRuntime } from "@astrojs/cloudflare/runtime";

const API_BASE = "https://discord.com/api/v10";
const CDN_BASE = "https://cdn.discordapp.com";

export async function sendRequest<T extends object = any>(req: Request, route: string) {
    const { DISCORD_TOKEN } = getRuntime<any>(req)?.env ?? import.meta.env;

    const res = await fetch(`${API_BASE}${route}`, {
        headers: {
            "Authorization": `Bot ${DISCORD_TOKEN}`,
            "Accept": "application/json"
        },
        cf: {
            // 10 minutes cache
            cacheTtl: 60 * 10,
            cacheEverything: true
        }
    });

    if (!res.ok) throw new Error(
        `Failed to GET ${route}: ${res.status} ${res.statusText}\n` + await res.text().catch(() => "")
    );

    return res.json() as Promise<T>;
}

const SAFE_CHARACTERS = new Set([":", "?", "@"]);
function encode(strings: TemplateStringsArray, ...args: Array<string | number>): string {
    return strings.reduce((acc, str, i) => {
        acc += str;

        if (args[i] != null) {
            const str = String(args[i]);
            if (decodeURIComponent(str).includes("/"))
                throw new Error("Invalid character in URL: /");

            acc += Array.from(
                String(str),
                char => SAFE_CHARACTERS.has(char) ? char : (decodeURIComponent(char) === char ? encodeURIComponent(char) : char)
            ).join("");
        }

        return acc;
    }, "");
}

export interface User {
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
    public_flags: number;
    flags: number;
    banner: string;
    // one is string, the other is number. ok discord????
    banner_color: string | null;
    accent_color: number;
    avatar_decoration: string;
    global_name: string;
}

const flagNames: Record<number, string> = {
    0: "Staff",
    1: "Partner",
    2: "Hypesquad Events",
    3: "Bug Hunter Level 1",
    6: "Hypesquad Bravery",
    7: "Hypesquad Brilliance",
    8: "Hypesquad Balance",
    9: "Early Supporter",
    14: "Bug Hunter Level 2",
    16: "Verified Bot",
    17: "Early Developer",
    18: "Certified Moderator",
    22: "Active Developer",
};

export async function getUser(req: Request, id: string) {
    if (decodeURIComponent(id) === "@me") throw new Error("Not allowed to GET /users/@me");

    return sendRequest<User>(req, encode`/users/${id}`);
}

const getExt = (asset: string) => asset.startsWith("a_") ? "gif" : "webp";

export function isPomelod(user: User) {
    return !user.discriminator || user.discriminator === "0";
}

export function getUserAvatar(user: User, format?: "webp" | "png") {
    if (!user.avatar) {
        const n = isPomelod(user)
            ? Number(BigInt(user.id) >> 22n) % 6
            : Number(user.discriminator) % 5;

        return `${CDN_BASE}/embed/avatars/${n}.png`;
    }

    return `${CDN_BASE}/avatars/${user.id}/${user.avatar}.${format ?? getExt(user.avatar)}?size=256&quality=lossless`;
}

export function getUserBanner(user: User) {
    if (!user.banner) return null;
    return `${CDN_BASE}/banners/${user.id}/${user.banner}.${getExt(user.banner)}?size=512&quality=lossless`;
}

export function getUserFlags(user: User, guessNitro: boolean): string[] {
    const flags: string[] = [];

    if (user.public_flags) {
        Object.entries(flagNames).forEach(([position, flagName]) => {
            if (user.public_flags & (1 << Number(position))) {
                flags.push(flagName);
            }
        });
    }

    if (guessNitro) {
        const hasNitro = user.avatar?.startsWith("a_") || !!user.avatar_decoration;
        if (hasNitro) flags.push("Nitro");
    }

    return flags;
}
