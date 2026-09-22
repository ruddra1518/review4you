import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { auth } from "./firebase-config.js";


// ==========================
// FIRESTORE
// ==========================

const db = getFirestore();


// ==========================
// SAVED PLACES
// ==========================

const savedPlacesGrid =
    document.getElementById(
        "savedPlacesGrid"
    );


// ==========================
// LOAD PLACES FROM FIRESTORE
// ==========================

async function loadPlacesFromFirestore() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "places")
            );


        const firestorePlaces =
            snapshot.docs.map(
                function(docSnapshot) {

                    return {
                        id: docSnapshot.id,
                        ...docSnapshot.data()
                    };

                }
            );


        console.log(
            "Saved Places - places loaded:",
            firestorePlaces.length
        );


        return firestorePlaces;

    } catch (error) {

        console.error(
            "Could not load places:",
            error
        );

        savedPlacesGrid.innerHTML = `

            <div class="no-results">

                <h3>
                    Could not load places
                </h3>

                <p>
                    Please refresh the page and try again.
                </p>

            </div>

        `;

        return [];

    }

}


// ==========================
// CHECK FIREBASE LOGIN
// ==========================

onAuthStateChanged(
    auth,
    async function(user) {

        // ==========================
        // NOT LOGGED IN
        // ==========================

        if (!user) {

            savedPlacesGrid.innerHTML = `

                <div class="saved-login-card">

                    <div class="saved-login-icon">
                        ♡
                    </div>

                    <h3>
                        Please login first
                    </h3>

                    <p>
                        You need to login to view your saved places.
                    </p>

                    <a
                        href="../html/login.html"
                        class="saved-login-button"
                    >
                        👤 Go to Login →
                    </a>

                    <div class="saved-login-benefits">

                        <div>

                            <span>♡</span>

                            <strong>
                                Save favorites
                            </strong>

                            <p>
                                Keep the places you love
                            </p>

                        </div>


                        <div>

                            <span>▱</span>

                            <strong>
                                Access anytime
                            </strong>

                            <p>
                                Find them whenever you want
                            </p>

                        </div>


                        <div>

                            <span>▯</span>

                            <strong>
                                Across devices
                            </strong>

                            <p>
                                Your saved places stay with you
                            </p>

                        </div>

                    </div>

                </div>

            `;

            return;
        }


        // ==========================
        // GET SAVED PLACE IDS
        // ==========================

        const savedPlaceIds =
            JSON.parse(
                localStorage.getItem(
                    "review4you_saved_places"
                )
            ) || [];


        // ==========================
        // LOAD FIRESTORE PLACES
        // ==========================

        const places =
            await loadPlacesFromFirestore();


        // ==========================
        // FIND SAVED PLACES
        // ==========================

        const savedPlaces =
            places.filter(
                function(place) {

                    return savedPlaceIds.some(
                        function(savedId) {

                            return String(savedId) ===
                                String(place.id);

                        }
                    );

                }
            );


        console.log(
            "Saved place IDs:",
            savedPlaceIds
        );

        console.log(
            "Saved places found:",
            savedPlaces
        );


        // ==========================
        // EMPTY STATE
        // ==========================

        if (savedPlaces.length === 0) {

            savedPlacesGrid.innerHTML = `

                <div class="no-results">

                    <h3>
                        No saved places yet
                    </h3>

                    <p>
                        Places you save will appear here.
                    </p>

                    <a href="../index.html">
                        Explore Places →
                    </a>

                </div>

            `;

            return;
        }


        // Clear old content

        savedPlacesGrid.innerHTML = "";


        // ==========================
        // DISPLAY SAVED PLACES
        // ==========================

        savedPlaces.forEach(
            function(place) {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "place-card";


                const placeRating =
                    typeof getPlaceRating === "function"
                    ? getPlaceRating(place.id)
                    : {
                        rating: place.rating || 0,
                        reviews: place.reviews || 0
                    };


                card.innerHTML = `

                    <div
                        class="place-photo ${place.categoryClass || ""}"
                    >

                        <span class="photo-emoji">
                            ${place.emoji || "📍"}
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

                    </div>


                    <div class="place-content">

                        <div class="place-category">
                            ${place.category || ""}
                        </div>


                        <h3>
                            ${place.name || ""}
                        </h3>


                        <p class="place-location">
                            📍 ${place.distance || ""}
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
                                ₹ ${place.price || ""}
                            </span>

                        </div>


                        <div class="place-tags">

                            ${
                                (place.tags || [])
                                    .map(
                                        function(tag) {

                                            return `
                                                <span>
                                                    ${tag}
                                                </span>
                                            `;

                                        }
                                    )
                                    .join("")
                            }

                        </div>


                        <div class="place-footer">

                            <span>
                                ${place.lastChecked || ""}
                            </span>


                            <div>

                                <a
                                    href="../html/place.html?id=${place.id}"
                                >
                                    View details →
                                </a>


                                <button
                                    class="remove-saved"
                                    data-place-id="${place.id}"
                                >
                                    Remove
                                </button>

                            </div>

                        </div>

                    </div>

                `;


                savedPlacesGrid.appendChild(
                    card
                );

            }
        );


        // ==========================
        // REMOVE SAVED PLACE
        // ==========================

        document
            .querySelectorAll(".remove-saved")
            .forEach(
                function(button) {

                    button.addEventListener(
                        "click",
                        function() {

                            const placeId =
                                button.dataset.placeId;


                            const updatedSavedPlaceIds =
                                savedPlaceIds.filter(
                                    function(id) {

                                        return String(id) !==
                                            String(placeId);

                                    }
                                );


                            localStorage.setItem(
                                "review4you_saved_places",
                                JSON.stringify(
                                    updatedSavedPlaceIds
                                )
                            );


                            window.location.reload();

                        }
                    );

                }
            );

    }
);