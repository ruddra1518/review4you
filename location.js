// ==========================
// REVIEW4YOU LOCATION
// ==========================

const locationButton =
    document.getElementById("locationButton");

const locationPopup =
    document.getElementById("locationPopup");

const closeLocationPopup =
    document.getElementById("closeLocationPopup");

const detectLocationBtn =
    document.getElementById("detectLocationBtn");

const saveManualLocationBtn =
    document.getElementById("saveManualLocationBtn");

const manualLocationInput =
    document.getElementById("manualLocationInput");

const locationSuggestions =
    document.getElementById("locationSuggestions");


// ==========================
// RESTORE SAVED LOCATION
// ==========================

const savedLocation =
    localStorage.getItem(
        "review4you_user_location"
    );

if (savedLocation && locationButton) {

    const userLocation =
        JSON.parse(savedLocation);

if (userLocation.type === "manual") {
    locationButton.innerHTML =
        '📍 <span class="location-text">' +
        userLocation.location +
        '</span>';
}
else if (userLocation.type === "gps") {
    locationButton.innerHTML =
        '📍 <span class="location-text">' +
        'Current Location' +
        '</span>';
}

}


// ==========================
// OPEN LOCATION POPUP
// ==========================

if (locationButton && locationPopup) {

    locationButton.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            locationPopup.classList.toggle("show");

        }
    );

}


// ==========================
// CLOSE LOCATION POPUP
// ==========================

if (closeLocationPopup && locationPopup) {

    closeLocationPopup.addEventListener(
        "click",
        function() {

            locationPopup.classList.remove("show");

        }
    );

}


// ==========================
// LOCATION SEARCH
// ==========================

let locationSearchTimer = null;

if (manualLocationInput && locationSuggestions) {

    manualLocationInput.addEventListener(
        "input",
        function() {

            const query =
                manualLocationInput.value.trim();

            clearTimeout(locationSearchTimer);

            if (query.length < 3) {

                locationSuggestions.innerHTML = "";

                return;

            }

            locationSearchTimer =
                setTimeout(
                    async function() {

                        try {

                            const url =
                                "https://nominatim.openstreetmap.org/search" +
                                "?format=jsonv2" +
                                "&limit=5" +
                                "&countrycodes=in" +
                                "&q=" +
                                encodeURIComponent(query);


                            const response =
                                await fetch(url);


                            if (!response.ok) {

                                throw new Error(
                                    "Location search failed."
                                );

                            }


                            const results =
                                await response.json();


                            locationSuggestions.innerHTML =
                                "";


                            if (results.length === 0) {

                                locationSuggestions.innerHTML = `

                                    <div class="location-no-result">
                                        No locations found
                                    </div>

                                `;

                                return;

                            }


                            results.forEach(
                                function(result) {

                                    const suggestion =
                                        document.createElement(
                                            "button"
                                        );


                                    suggestion.type =
                                        "button";


                                    suggestion.className =
                                        "location-suggestion";


                                    suggestion.innerHTML = `

                                        <span class="location-suggestion-icon">
                                            📍
                                        </span>

                                        <span>
                                            ${result.display_name}
                                        </span>

                                    `;


                                    suggestion.addEventListener(
                                        "click",
                                        function(event) {

                                            event.preventDefault();

                                            event.stopPropagation();


                                            manualLocationInput.value =
                                                result.display_name;


                                            manualLocationInput.dataset.latitude =
                                                result.lat;


                                            manualLocationInput.dataset.longitude =
                                                result.lon;


                                            locationSuggestions.innerHTML =
                                                "";

                                        }
                                    );


                                    locationSuggestions.appendChild(
                                        suggestion
                                    );

                                }
                            );


                        }

                        catch (error) {

                            console.error(
                                "Location search error:",
                                error
                            );

                        }

                    },
                    700
                );

        }
    );

}


// ==========================
// CURRENT LOCATION
// ==========================

