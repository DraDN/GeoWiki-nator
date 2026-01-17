import * as utils from './utils.js';
import { CONFIG } from './config.js';
import { search_circle, popups } from './map_ui.js';
import { fetch_data } from './api.js';

// ===== UI ELEMENT DECLARATOINS =====

let search_radius_slider = document.getElementById("searchRadiusSlider");
utils.update_slider_fill_bar(search_radius_slider);

let search_radius_text = document.getElementById("searchRadiusText");
utils.clamp_value(search_radius_text);


let search_limit_slider = document.getElementById("searchLimitSlider");
utils.update_slider_fill_bar(search_limit_slider);

let search_limit_text = document.getElementById("searchLimitText");
utils.clamp_value(search_limit_text);


let search_button = document.getElementById("searchButton");
let search_status_led = document.getElementById("search-status-led");

// TODO: add status led for updating the location

// === LOCK ON BOTTON ===

let lock_on_button = document.getElementById("lock-on-button");

function blink_status_led(status) {
    if (status)
        search_status_led.classList.add('blinking');
    else
        search_status_led.classList.remove('blinking');
}

// ===== CONFIG INTERFACE =====

function commit_radius_settings(value) {
    CONFIG.SEARCH_RADIUS = value;

    // update all ui users of this value
    utils.set_slider_value_with_fill(search_radius_slider, value);
    search_radius_text.value = value;

    search_circle.radius = value;
}

function commit_limit_settings(value) {
    CONFIG.SEARCH_LIMIT = value;

    // update all ui users of this value
    utils.set_slider_value_with_fill(search_limit_slider, value);
    search_limit_text.value = value;
}

// ===== EVENTS ======

function is_valid_text_value(value, min, max) {
    if (!utils.is_numeric(value)) return -1;

    let clamped = utils.clamp_value(value, min, max);
    if (value != clamped) return -1;

    return clamped
}

search_radius_slider.addEventListener('input', function() {
    commit_radius_settings(this.value);
});


search_radius_text.addEventListener('input', function() {
    const val = is_valid_text_value(this.value, this.min, this.max);
    if (val != -1)
        commit_radius_settings(val);
});

search_radius_text.addEventListener('keydown', function(event) {
    if (!(event.key === 'Enter')) return;

    this.value = CONFIG.SEARCH_RADIUS;
});



search_limit_slider.addEventListener('input', function() {
    commit_limit_settings(this.value);
});


search_limit_text.addEventListener('input', function() {
    const val = is_valid_text_value(this.value, this.min, this.max);
    if (val != -1)
        commit_limit_settings(val);
});

search_limit_text.addEventListener('keydown', function(event) {
    if (!(event.key === 'Enter')) return;

    this.value = CONFIG.SEARCH_LIMIT;
});



lock_on_button.addEventListener('click', function() {
    search_circle.center();
});

search_button.addEventListener('click', function() {
    popups.remove();
    fetch_data();
})

export {
    search_button,
    blink_status_led
}