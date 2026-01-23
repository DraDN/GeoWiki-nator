import { CONFIG } from './logic/config.js';
import * as api from './logic/api.js';

// wrapped in a function because we need the location before the fetch
async function start_up() {
    await api.update_location();
    api.fetch_data();
};

start_up();
setInterval(api.update_location, CONFIG.LOCATION_PING_DELAY);