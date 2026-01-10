const map = L.map('map').setView([44.4268, 26.1025], 13); // Mare zoom pe bucharest city (cel mai smek)

// === UI ELEMENTS VARIABLES ===
var search_radius_slider = document.getElementById("searchRadiusSlider");
var search_radius_text = document.getElementById("searchRadiusText");

var search_limit_slider = document.getElementById("searchLimitSlider");
var search_limit_text = document.getElementById("searchLimitText");

var search_button = document.getElementById("searchButton");

// update the config with default slider values
let CONFIG = {
    SEARCH_RADIUS: search_radius_slider.value, // in meters
    SEARCH_LIMIT: search_limit_slider.value // max number of pages to search for
}

// update the texts with the default slider values
search_radius_text.textContent = search_radius_slider.value.toString();
search_limit_text.textContent = search_limit_slider.value.toString();


// efectiv tile urile de la osm ca nu se incarca singure gen
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// variables for the ui layers of the search
// kept so they can be removed when doing a different search
let user_circle, search_circle;
let popups = [];

// let dataPoints = [];
async function fetchData() {
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
            color: 'green',
            radius: CONFIG.SEARCH_RADIUS
            // radius: 1000
        }).addTo(map);

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

            popups.push(L.marker(location));
            popups[popups.length-1].addTo(map).bindPopup(`<b>${page.title}</b><br>${page.description}<br><a href='${page.fullurl}'>Link</a>`);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}


fetchData();

search_radius_slider.oninput = function() {
    CONFIG.SEARCH_RADIUS = this.value;
    search_radius_text.value = this.value;
};

search_radius_text.oninput = function() {
    CONFIG.SEARCH_RADIUS = this.value;
    search_radius_slider.value = this.value;
};

search_limit_slider.oninput = function() {
    CONFIG.SEARCH_LIMIT = this.value;
    search_limit_text.value = this.value;
};

search_limit_text.oninput = function() {
    CONFIG.SEARCH_LIMIT = this.value;
    search_limit_slider.value = this.value;
};

search_button.onclick = function() {
    map.removeLayer(user_circle);
    map.removeLayer(search_circle);

    popups.forEach(popup => {
        map.removeLayer(popup);
    });

    fetchData();
}