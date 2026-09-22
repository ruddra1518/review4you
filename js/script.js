import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { auth } from "./firebase-config.js";

const db = getFirestore();

// ==========================
// LOAD PLACES FROM FIRESTORE
// ==========================

async function loadPlacesFromFirestore() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "places")
            );

        if (snapshot.empty) {

            console.log(
                "Firestore places collection is empty. Using local data."
            );

            return;
        }

        places = snapshot.docs.map(function(docSnapshot) {

            return {
                id: Number(docSnapshot.id),
                ...docSnapshot.data()
            };

        });

        console.log(
            "Places loaded from Firestore:",
            places.length
        );

        // Update filtered places after Firestore loads
        currentPlaces = [...places];

        renderPlaces(
            places.slice(0, 3)
        );

    } catch (error) {

        console.error(
            "Error loading places from Firestore:",
            error
        );

        console.log(
            "Using existing local places data."
        );
    }
}


// ==========================
// USER LOCATION
// ==========================

let userLocation = null;

const savedUserLocation =
    localStorage.getItem("review4you_user_location");

if (savedUserLocation) {

    userLocation =
        JSON.parse(savedUserLocation);

}
// ==========================
// ACCOUNT
// ==========================

const accountLink =
    document.getElementById("accountLink");

const accountMenu =
    document.getElementById("accountMenu");


if (accountLink && accountMenu) {

    onAuthStateChanged(auth, function(user) {

        // ==========================
        // NOT LOGGED IN
        // ==========================

        if (!user) {

            accountLink.textContent =
                "Login";

            accountLink.href =
                "html/login.html";

            accountMenu.style.display =
                "none";

            return;
        }


        // ==========================
        // LOGGED IN
        // ==========================

        const userName =
            user.displayName ||
            user.email?.split("@")[0] ||
            "User";

        const userEmail =
            user.email || "";


        // Mobile = first name
if (window.innerWidth <= 768) {
    accountLink.textContent =
        userName.trim().split(/\s+/)[0];
} else {
    accountLink.textContent =
         userName;
}


        accountLink.href = "#";


        // ==========================
        // ACCOUNT MENU
        // ==========================

        accountLink.addEventListener(
            "click",
            function(event) {

                event.preventDefault();


                accountMenu.innerHTML = `

                    <div>

                        <strong>
                            👤 ${userName}
                        </strong>

                        <p>
                            ${userEmail}
                        </p>

                        <hr>


                        <a
                            href="html/my-reviews.html"
                            id="myReviewsLink"
                        >
                            📝 My Reviews
                        </a>


                        <a
                            href="html/saved-places.html"
                            id="savedPlacesLink"
                        >
                            ❤️ Saved Places
                        </a>


                        <a
                            href="html/account.html"
                            id="accountSettingsLink"
                        >
                            ⚙️ Account Settings
                        </a>


                        <hr>


                        <button id="logoutBtn">
                            Logout
                        </button>

                    </div>

                `;


                // ==========================
                // TOGGLE ACCOUNT MENU
                // ==========================

                if (
                    accountMenu.dataset.open === "true"
                ) {

                    accountMenu.style.display =
                        "none";

                    accountMenu.dataset.open =
                        "false";

                } else {

                    accountMenu.style.display =
                        "block";

                    accountMenu.dataset.open =
                        "true";

                }


                // ==========================
                // LOGOUT
                // ==========================

                const logoutBtn =
                    document.getElementById("logoutBtn");


                logoutBtn.addEventListener(
                    "click",
                    async function() {

                        const confirmLogout =
                            confirm(
                                "Are you sure you want to logout?"
                            );


                        if (!confirmLogout) {
                            return;
                        }


                        try {

                            await signOut(auth);

                            window.location.href =
                                "html/login.html";

                        } catch (error) {

                            console.error(error);

                            alert(
                                "Could not logout. Please try again."
                            );

                        }

                    }
                );

            }
        );

    });

}
// ==========================
// CLOSE ACCOUNT MENU
// ==========================

document.addEventListener("click", function(event) {

    const accountMenu =
        document.getElementById("accountMenu");

    if (
        accountMenu &&
        !accountMenu.contains(event.target) &&
        !accountLink.contains(event.target)
    ) {
        accountMenu.style.display = "none";
        accountMenu.dataset.open = "false";
    }

});

// ==========================
// CURRENT FILTERED PLACES
// ==========================

let currentPlaces = [...places];

