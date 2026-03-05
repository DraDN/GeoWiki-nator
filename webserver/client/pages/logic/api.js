import { CONFIG } from './config.js';
import * as map_ui from './map_ui.js';
import * as control_ui from './control_ui.js'

const socket = io();

async function update_location() {
    control_ui.location_ping_led.blink = true;

    const resp = await new Promise(resolve => socket.emit('get', resolve));

    CONFIG.CURRENT_LOCATION = resp.location;
    map_ui.search_circle.update_location();

    console.log('got point', resp.location)
    console.log('set config to ', CONFIG.CURRENT_LOCATION)

    control_ui.location_ping_led.blink = false;
}

async function fetch_data() {
    control_ui.search_status_led.blink = true;
    try {
        const point = CONFIG.CURRENT_LOCATION;
        map_ui.search_circle.center();

        // construct the api call for the search
        const point_loc_params = new URLSearchParams({
            lat: point.lat,
            lon: point.lon,
            radius: CONFIG.SEARCH_RADIUS,
            limit: CONFIG.SEARCH_LIMIT
        });
        const wiki_response = await fetch(`/api/get_wikis?${point_loc_params}`);
        const wiki_data = await wiki_response.json();
        console.log('Got from wiki', wiki_data);
        console.log('from query: ', `/api/get_wikis?${point_loc_params}`);

        // add the popups for all of the wiki pages got
        for (let id in wiki_data) {
            const page = wiki_data[id];
            const location = [ page.coordinates[0].lat, page.coordinates[0].lon ];

            map_ui.popups.add_popup(location, page.title, page.description, page.fullurl);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    control_ui.search_status_led.blink = false;
}

export {
    fetch_data,
    update_location
}