function get_slider_percentage(slider) {
    return (slider.value - slider.min) / (slider.max - slider.min) * 100;
}

// fill the slider background to the nub
function update_slider_fill_bar(slider) {
    const slid_val = get_slider_percentage(slider);
    slider.style.background = `linear-gradient(to right, #fff ${slid_val}%, var(--container-bg-color) ${slid_val}%)`;
}

// update the slider value and update the slider fill bar at the same time
function set_slider_value_with_fill(slider, value) {
    slider.value = value;
    update_slider_fill_bar(slider)
}

function clamp_value(val, min, max) {
    val = isNaN(val) ? min : val;

    return Math.min(Math.max(val, min), max);
}

function is_numeric(value) {
    return /^-?\d+$/.test(value);
}

export {
    get_slider_percentage,
    update_slider_fill_bar,
    set_slider_value_with_fill,
    clamp_value,
    is_numeric
}