// ==========================
// USER REVIEWS
// ==========================

let firestoreReviews = [];

// ==========================
// CALCULATE USER RATING
// ==========================

function calculateUserRating(place) {

    const allReviews = [
        ...(defaultReviews[place.id] || []),
        ...firestoreReviews.filter(function(review) {
            return Number(review.placeId) === Number(place.id);
        })
    ];

    const validReviews =
        allReviews.filter(function(review) {

            const rating =
                Number(review.rating);

            return rating >= 1 && rating <= 5;

        });

    if (validReviews.length === 0) {

        return {
            rating: 0,
            reviews: 0
        };

    }

    let totalRating = 0;

    validReviews.forEach(function(review) {

        totalRating +=
            Number(review.rating);

    });

    const averageRating =
        totalRating /
        validReviews.length;

    return {

        rating:
            Number(
                averageRating.toFixed(1)
            ),

        reviews:
            validReviews.length

    };

}


// ==========================
// SAVED PLACES
// ==========================

let savedPlaceIds =
    JSON.parse(
        localStorage.getItem("review4you_saved_places")
    ) || [];


// ==========================
// PLACES
// ==========================

const placesGrid =
    document.getElementById("placesGrid");


// ==========================
// LOAD USER REVIEWS
// ==========================

async function loadReviewsFromFirestore() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "reviews")
            );

        firestoreReviews =
            snapshot.docs.map(function(docSnapshot) {

                return {
                    id: docSnapshot.id,
                    ...docSnapshot.data()
                };

            });

        console.log(
            "Homepage reviews loaded:",
            firestoreReviews.length
        );

    } catch (error) {

        console.error(
            "Error loading homepage reviews:",
            error
        );

        firestoreReviews = [];

    }

}


// ==========================
// RENDER PLACES
// ==========================

function renderPlaces(placeList) {


    placesGrid.innerHTML = "";

    placeList.forEach(function(place) {

        const card =
            document.createElement("article");

        card.className =
            "place-card";


const placeRating =
    calculateUserRating(place);


        card.innerHTML = `

            <div
                class="place-photo ${place.categoryClass}"
            >

                <span class="photo-emoji">
                    ${place.emoji}
                </span>


                ${
                    place.verified
                    ? `
                        <span class="verified-badge">
                            ✓ Verified
                        </span>
                    `
                    : ""
                }


                <button
                    class="favorite"
                    data-place-id="${place.id}"
                >
                    ${
                        savedPlaceIds.includes(place.id)
                        ? "♥"
                        : "♡"
                    }
                </button>

            </div>


            <div class="place-content">

                <div class="place-category">
                    ${place.category}
                </div>


                <h3>
                    ${place.name}
                </h3>


                    <p class="place-location">
                        📍 ${formatPlaceDistance(place)}
                    </p>


                <div class="place-rating">

                    <strong>
                        ★ ${placeRating.rating}
                    </strong>


                    <span>
                        (${placeRating.reviews} reviews)
                    </span>


                    <span class="dot">
                        •
                    </span>


                    <span class="price">
                        ₹ ${place.price}
                    </span>

                </div>


                <div class="place-tags">

                    ${
                        place.tags.map(
                            function(tag) {

                                return `
                                    <span>
                                        ${tag}
                                    </span>
                                `;

                            }
                        ).join("")
                    }

                </div>


                <div class="place-footer">

                    <span>
                        ${place.lastChecked}
                    </span>


                    <a
                        href="html/place.html?id=${place.id}"
                    >
                        View details →
                    </a>

                </div>

            </div>

        `;


        placesGrid.appendChild(card);

    });


    // ==========================
    // FAVORITES AFTER RENDER
    // ==========================

    document
        .querySelectorAll(".favorite")
        .forEach(
            function(button) {

                const placeId =
                    Number(button.dataset.placeId);


                button.addEventListener(
                    "click",
                    function() {

                        if (
                            savedPlaceIds.includes(placeId)
                        ) {

                            savedPlaceIds =
                                savedPlaceIds.filter(
                                    function(id) {
                                        return id !== placeId;
                                    }
                                );

                            button.textContent = "♡";

                        } else {

                            savedPlaceIds.push(placeId);

                            button.textContent = "♥";

                        }


                        localStorage.setItem(
                            "review4you_saved_places",
                            JSON.stringify(savedPlaceIds)
                        );

                    }
                );

            }
        );

}


renderPlaces(places.slice(0, 3));