if (detectLocationBtn) {

    detectLocationBtn.addEventListener(
        "click",
        function() {

            if (!navigator.geolocation) {

                alert(
                    "Location detection is not supported by your browser."
                );

                return;

            }


            detectLocationBtn.textContent =
                "Detecting location...";


            navigator.geolocation.getCurrentPosition(

                function(position) {

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;


                    localStorage.setItem(
                        "review4you_user_location",
                        JSON.stringify({

                            type: "gps",

                            latitude: latitude,

                            longitude: longitude

                        })
                    );


if (locationButton) {
    locationButton.innerHTML =
        '📍 <span class="location-text">' +
        "Current Location" +
        '</span>';
}


                    if (locationPopup) {

                        locationPopup.classList.remove(
                            "show"
                        );

                    }


                    detectLocationBtn.textContent =
                        "📍 Use My Current Location";


                    alert(
                        "Your location was detected successfully!"
                    );

                },


function(error) {

    console.log("Location error code:", error.code);
    console.log("Location error message:", error.message);

    detectLocationBtn.textContent =
        "📍 Use My Current Location";

    alert(
        "Location error:\n\nCode: " +
        error.code +
        "\nMessage: " +
        error.message
    );

}

            );

        }
    );

}


// ==========================
// MANUAL LOCATION
// ==========================

if (
    saveManualLocationBtn &&
    manualLocationInput
) {

    saveManualLocationBtn.addEventListener(
        "click",
        async function() {

            const location =
                manualLocationInput.value.trim();


            const selectedLatitude =
                manualLocationInput.dataset.latitude;


            const selectedLongitude =
                manualLocationInput.dataset.longitude;


            if (location === "") {

                alert(
                    "Please enter your location."
                );

                return;

            }


            saveManualLocationBtn.textContent =
                "Finding location...";


            saveManualLocationBtn.disabled =
                true;


            try {

                let latitude;
                let longitude;


                // User selected a suggestion

                if (
                    selectedLatitude &&
                    selectedLongitude
                ) {

                    latitude =
                        Number(selectedLatitude);

                    longitude =
                        Number(selectedLongitude);

                }

                else {

                    // Search the typed location

                    const url =
                        "https://nominatim.openstreetmap.org/search" +
                        "?format=jsonv2" +
                        "&limit=1" +
                        "&countrycodes=in" +
                        "&q=" +
                        encodeURIComponent(location);


                    const response =
                        await fetch(url);


                    if (!response.ok) {

                        throw new Error(
                            "Location lookup failed."
                        );

                    }


                    const results =
                        await response.json();


                    if (results.length === 0) {

                        alert(
                            "Location not found. Please select a suggested location."
                        );

                        return;

                    }


                    latitude =
                        Number(results[0].lat);


                    longitude =
                        Number(results[0].lon);

                }


                localStorage.setItem(
                    "review4you_user_location",
                    JSON.stringify({

                        type: "manual",

                        location: location,

                        latitude: latitude,

                        longitude: longitude

                    })
                );


locationButton.innerHTML =
    '📍 <span class="location-text">' +
    location +
    '</span>';


                manualLocationInput.value =
                    "";


                delete manualLocationInput.dataset.latitude;

                delete manualLocationInput.dataset.longitude;


                locationSuggestions.innerHTML =
                    "";


                locationPopup.classList.remove(
                    "show"
                );


            }

            catch (error) {

                console.error(
                    "Manual location error:",
                    error
                );


                alert(
                    "Unable to find this location. Please try again."
                );

            }

            finally {

                saveManualLocationBtn.textContent =
                    "Use This Location";


                saveManualLocationBtn.disabled =
                    false;

            }

        }
    );

}


// ==========================
// CLOSE WHEN CLICKING OUTSIDE
// ==========================

document.addEventListener(
    "click",
    function(event) {

        if (
            locationPopup &&
            locationButton &&
            locationPopup.classList.contains("show") &&
            !locationPopup.contains(event.target) &&
            !locationButton.contains(event.target)
        ) {

            locationPopup.classList.remove(
                "show"
            );

        }

    }
);