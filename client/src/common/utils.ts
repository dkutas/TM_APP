export const getBackgroundColorForCategory = (category: string | undefined) => {
    switch (category) {
        case "DONE":
            return "#2e7d32";
        case "INPROGRESS":
            return "#0288d1";
        case "TODO":
            return "#9e9e9e";
        default:
            return "#9e9e9e";
    }
}

export const getTextColorForCategory = (category: string | undefined) => {
    switch (category) {
        case "DONE":
            return "#fff";
        case "INPROGRESS":
            return "#fff";
        case "TODO":
            return "#fff";
        default:
            return "#e0e0e0";
    }
}

export const getBorderColorForCategory = (category: string | undefined) => {
    switch (category) {
        case "DONE":
            return "#1b5e20";
        case "INPROGRESS":
            return "#01579b";
        case "TODO":
            return "#616161";
        default:
            return "#616161";
    }
}

export function capitalizeFirstLetter(string: string) {
    return string.replace(/^./, string[0].toUpperCase())
}