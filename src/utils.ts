import { User, getUserAvatar } from "./discord_api";
import quantize from "./pnnquant2";

export function numToHexColor(num: number) {
    return "#" + num.toString(16).padStart(6, "0");
}

const DefaultPfpColors = [
    "#5865f2",
    "#757e8a",
    "#3ba55c",
    "#faa61a",
    "#ed4245",
    "#eb459f"
];

export async function getPfpColor(user: User) {
    if (!user.avatar) return DefaultPfpColors[Number(user.discriminator) % DefaultPfpColors.length];

    const res = await fetch(getUserAvatar(user, "png")).catch(() => null);
    if (!res) return "#000000";

    // TODO: This should actually be the pixel data, not the raw image bytes lmao
    // need to figure out how to do this without canvas (not supported in workers :D)
    const buf = await res.arrayBuffer();

    const length = buf.byteLength + (4 - buf.byteLength % 4);
    const data = new Uint8Array(length);
    data.set(new Uint8Array(buf));

    const rgb = quantize(data, 1)[0];

    return numToHexColor(
        rgb[0] << 16 | rgb[1] << 8 | rgb[2]
    );
}
