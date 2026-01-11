const map = L.map('map').setView([44.4268, 26.1025], 13); // Mare zoom pe bucharest city (cel mai smek)

function get_slider_percentage(slider) {
    return (slider.value - slider.min) / (slider.max - slider.min) * 100;
}

function update_slider_fill_bar(slider) {
    const slid_val = get_slider_percentage(slider);
    slider.style.background = `linear-gradient(to right, #fff ${slid_val}%, var(--container-bg-color) ${slid_val}%)`;
}

function clamp_value(element) {
    const min_val = parseInt(element.min);
    const max_val = parseInt(element.max);

    let val = parseInt(element.value);
    val = isNaN(val) ? min_val : val;

    element.value = Math.min(Math.max(val, min_val), max_val);
}

// === UI ELEMENTS VARIABLES ===
var search_radius_slider = document.getElementById("searchRadiusSlider");
update_slider_fill_bar(search_radius_slider);
var search_radius_text = document.getElementById("searchRadiusText");
clamp_value(search_radius_text);

var search_limit_slider = document.getElementById("searchLimitSlider");
update_slider_fill_bar(search_limit_slider);
var search_limit_text = document.getElementById("searchLimitText");
clamp_value(search_limit_text);

var search_button = document.getElementById("searchButton");
var search_status_led = document.getElementById("search-status-led");

var lock_on_button = document.getElementById("lock-on-button");

// update the config with default slider values
let CONFIG = {
    SEARCH_RADIUS: search_radius_slider.value, // in meters
    SEARCH_LIMIT: search_limit_slider.value // max number of pages to search for
}

// update the texts with the default slider values
search_radius_text.textContent = search_radius_slider.value.toString();
search_limit_text.textContent = search_limit_slider.value.toString();

var dark_filter = [
    'blur:0px',
    'brightness:95%',
    'contrast:130%',
    'grayscale:100%',
    'hue-rotate:0deg',
    'opacity:100%',
    'invert:100%',
    'saturate:0%'
];

// efectiv tile urile de la osm ca nu se incarca singure gen
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    // attribution: '&copy; OpenStreetMap contributors'
// }).addTo(map);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// variables for the ui layers of the search
// kept so they can be removed when doing a different search
let user_circle, search_circle;
let popups = [];

// let dataPoints = [];
async function fetchData() {
    search_status_led.classList.add('blinking');
    try {
        // get the gps point to search around
        const points_response = await fetch('/api');
        const point_data = await points_response.json(); 

        console.log('Am primit:', point_data);

        // for testing, we get the first point from the point data
        const first_point = point_data.locations[0].point;

        // draw a circle to represent our location
        user_circle = L.circle(first_point, {
            color: 'red',
            fillColor: 'red',
            radius: 50 // also in meters
        }).addTo(map);

        // draw a circle represinting the search area
        search_circle = L.circle(first_point, {
            // color: 'lightblue',
            color: COLORS.SEARCH_CIRCLE,
            radius: CONFIG.SEARCH_RADIUS
            // radius: 1000
        }).addTo(map);
        map.fitBounds(search_circle.getBounds());

        // construct the api call for the search
        const point_loc_params = new URLSearchParams({
            lat: first_point[0],
            lon: first_point[1],
            radius: CONFIG.SEARCH_RADIUS,
            limit: CONFIG.SEARCH_LIMIT
        });
        const wiki_response = await fetch(`/api/get_wikis?${point_loc_params}`);
        const wiki_data = await wiki_response.json();
        console.log('Got from wiki', wiki_data);

        for (let id in wiki_data) {
            const page = wiki_data[id];
            const location = [ page.coordinates[0].lat, page.coordinates[0].lon ];

            popups.push(L.marker(location, {icon: ICONS.MARKER_ICON}));
            popups[popups.length-1].addTo(map).bindPopup(`<b>${page.title}</b><br>${page.description}<br><a href='${page.fullurl}'>Link</a>`);
        }

        search_status_led.classList.remove('blinking');
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}


fetchData();

search_radius_slider.addEventListener('input', function() {
    // CONFIG.SEARCH_RADIUS = this.value;
    search_radius_text.value = this.value;

    update_slider_fill_bar(this);
});

search_radius_text.addEventListener('input', function() {
    // clamp_value(this);

    // CONFIG.SEARCH_RADIUS = this.value;
    search_radius_slider.value = this.value;

    update_slider_fill_bar(search_radius_slider);
});

search_limit_slider.addEventListener('input', function() {
    // CONFIG.SEARCH_LIMIT = this.value;
    search_limit_text.value = this.value;

    update_slider_fill_bar(this);
});

search_limit_text.addEventListener('input', function() {
    // clamp_value(this);

    // CONFIG.SEARCH_LIMIT = this.value;
    search_limit_slider.value = this.value;

    update_slider_fill_bar(search_limit_slider);
});

search_button.addEventListener('click', function() {
    map.removeLayer(user_circle);
    map.removeLayer(search_circle);

    popups.forEach(popup => {
        map.removeLayer(popup);
    });

    clamp_value(search_limit_text);
    clamp_value(search_radius_text);

    CONFIG.SEARCH_RADIUS = search_radius_slider.value;
    CONFIG.SEARCH_LIMIT = search_limit_slider.value;

    // search_status_led.classList.add('blinking');
    
    fetchData();
});

lock_on_button.addEventListener('click', function() {
    map.fitBounds(search_circle.getBounds());
})