loadReviewsFromFirestore().then(function() {

    renderPlaces(
        currentPlaces.slice(0, 3)
    );

});

loadPlacesFromFirestore();

// ==========================
// SEARCH
// ==========================

searchInput.addEventListener(
    "input",
    function() {

        const searchText =
            searchInput.value.toLowerCase().trim();


        placesGrid.innerHTML = "";


        const filteredPlaces =
            places.filter(function(place) {

                const name =
                    place.name.toLowerCase();

                const category =
                    place.category.toLowerCase();

                const address =
                    (place.address || "").toLowerCase();

                const tags =
                    (place.tags || [])
                    .join(" ")
                    .toLowerCase();


                return (
                    name.includes(searchText) ||
                    category.includes(searchText) ||
                    address.includes(searchText) ||
                    tags.includes(searchText)
                );

            });


        currentPlaces = filteredPlaces;

        if (
    sortPlaces.value !== "default"
) {
    sortPlaces.dispatchEvent(
        new Event("change")
    );

    return;
}


        // ==========================
        // NO SEARCH RESULTS
        // ==========================

        if (filteredPlaces.length === 0) {

            placesGrid.innerHTML = `
                <div class="no-results">
                    <h3>
                        No places found
                    </h3>

                    <p>
                        Try searching for another place, category, or service.
                    </p>
                </div>
            `;

            return;

        }


        filteredPlaces.forEach(function(place) {

            const card =
                document.createElement("article");


            card.className =
                "place-card";


const placeRating =
    calculateUserRating(place);



            card.innerHTML = `

                <div
                    class="place-photo ${place.categoryClass}"
                >

                    <span class="photo-emoji">
                        ${place.emoji}
                    </span>


                    ${
                        place.verified
                        ? `
                            <span class="verified-badge">
                                ✓ Verified
                            </span>
                        `
                        : ""
                    }


                    <button
                        class="favorite"
                        data-place-id="${place.id}"
                    >
                        ♡
                    </button>

                </div>


                <div class="place-content">

                    <div class="place-category">
                        ${place.category}
                    </div>


                    <h3>
                        ${place.name}
                    </h3>


                    <p class="place-location">
                        📍 ${formatPlaceDistance(place)}
                    </p>


                    <div class="place-rating">

                        <strong>
                            ★ ${placeRating.rating}
                        </strong>


                        <span>
                            (${placeRating.reviews} reviews)
                        </span>


                        <span class="dot">
                            •
                        </span>


                        <span class="price">
                            ₹ ${place.price}
                        </span>

                    </div>


                    <div class="place-tags">

                        ${
                            place.tags.map(
                                function(tag) {

                                    return `
                                        <span>
                                            ${tag}
                                        </span>
                                    `;

                                }
                            ).join("")
                        }

                    </div>


                    <div class="place-footer">

                        <span>
                            ${place.lastChecked}
                        </span>


                        <a
                            href="html/place.html?id=${place.id}"
                        >
                            View details →
                        </a>

                    </div>

                </div>

            `;


            placesGrid.appendChild(card);

        });


        // ==========================
        // FAVORITES AFTER SEARCH
        // ==========================

        document.querySelectorAll(".favorite").forEach(
            function(button) {

                const placeId =
                    Number(button.dataset.placeId);


                if (
                    savedPlaceIds.includes(placeId)
                ) {

                    button.textContent = "♥";

                }


                button.addEventListener(
                    "click",
                    function() {

                        if (
                            savedPlaceIds.includes(placeId)
                        ) {

                            savedPlaceIds =
                                savedPlaceIds.filter(
                                    function(id) {

                                        return id !== placeId;

                                    }
                                );

                            button.textContent = "♡";

                        } else {

                            savedPlaceIds.push(
                                placeId
                            );

                            button.textContent = "♥";

                        }


                        localStorage.setItem(
                            "review4you_saved_places",
                            JSON.stringify(savedPlaceIds)
                        );

                    }
                );

            }
        );

    }
);

// ==========================
// SEARCH BUTTON
// ==========================

const searchButton =
    document.getElementById("searchButton");

searchButton.addEventListener(
    "click",
    function() {

        searchInput.dispatchEvent(
            new Event("input")
        );

        document
            .getElementById("recommended")
            .scrollIntoView({
                behavior: "smooth"
            });

    }
);

// ==========================
// POPULAR SEARCHES
// ==========================

