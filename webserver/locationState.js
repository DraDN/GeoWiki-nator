// locationState.js
let CURRENT_LOCATION = { lat: 44.4268, lon: 26.1025 }; // Valori default

module.exports = {
    getLocation: () => CURRENT_LOCATION,
    setLocation: (newLat, newLon) => {
        // Opțional: poți adăuga validări aici
        CURRENT_LOCATION = { lat: newLat, lon: newLon };
    }
};
