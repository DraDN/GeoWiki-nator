const COLORS = {
    USER_CIRCLE: '#FF0000',
    SEARCH_CIRCLE: '#6AB7FF',

    BODY_BG: '#1D1F21',
    CONTAINER_BG: '#235789',
    TEXT: '#6AB7FF'

    // CONTAINER_BG: '#1D1F21',
    // CONTAINER_BG: '#153858ff',
    // CONTAINER_BG: '#6AB7FF',
};

for (const [key, value] of Object.entries(COLORS)) {
    let new_key = key.replaceAll('_', '-').toLowerCase();
    document.documentElement.style.setProperty(`--${new_key}-color`, value);
    // console.log(`--${new_key} set to ${value}`)
}

const CONSTANTS = {
    USER_CIRCLE_RADIUS: 50 // in meters
};

const ICONS = {
    MARKER_ICON:  L.icon({
        iconUrl: 'map_marker_v2.png',
        iconSize: [38, 58],
        iconAnchor: [19, 57],
        popupAnchor: [0, -56]
    })
}

export {
    COLORS,
    ICONS,
    CONSTANTS
};