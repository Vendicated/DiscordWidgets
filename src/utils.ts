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
