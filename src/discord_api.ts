const API_BASE = "https://discord.com/api/v10";
const CDN_BASE = "https://cdn.discordapp.com";

const TOKEN = import.meta.env.DISCORD_TOKEN;

export async function sendRequest<T extends object = any>(route: string) {
    const res = await fetch(`${API_BASE}${route}`, {
        headers: {
            "Authorization": `Bot ${TOKEN}`,
            "Accept": "application/json"
        }
    });

    if (!res.ok) throw new Error(
        `Failed to GET ${route}: ${res.status} ${res.statusText}\n` + await res.text().catch(() => "")
    );

    return res.json() as Promise<T>;
}

interface User {
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

export const getUser = (id: string) => sendRequest<User>(`/users/${id}`);

const getExt = (asset: string) => asset.startsWith("a_") ? "gif" : "webp";

export function getUserAvatar(user: User) {
    if (!user.avatar) return `${CDN_BASE}/embed/avatars/${Number(user.discriminator) % 6}.png`;

    return `${CDN_BASE}/avatars/${user.id}/${user.avatar}.${getExt(user.avatar)}?size=256`;
}

export function getUserBanner(user: User) {
    if (!user.banner) return null;
    return `${CDN_BASE}/banners/${user.id}/${user.banner}.${getExt(user.banner)}?size=512`;
}
