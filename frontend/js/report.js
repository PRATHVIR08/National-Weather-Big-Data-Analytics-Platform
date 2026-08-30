// ============================================================
// REPORT LOCATION PICKER
// National Weather Analytics Platform
// ============================================================

let locationPickerMap = null;
let locationMarker = null;

let selectedLat = null;
let selectedLng = null;


// ============================================================
// INITIALIZE LOCATION PICKER
// ============================================================

function initLocationPicker() {

    const button =
        document.getElementById("btnPickLocation");

    const closeButton =
        document.getElementById("btnCloseLocationPicker");

    const confirmButton =
        document.getElementById("btnConfirmLocation");

    const container =
        document.getElementById("locationPickerContainer");


    if (!button || !container) {

        console.warn(
            "Location picker elements not found."
        );

        return;
    }


    // ========================================================
    // OPEN MAP
    // ========================================================

    button.addEventListener("click", function () {

        container.style.display = "block";

        initializeLocationMap();

        // Leaflet needs this when map was initially hidden
        setTimeout(() => {

            locationPickerMap.invalidateSize();

        }, 200);

    });


    // ========================================================
    // CLOSE MAP
    // ========================================================

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function () {

                container.style.display = "none";

            }
        );

    }


    // ========================================================
    // CONFIRM LOCATION
    // ========================================================

    if (confirmButton) {

        confirmButton.addEventListener(
            "click",
            confirmSelectedLocation
        );

    }

}


// ============================================================
// INITIALIZE LEAFLET MAP
// ============================================================

function initializeLocationMap() {

    if (locationPickerMap) {

        locationPickerMap.invalidateSize();

        return;

    }


    locationPickerMap = L.map(
        "locationPickerMap"
    ).setView(
        [20.5937, 78.9629],
        5
    );


    // ========================================================
    // MAP TILE
    // ========================================================

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,

            attribution:
                '&copy; OpenStreetMap contributors'
        }
    ).addTo(locationPickerMap);


    // ========================================================
    // CLICK ON MAP
    // ========================================================

    locationPickerMap.on(
        "click",
        function (event) {

            const lat =
                event.latlng.lat;

            const lng =
                event.latlng.lng;


            selectLocation(
                lat,
                lng
            );

        }
    );

}


// ============================================================
// SELECT LOCATION
// ============================================================

function selectLocation(
    latitude,
    longitude
) {

    selectedLat =
        Number(latitude.toFixed(6));

    selectedLng =
        Number(longitude.toFixed(6));


    // ========================================================
    // REMOVE OLD MARKER
    // ========================================================

    if (locationMarker) {

        locationPickerMap.removeLayer(
            locationMarker
        );

    }


    // ========================================================
    // CREATE NEW MARKER
    // ========================================================

    locationMarker =
        L.marker(
            [
                selectedLat,
                selectedLng
            ],
            {
                draggable: true
            }
        )
            .addTo(locationPickerMap);


    locationMarker.bindPopup(
        `
        <strong>📍 Selected Location</strong>
        <br>
        Latitude: ${selectedLat}
        <br>
        Longitude: ${selectedLng}
        `
    ).openPopup();


    // ========================================================
    // UPDATE DISPLAY
    // ========================================================

    updateSelectedLocationDisplay();


    // ========================================================
    // ENABLE CONFIRM BUTTON
    // ========================================================

    const confirmButton =
        document.getElementById(
            "btnConfirmLocation"
        );

    if (confirmButton) {

        confirmButton.disabled = false;

    }


    const status =
        document.getElementById(
            "locationPickerStatus"
        );

    if (status) {

        status.innerText =
            "✓ Location selected";

        status.style.color =
            "#10b981";

    }


    // ========================================================
    // HANDLE MARKER DRAG
    // ========================================================

    locationMarker.on(
        "dragend",
        function () {

            const position =
                locationMarker.getLatLng();


            selectedLat =
                Number(
                    position.lat.toFixed(6)
                );


            selectedLng =
                Number(
                    position.lng.toFixed(6)
                );


            updateSelectedLocationDisplay();

        }
    );

}


// ============================================================
// UPDATE SELECTED COORDINATES
// ============================================================

function updateSelectedLocationDisplay() {

    const latitudeElement =
        document.getElementById(
            "selectedLatitude"
        );

    const longitudeElement =
        document.getElementById(
            "selectedLongitude"
        );


    if (latitudeElement) {

        latitudeElement.innerText =
            selectedLat ?? "—";

    }


    if (longitudeElement) {

        longitudeElement.innerText =
            selectedLng ?? "—";

    }

}


// ============================================================
// CONFIRM LOCATION
// ============================================================

function confirmSelectedLocation() {

    if (
        selectedLat === null ||
        selectedLng === null
    ) {

        return;

    }


    // ========================================================
    // FIND YOUR EXISTING FORM INPUTS
    // ========================================================

    const latitudeInput =
        document.getElementById(
            "latitude"
        );

    const longitudeInput =
        document.getElementById(
            "longitude"
        );


    // ========================================================
    // PUT COORDINATES INTO FORM
    // ========================================================

    if (latitudeInput) {

        latitudeInput.value =
            selectedLat;

    }


    if (longitudeInput) {

        longitudeInput.value =
            selectedLng;

    }


    // ========================================================
    // UPDATE GPS MESSAGE
    // ========================================================

    const gpsStatus =
        document.getElementById(
            "gpsStatus"
        );

    if (gpsStatus) {

        gpsStatus.innerText =
            `✓ Map location selected: ${selectedLat}, ${selectedLng}`;

        gpsStatus.style.color =
            "#10b981";

    }


    // ========================================================
    // CLOSE MAP
    // ========================================================

    const container =
        document.getElementById(
            "locationPickerContainer"
        );

    if (container) {

        container.style.display =
            "none";

    }

}

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initLocationPicker();

    }
);