document.querySelectorAll(
    ".popular-search"
).forEach(function(link) {

    link.addEventListener(
        "click",
        function(event) {

            event.preventDefault();


            const searchText =
                link.dataset.search;


            searchInput.value =
                searchText;


            searchInput.dispatchEvent(
                new Event("input")
            );


            document
                .getElementById("recommended")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );

});

// ==========================
// SEARCH WITH ENTER
// ==========================

searchInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            searchButton.click();

        }

    }
);

// ==========================
// CATEGORY SEARCH
// ==========================

document.querySelectorAll(
    ".category-card"
).forEach(function(categoryCard) {

    categoryCard.addEventListener(
        "click",
        function(event) {

            event.preventDefault();


            const category =
                categoryCard.dataset.category;


            searchInput.value =
                category;


            searchInput.dispatchEvent(
                new Event("input")
            );


            document
                .getElementById("recommended")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );

});


// ==========================
// VIEW ALL PLACES
// ==========================

const viewAllPlaces =
    document.getElementById("viewAllPlaces");

viewAllPlaces.addEventListener(
    "click",
    function(event) {

        event.preventDefault();


        searchInput.value = "";
        sortPlaces.value = "default";


        searchInput.dispatchEvent(
            new Event("input")
        );


        document
            .getElementById("recommended")
            .scrollIntoView({
                behavior: "smooth"
            });

    }
);

// ==========================
// SORT PLACES
// ==========================

const sortPlaces =
    document.getElementById("sortPlaces");

sortPlaces.addEventListener(
    "change",
    function() {

        const sortValue =
            sortPlaces.value;


        if (sortValue === "default") {

            searchInput.dispatchEvent(
                new Event("input")
            );

            return;
        }


        let sortedPlaces =
            [...currentPlaces];


        if (sortValue === "rating") {

sortedPlaces.sort(
    function(a, b) {

        const ratingA =
            calculateUserRating(a).rating;

        const ratingB =
            calculateUserRating(b).rating;

        return ratingB - ratingA;

    }
);

        }


        if (sortValue === "price") {

            const priceOrder = {
                "Budget": 1,
                "Affordable": 2,
                "Moderate": 3,
                "Expensive": 4
            };


            sortedPlaces.sort(
                function(a, b) {

                    return (
                        (priceOrder[a.price] || 99) -
                        (priceOrder[b.price] || 99)
                    );

                }
            );

        }


        if (sortValue === "recent") {

            function getDays(place) {

                const text =
                    place.lastChecked.toLowerCase();


                if (text.includes("today")) {
                    return 0;
                }


                const match =
                    text.match(/(\d+)\s+day/);


                if (match) {
                    return Number(match[1]);
                }


                if (text.includes("week")) {
                    return 7;
                }


                if (text.includes("month")) {
                    return 30;
                }


                return 999;

            }


            sortedPlaces.sort(
                function(a, b) {

                    return getDays(a) - getDays(b);

                }
            );

        }
        // NEAREST FIRST

    if (sortValue === "distance") {

        function getDistance(place) {

            const distance = getPlaceDistance(place);

            if (distance === null) {
                return Infinity;
            }

            return distance;
        }

        sortedPlaces.sort(function(a, b) {
            return getDistance(a) - getDistance(b);
        });
    }

        renderPlaces(sortedPlaces);

    });

// ==========================
// LOCATION
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
// LOCATION SEARCH SUGGESTIONS
// ==========================

let locationSearchTimer = null;

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
            setTimeout(async function() {

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

                    locationSuggestions.innerHTML = "";

                    if (results.length === 0) {

                        locationSuggestions.innerHTML = `
                            <div class="location-no-result">
                                No locations found
                            </div>
                        `;

                        return;
                    }

                    results.forEach(function(result) {

                        const suggestion =
                            document.createElement("button");

                        suggestion.type = "button";

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

                    });

                } catch (error) {

                    console.error(
                        "Location search error:",
                        error
                    );

                }

            }, 700);

    }
);


// ==========================
// RESTORE SAVED LOCATION
// ==========================

if (userLocation) {

    if (userLocation.type === "manual") {

        if (window.innerWidth <= 768) {
            locationButton.textContent =
                "📍 " + userLocation.location.split(",")[0].trim();
        } else {
            locationButton.textContent =
                "📍 " + userLocation.location;
        }

} else if (userLocation.type === "gps") {

    if (window.innerWidth <= 768) {
        locationButton.textContent =
            "📍 Current";
    } else {
        locationButton.textContent =
            "📍 Current Location";
    }
}
}


