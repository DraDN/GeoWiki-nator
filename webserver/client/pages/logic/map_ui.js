import { CONFIG } from "./config.js";
import { COLORS, ICONS, CONSTANTS } from './design_tokens.js';

const map = L.map('map').setView(CONFIG.CURRENT_LOCATION, CONFIG.ZOOM); 

// load tile map
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);


class Popups {
    #popups = [];
    #popup_options = {
        'className' : 'popup-custom glow-text'
    };

    #create_text(title, description, link) {
        return `<b>${title}</b><br>${description}<br><a href="${link}">Link</a>`;
    }

    add_popup(location, title, description, link) {
        const popup = L.marker(location, { icon: ICONS.MARKER_ICON });
        popup.addTo(map).bindPopup(this.#create_text(title, description, link), this.#popup_options);

        this.#popups.push(popup);
    }

    remove() {
        this.#popups.forEach(popup => {
            map.removeLayer(popup);
        })
    }

}

class SearchCircle {
    #location_circle;
    #search_circle;

    constructor() {
        const point = CONFIG.CURRENT_LOCATION;

        // draw a circle to represent our location
        this.#location_circle = L.circle(point, {
            color: COLORS.USER_CIRCLE,
            fillColor: COLORS.USER_CIRCLE,
            radius: CONSTANTS.USER_CIRCLE_RADIUS
        }).addTo(map);

        // draw a circle represinting the search area
        this.#search_circle = L.circle(point, {
            color: COLORS.SEARCH_CIRCLE,
            radius: CONFIG.SEARCH_RADIUS
        }).addTo(map);   
    }

    update_location() {
        this.#location_circle.setLatLng(CONFIG.CURRENT_LOCATION);
        this.#search_circle.setLatLng(CONFIG.CURRENT_LOCATION);
    };

    set radius(r) {
        this.#search_circle.setRadius(r);
    }

    center() {
        map.fitBounds(this.#search_circle.getBounds());
    }

    remove() {
        map.removeLayer(this.#location_circle);
        map.removeLayer(this.#search_circle);
    }
}

let search_circle = new SearchCircle();
let popups = new Popups();

export {
    map,
    search_circle,
    popups
}