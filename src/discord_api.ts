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
}

export const getUser = (req: Request, id: string) => sendRequest<User>(req, `/users/${id}`);

const getExt = (asset: string) => asset.startsWith("a_") ? "gif" : "webp";

export function getUserAvatar(user: User, format?: "webp" | "png") {
    if (!user.avatar) return `${CDN_BASE}/embed/avatars/${Number(user.discriminator) % 6}.png`;

    return `${CDN_BASE}/avatars/${user.id}/${user.avatar}.${format ?? getExt(user.avatar)}?size=256`;
}

export function getUserBanner(user: User) {
    if (!user.banner) return null;
    return `${CDN_BASE}/banners/${user.id}/${user.banner}.${getExt(user.banner)}?size=512`;
}

export function getUserFlags(user: User): string[] {
    const flagNames: Record<number, string> = {
        0: "Staff",
        1: "Partner",
        2: "HypeEvents",
        3: "BugHunter1",
        6: "HypeBravery",
        7: "HypeBrilliance",
        8: "HypeBalance",
        9: "EarlySupporter",
        14: "BugHunter2",
        16: "Verified Bot",
        17: "EarlyDeveloper",
        18: "CertifiedModerator",
        22: "ActiveDeveloper",
    };

    const flags: string[] = [];

    if (user.public_flags) {
        Object.entries(flagNames).forEach(([position, flagName]) => {
            if (user.public_flags & (1 << Number(position))) {
                flags.push(flagName);
            }
        });
    }

    return flags;
}