// OPEN LOCATION POPUP

locationButton.addEventListener("click", function() {

    locationPopup.classList.toggle("show");

});


// CLOSE LOCATION POPUP

closeLocationPopup.addEventListener("click", function() {

    locationPopup.classList.remove("show");

});


// AUTO DETECT LOCATION

detectLocationBtn.addEventListener("click", function() {

    if (!navigator.geolocation) {

        alert("Location detection is not supported by your browser.");

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

            locationButton.textContent =
                "📍 Current Location";

            locationPopup.classList.remove("show");

            detectLocationBtn.textContent =
                "📍 Use My Current Location";

            alert("Your location was detected successfully!");

        },

        function(error) {

            detectLocationBtn.textContent =
                "📍 Use My Current Location";

            alert(
                "Unable to detect your location. Please allow location access or enter it manually."
            );

        }

    );

});


// MANUAL LOCATION

saveManualLocationBtn.addEventListener("click", async function() {

    const location =
        manualLocationInput.value.trim();
    const selectedLatitude =
        manualLocationInput.dataset.latitude;

    const selectedLongitude =
        manualLocationInput.dataset.longitude;

    if (location === "") {
        alert("Please enter your location.");
        return;
    }

    saveManualLocationBtn.textContent =
        "Finding location...";

    saveManualLocationBtn.disabled = true;

    try {

let latitude;
let longitude;

if (
    selectedLatitude &&
    selectedLongitude
) {

    // User selected a location suggestion
    latitude =
        Number(selectedLatitude);

    longitude =
        Number(selectedLongitude);

} else {

    // User typed a location without selecting a suggestion
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
            "Location search failed."
        );
    }

    const results =
        await response.json();

    if (results.length === 0) {

        alert(
            "Location not found. Please try a more specific location."
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

        userLocation = {
            type: "manual",
            location: location,
            latitude: latitude,
            longitude: longitude
        };

        locationButton.textContent =
    "📍 " + location.split(",")[0].trim();

        manualLocationInput.value = "";

        locationPopup.classList.remove("show");

        alert(
            "Location set successfully!"
        );

        renderPlaces(currentPlaces.slice(0, 3));

    } catch (error) {

        console.error(error);

        alert(
            "Unable to find this location. Please try again."
        );

    } finally {

        saveManualLocationBtn.textContent =
            "Use This Location";

        saveManualLocationBtn.disabled =
            false;
    }
});

// CLOSE LOCATION POPUP WHEN CLICKING OUTSIDE

document.addEventListener("click", function(event) {

    if (
        locationPopup.classList.contains("show") &&
        !locationPopup.contains(event.target) &&
        !locationButton.contains(event.target)
    ) {
        locationPopup.classList.remove("show");
    }

});

// ==========================
// DISTANCE CALCULATION
// ==========================

function calculateDistance(
    userLatitude,
    userLongitude,
    placeLatitude,
    placeLongitude
) {

    const earthRadius = 6371;

    const latitudeDifference =
        (placeLatitude - userLatitude) *
        Math.PI / 180;

    const longitudeDifference =
        (placeLongitude - userLongitude) *
        Math.PI / 180;

    const userLatitudeRadians =
        userLatitude * Math.PI / 180;

    const placeLatitudeRadians =
        placeLatitude * Math.PI / 180;


    const a =
        Math.sin(latitudeDifference / 2) *
        Math.sin(latitudeDifference / 2) +

        Math.cos(userLatitudeRadians) *
        Math.cos(placeLatitudeRadians) *

        Math.sin(longitudeDifference / 2) *
        Math.sin(longitudeDifference / 2);


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    const distance =
        earthRadius * c;


    return distance;
}

function getPlaceDistance(place) {

    if (
        !userLocation ||
        userLocation.latitude === undefined ||
        userLocation.longitude === undefined ||
        place.latitude === null ||
        place.longitude === null ||
        place.latitude === undefined ||
        place.longitude === undefined
    ) {
        return null;
    }

    return calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        place.latitude,
        place.longitude
    );
}

function formatPlaceDistance(place) {

    const distance = getPlaceDistance(place);

    if (distance === null) {
        return "Distance unavailable";
    }

    if (distance < 1) {
        return Math.round(distance * 1000) + " m away";
    }

    return distance.toFixed(1) + " km away";
}