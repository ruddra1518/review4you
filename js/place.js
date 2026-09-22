import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { auth } from "./firebase-config.js";

const db = getFirestore();


// ==========================
// BASIC ELEMENTS
// ==========================

const placeDetails =
    document.getElementById("placeDetails");

const accountLink =
    document.getElementById("accountLink");

const accountMenu =
    document.getElementById("accountMenu");


// ==========================
// FIREBASE USER
// ==========================

let firebaseUser = null;


// ==========================
// FIRESTORE REVIEWS
// ==========================

let firestoreReviews = [];


// ==========================
// GET PLACE ID FROM URL
// ==========================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const placeId =
    Number(
        urlParams.get("id")
    );

// ==========================
// CHECK EDIT REVIEW FROM URL
// ==========================

const editReviewId =
    urlParams.get("editReview");

// ==========================
// LOAD PLACES FROM FIRESTORE
// ==========================

try {

    const snapshot =
        await getDocs(
            collection(db, "places")
        );

    if (!snapshot.empty) {

        places =
            snapshot.docs.map(
                function(docSnapshot) {

                    return {
                        id: Number(docSnapshot.id),
                        ...docSnapshot.data()
                    };

                }
            );

        console.log(
            "Place page loaded places from Firestore:",
            places.length
        );

    }

} catch (error) {

    console.error(
        "Could not load places from Firestore:",
        error
    );

    console.log(
        "Using existing local places data."
    );

}


// ==========================
// FIND PLACE
// ==========================

const place =
    places.find(
        function(place) {

            return place.id === placeId;

        }
    );


// ==========================
// PLACE NOT FOUND
// ==========================

if (!place) {

    placeDetails.innerHTML = `

        <div class="place-details-card">

            <div class="place-details-content">

                <h1>
                    Place not found
                </h1>

                <p>
                    Sorry, we couldn't find this place.
                </p>

                <a
                    href="../index.html"
                    class="back-link"
                >
                    ← Back to Home
                </a>

            </div>

        </div>

    `;

}


// ==========================
// PLACE FOUND
// ==========================

else {

// ==========================
// USER REVIEW RATING
// ==========================

let placeRating = {
    rating: 0,
    reviews: 0
};


    // ==========================
    // GET ALL REVIEWS
    // ==========================

    function getAllReviews() {

        return [

            ...(defaultReviews[place.id] || []),

            ...firestoreReviews

        ];

    }

// ==========================
// CALCULATE USER RATING
// ==========================

function calculateUserRating() {

    const allReviews =
        getAllReviews();

    if (allReviews.length === 0) {

        return {
            rating: 0,
            reviews: 0
        };

    }

    let totalRating = 0;

    allReviews.forEach(
        function(review) {

            totalRating +=
                Number(review.rating) || 0;

        }
    );

    const averageRating =
        totalRating /
        allReviews.length;

    return {

        rating:
            Number(
                averageRating.toFixed(1)
            ),

        reviews:
            allReviews.length

    };

}


    // ==========================
    // GET RATING COUNT
    // ==========================

    function getRatingCount(rating) {

        const allReviews =
            getAllReviews();

        return allReviews.filter(
            function(review) {

                return Number(review.rating) === rating;

            }
        ).length;

    }


    // ==========================
    // GET RATING PERCENTAGE
    // ==========================

    function getRatingPercentage(rating) {

        const allReviews =
            getAllReviews();

        const totalReviews =
            allReviews.length;

        if (totalReviews === 0) {

            return 0;

        }

        return Math.round(

            getRatingCount(rating)
            / totalReviews
            * 100

        );

    }

    // ==========================
// DISTANCE CALCULATION
// ==========================

let userLocation = null;

try {
    const savedLocation =
        localStorage.getItem(
            "review4you_user_location"
        );

    if (savedLocation) {
        userLocation =
            JSON.parse(savedLocation);
    }

} catch (error) {
    console.error(
        "Could not load saved location:",
        error
    );
}


function calculateDistance(
    userLatitude,
    userLongitude,
    placeLatitude,
    placeLongitude
) {

    const earthRadius = 6371;

    const latitudeDifference =
        (placeLatitude - userLatitude)
        * Math.PI / 180;

    const longitudeDifference =
        (placeLongitude - userLongitude)
        * Math.PI / 180;

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

    return earthRadius * c;
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
        Number(userLocation.latitude),
        Number(userLocation.longitude),
        Number(place.latitude),
        Number(place.longitude)
    );
}


function formatPlaceDistance(place) {

    const distance =
        getPlaceDistance(place);

    if (distance === null) {
        return "Distance unavailable";
    }

    if (distance < 1) {
        return (
            Math.round(distance * 1000)
            + " m away"
        );
    }

    return (
        distance.toFixed(1)
        + " km away"
    );
}


const placeDistance =
    formatPlaceDistance(place);


// ==========================
// CALCULATE USER RATING
// ==========================

placeRating =
    calculateUserRating();


// ==========================
// SHOW PLACE
// ==========================

    placeDetails.innerHTML = `

        <div class="place-details-card">

            <div
                class="
                    place-details-photo
                    ${place.categoryClass}
                "
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

            </div>


            <div class="place-details-content">

                <div class="place-details-category">
                    ${place.category}
                </div>


                <h1>
                    ${place.name}
                </h1>


                <div class="place-details-rating">

                    <strong>
                        ★ ${placeRating.rating}
                    </strong>

                    <span>
                        (${placeRating.reviews} reviews)
                    </span>

                    <span class="dot">
                        •
                    </span>

                    <span>
                        ₹ ${place.price || "Affordable"}
                    </span>

                </div>


                <div class="place-details-info">

                    <p>
                        📍 ${place.address || "Address not added"}
                    </p>
                    ${
    place.description
        ? `
            <div class="place-description">
                <h3>About this place</h3>

                <p>
                    ${place.description}
                </p>
            </div>
        `
        : ""
}

                    ${
                        place.latitude !== null &&
                        place.latitude !== undefined &&
                        place.longitude !== null &&
                        place.longitude !== undefined
                        ? `
                            <button
                                type="button"
                                id="openGoogleMapsBtn"
                                class="maps-button"
                            >
                                📍 Open in Google Maps
                            </button>
                        `
                        : ""
                    }


                    <p>
    📏 ${placeDistance}
</p>


                    <p>
                        🕒 ${place.lastChecked || "Recently added"}
                    </p>

                </div>


                <div class="place-details-tags">

                    ${
                        place.tags
                        ? place.tags.map(
                            function(tag) {

                                return `
                                    <span>
                                        ${tag}
                                    </span>
                                `;

                            }
                        ).join("")
                        : ""
                    }

                </div>


                <div class="place-details-footer">

                    <a
                        href="../index.html"
                        class="back-link"
                    >
                        ← Back to places
                    </a>


                    <button
                        class="favorite-details"
                        id="favoriteButton"
                    >
                        ♡
                    </button>

                </div>


                <!-- REVIEWS -->

                <div class="reviews-section">

                    <h2>
                        Customer Reviews
                    </h2>


                    <div class="review-summary">

                        <div class="review-summary-score">

                            <strong>
                                ★ ${placeRating.rating}
                            </strong>

                            <span>
                                ${placeRating.reviews} reviews
                            </span>

                        </div>


                        <div class="review-summary-stars">

                            <div class="rating-row">

                                <span class="rating-label">
                                    ★★★★★
                                </span>

                                <div class="rating-bar">

                                    <div
                                        class="rating-bar-fill"
                                        style="
                                            width: ${getRatingPercentage(5)}%;
                                        "
                                    ></div>

                                </div>

                                <span class="rating-count">
                                    ${getRatingCount(5)}
                                    (${getRatingPercentage(5)}%)
                                </span>

                            </div>


                            <div class="rating-row">

                                <span class="rating-label">
                                    ★★★★☆
                                </span>

                                <div class="rating-bar">

                                    <div
                                        class="rating-bar-fill"
                                        style="
                                            width: ${getRatingPercentage(4)}%;
                                        "
                                    ></div>

                                </div>

                                <span class="rating-count">
                                    ${getRatingCount(4)}
                                    (${getRatingPercentage(4)}%)
                                </span>

                            </div>


                            <div class="rating-row">

                                <span class="rating-label">
                                    ★★★☆☆
                                </span>

                                <div class="rating-bar">

                                    <div
                                        class="rating-bar-fill"
                                        style="
                                            width: ${getRatingPercentage(3)}%;
                                        "
                                    ></div>

                                </div>

                                <span class="rating-count">
                                    ${getRatingCount(3)}
                                    (${getRatingPercentage(3)}%)
                                </span>

                            </div>


                            <div class="rating-row">

                                <span class="rating-label">
                                    ★★☆☆☆
                                </span>

                                <div class="rating-bar">

                                    <div
                                        class="rating-bar-fill"
                                        style="
                                            width: ${getRatingPercentage(2)}%;
                                        "
                                    ></div>

                                </div>

                                <span class="rating-count">
                                    ${getRatingCount(2)}
                                    (${getRatingPercentage(2)}%)
                                </span>

                            </div>


                            <div class="rating-row">

                                <span class="rating-label">
                                    ★☆☆☆☆
                                </span>

                                <div class="rating-bar">

                                    <div
                                        class="rating-bar-fill"
                                        style="
                                            width: ${getRatingPercentage(1)}%;
                                        "
                                    ></div>

                                </div>

                                <span class="rating-count">
                                    ${getRatingCount(1)}
                                    (${getRatingPercentage(1)}%)
                                </span>

                            </div>

                        </div>

                    </div>


                    <div id="reviewsList"></div>


                    <!-- WRITE REVIEW -->

                    <div class="write-review">

                        <h3>
                            Write a Review
                        </h3>


                        <div class="form-group">

                            <label>
                                Your Name
                            </label>

                            <input
                                type="text"
                                id="reviewName"
                                readonly
                            >

                        </div>


                        <div class="form-group">

                            <label for="reviewRating">
                                Rating
                            </label>

                            <select id="reviewRating">

                                <option value="">
                                    Select rating
                                </option>

                                <option value="5">
                                    ★★★★★ — 5
                                </option>

                                <option value="4">
                                    ★★★★☆ — 4
                                </option>

                                <option value="3">
                                    ★★★☆☆ — 3
                                </option>

                                <option value="2">
                                    ★★☆☆☆ — 2
                                </option>

                                <option value="1">
                                    ★☆☆☆☆ — 1
                                </option>

                            </select>

                        </div>


                        <div class="form-group">

                            <label for="reviewText">
                                Your Review
                            </label>

                            <textarea
                                id="reviewText"
                                rows="4"
                                placeholder="Share your experience..."
                            ></textarea>

                        </div>


                        <button
                            type="button"
                            id="submitReviewBtn"
                        >
                            Submit Review
                        </button>

                    </div>

                </div>

            </div>

        </div>

    `;


    // ==========================
    // GOOGLE MAPS
    // ==========================

    const openGoogleMapsBtn =
        document.getElementById(
            "openGoogleMapsBtn"
        );


    if (openGoogleMapsBtn) {

        openGoogleMapsBtn.addEventListener(
            "click",
            function() {

                const googleMapsUrl =
                    "https://www.google.com/maps/search/?api=1&query="
                    + place.latitude
                    + ","
                    + place.longitude;


                window.open(
                    googleMapsUrl,
                    "_blank"
                );

            }
        );

    }


    // ==========================
    // FAVORITE BUTTON
    // ==========================

    const favoriteButton =
        document.getElementById(
            "favoriteButton"
        );


    let savedPlaceIds =
        JSON.parse(
            localStorage.getItem(
                "review4you_saved_places"
            )
        ) || [];


    function updateFavoriteButton() {

        if (
            savedPlaceIds.includes(place.id)
        ) {

            favoriteButton.textContent =
                "♥";

        } else {

            favoriteButton.textContent =
                "♡";

        }

    }


    updateFavoriteButton();


    favoriteButton.addEventListener(
        "click",
        function() {

            if (
                savedPlaceIds.includes(place.id)
            ) {

                savedPlaceIds =
                    savedPlaceIds.filter(
                        function(id) {

                            return id !== place.id;

                        }
                    );

            } else {

                savedPlaceIds.push(
                    place.id
                );

            }


            localStorage.setItem(
                "review4you_saved_places",
                JSON.stringify(
                    savedPlaceIds
                )
            );


            updateFavoriteButton();

        }
    );


    // ==========================
    // LOAD REVIEWS FROM FIRESTORE
    // ==========================

    async function loadReviewsFromFirestore() {

        try {

            const snapshot =
                await getDocs(
                    collection(db, "reviews")
                );


            firestoreReviews =
                snapshot.docs
                    .map(
                        function(docSnapshot) {

                            return {
                                id: docSnapshot.id,
                                ...docSnapshot.data()
                            };

                        }
                    )
                    .filter(
                        function(review) {

                            return (
                                Number(review.placeId) ===
                                place.id
                            );

                        }
                    );


            console.log(
    "Reviews loaded from Firestore:",
    firestoreReviews.length
);


// ==========================
// OPEN REVIEW EDIT MODE
// FROM URL
// ==========================

function openReviewEditMode() {

    if (!editReviewId) {
        return;
    }


    if (!firebaseUser) {
        return;
    }


    const existingReview =
        firestoreReviews.find(
            function(review) {

                return (
                    review.id === editReviewId
                    &&
                    review.userId === firebaseUser.uid
                );

            }
        );


    if (!existingReview) {

        console.log(
            "Edit review not found:",
            editReviewId
        );

        return;
    }


    // ==========================
    // FILL RATING
    // ==========================

    const reviewRating =
        document.getElementById(
            "reviewRating"
        );


    if (reviewRating) {

        reviewRating.value =
            existingReview.rating;

    }


    // ==========================
    // FILL REVIEW TEXT
    // ==========================

    const reviewText =
        document.getElementById(
            "reviewText"
        );


    if (reviewText) {

        reviewText.value =
            existingReview.text;

    }


    // ==========================
    // CHANGE BUTTON
    // ==========================

    const submitReviewBtn =
        document.getElementById(
            "submitReviewBtn"
        );


    if (submitReviewBtn) {

        submitReviewBtn.textContent =
            "Update Review";


        submitReviewBtn.dataset.editingReviewId =
            existingReview.id;

    }


    // ==========================
    // SCROLL TO REVIEW FORM
    // ==========================

    const writeReview =
        document.querySelector(
            ".write-review"
        );


    if (writeReview) {

        setTimeout(
            function() {

                writeReview.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            },
            300
        );

    }

}


// ==========================
// UPDATE USER RATING
// ==========================

placeRating =
    calculateUserRating();


// ==========================
// UPDATE HEADER RATING
// ==========================

const headerRating =
    document.querySelector(
        ".place-details-rating strong"
    );

const headerReviewCount =
    document.querySelector(
        ".place-details-rating span"
    );

if (headerRating) {

    headerRating.textContent =
        "★ " + placeRating.rating;

}

if (headerReviewCount) {

    headerReviewCount.textContent =
        "(" +
        placeRating.reviews +
        " reviews)";

}


renderReviews();

updateReviewSummary();

openReviewEditMode();

        } catch (error) {

            console.error(
                "Could not load reviews from Firestore:",
                error
            );

firestoreReviews = [];

placeRating =
    calculateUserRating();

const headerRating =
    document.querySelector(
        ".place-details-rating strong"
    );

const headerReviewCount =
    document.querySelector(
        ".place-details-rating span"
    );

if (headerRating) {

    headerRating.textContent =
        "★ " + placeRating.rating;

}

if (headerReviewCount) {

    headerReviewCount.textContent =
        "(" +
        placeRating.reviews +
        " reviews)";

}

renderReviews();

updateReviewSummary();

        }

    }


    // ==========================
    // RENDER REVIEWS
    // ==========================

    function renderReviews() {

        const reviewsList =
            document.getElementById(
                "reviewsList"
            );


        const placeReviews = [

            ...(defaultReviews[place.id] || []),

            ...firestoreReviews

        ];


        reviewsList.innerHTML = "";


        if (placeReviews.length === 0) {

            reviewsList.innerHTML = `

                <p>
                    No reviews yet. Be the first to review this place!
                </p>

            `;

            return;

        }


        placeReviews.forEach(
            function(review) {

                const reviewCard =
                    document.createElement(
                        "div"
                    );


                reviewCard.className =
                    "review-card";


                let editButton = "";


                /*
                    Only show Edit button for
                    the currently logged-in user's
                    Firestore review.
                */

                if (
                    firebaseUser &&
                    review.userId === firebaseUser.uid
                ) {

                    editButton = `

                        <button
                            class="edit-review-btn"
                            data-review-id="${review.id}"
                        >
                            ✏️ Edit Review
                        </button>

                    `;

                }


                let deleteButton = "";


                /*
                    Only show Delete button for
                    the currently logged-in user's
                    Firestore review.
                */

                if (
                    firebaseUser &&
                    review.userId === firebaseUser.uid
                ) {

                    deleteButton = `

                        <button
                            class="delete-review-btn"
                            data-review-id="${review.id}"
                        >
                            🗑️ Delete Review
                        </button>

                    `;

                }


                reviewCard.innerHTML = `

                    <div class="review-header">

                        <strong>
                            ${review.user}
                        </strong>

                        <span>
                            ${review.date}
                        </span>

                    </div>


                    <div class="review-rating">

                        ${"★".repeat(
                            Number(review.rating)
                        )}

                        ${"☆".repeat(
                            5 - Number(review.rating)
                        )}

                    </div>


                    <p>
                        ${review.text}
                    </p>


                    ${editButton}

                    ${deleteButton}

                `;


                reviewsList.appendChild(
                    reviewCard
                );

            }
        );


        attachReviewButtons();

    }


    // ==========================
    // UPDATE REVIEW SUMMARY
    // ==========================

    function updateReviewSummary() {

        const allReviews =
            getAllReviews();


        const totalReviews =
            allReviews.length;


        const summaryScore =
            document.querySelector(
                ".review-summary-score strong"
            );


        const summaryCount =
            document.querySelector(
                ".review-summary-score span"
            );


        if (summaryScore) {

            summaryScore.textContent =
                "★ " + placeRating.rating;

        }


        if (summaryCount) {

            summaryCount.textContent =
                totalReviews + " reviews";

        }


        const ratingRows =
            document.querySelectorAll(
                ".review-summary-stars .rating-row"
            );


        ratingRows.forEach(
            function(row, index) {

                const rating =
                    5 - index;


                const count =
                    allReviews.filter(
                        function(review) {

                            return (
                                Number(review.rating) ===
                                rating
                            );

                        }
                    ).length;


                const percentage =
                    totalReviews === 0
                    ? 0
                    : Math.round(
                        count /
                        totalReviews *
                        100
                    );


                const fill =
                    row.querySelector(
                        ".rating-bar-fill"
                    );


                const countText =
                    row.querySelector(
                        ".rating-count"
                    );


                if (fill) {

                    fill.style.width =
                        percentage + "%";

                }


                if (countText) {

                    countText.textContent =
                        count
                        + " ("
                        + percentage
                        + "%)";

                }

            }
        );

    }


    // ==========================
    // EDIT / DELETE BUTTONS
    // ==========================

    function attachReviewButtons() {

        // ==========================
        // EDIT BUTTON
        // ==========================

        document.querySelectorAll(
            ".edit-review-btn"
        ).forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        if (!firebaseUser) {

                            alert(
                                "Please login first."
                            );

                            return;

                        }


                        const reviewId =
                            button.dataset.reviewId;


                        const existingReview =
                            firestoreReviews.find(
                                function(review) {

                                    return (
                                        review.id ===
                                        reviewId
                                        &&
                                        review.userId ===
                                        firebaseUser.uid
                                    );

                                }
                            );


                        if (!existingReview) {

                            alert(
                                "Review not found."
                            );

                            return;

                        }


                        document.getElementById(
                            "reviewRating"
                        ).value =
                            existingReview.rating;


                        document.getElementById(
                            "reviewText"
                        ).value =
                            existingReview.text;


                        const submitReviewBtn =
                            document.getElementById(
                                "submitReviewBtn"
                            );


                        submitReviewBtn.textContent =
                            "Update Review";


                        submitReviewBtn.dataset.editingReviewId =
                            reviewId;


                        document.querySelector(
                            ".write-review"
                        ).scrollIntoView({
                            behavior: "smooth"
                        });

                    }
                );

            }
        );


        // ==========================
        // DELETE BUTTON
        // ==========================

        document.querySelectorAll(
            ".delete-review-btn"
        ).forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    async function() {

                        if (!firebaseUser) {

                            alert(
                                "Please login first."
                            );

                            return;

                        }


                        const reviewId =
                            button.dataset.reviewId;


                        const existingReview =
                            firestoreReviews.find(
                                function(review) {

                                    return (
                                        review.id ===
                                        reviewId
                                        &&
                                        review.userId ===
                                        firebaseUser.uid
                                    );

                                }
                            );


                        if (!existingReview) {

                            alert(
                                "Review not found."
                            );

                            return;

                        }


                        const confirmDelete =
                            confirm(
                                "Are you sure you want to delete your review?"
                            );


                        if (!confirmDelete) {

                            return;

                        }


                        try {

                            await deleteDoc(
                                doc(
                                    db,
                                    "reviews",
                                    reviewId
                                )
                            );


                            firestoreReviews =
                                firestoreReviews.filter(
                                    function(review) {

                                        return (
                                            review.id !==
                                            reviewId
                                        );

                                    }
                                );


                            alert(
                                "Review deleted successfully!"
                            );


                            window.location.reload();

                        } catch (error) {

                            console.error(
                                "Could not delete review:",
                                error
                            );


                            alert(
                                "Could not delete your review. Please try again."
                            );

                        }

                    }
                );

            }
        );

    }


    // ==========================
    // REVIEW NAME
    // ==========================

    const reviewNameInput =
        document.getElementById(
            "reviewName"
        );


    // ==========================
    // SUBMIT REVIEW
    // ==========================

    const submitReviewBtn =
        document.getElementById(
            "submitReviewBtn"
        );


    submitReviewBtn.addEventListener(
        "click",
        async function() {

            // ==========================
            // LOGIN CHECK
            // ==========================

            if (!firebaseUser) {

                alert(
                    "Please login before writing a review."
                );


                window.location.href =
                    "../html/login.html";


                return;

            }


            // ==========================
            // CURRENT USER
            // ==========================

            const user = {

                id:
                    firebaseUser.uid,

                name:
                    firebaseUser.displayName
                    ||
                    firebaseUser.email?.split("@")[0]
                    ||
                    "User",

                email:
                    firebaseUser.email
                    ||
                    ""

            };


            // ==========================
            // GET RATING
            // ==========================

            const rating =
                Number(
                    document.getElementById(
                        "reviewRating"
                    ).value
                );


            // ==========================
            // GET REVIEW TEXT
            // ==========================

            const text =
                document.getElementById(
                    "reviewText"
                ).value.trim();


            // ==========================
            // VALIDATE RATING
            // ==========================

            if (!rating) {

                alert(
                    "Please select a rating."
                );

                return;

            }


            // ==========================
            // VALIDATE TEXT
            // ==========================

            if (text === "") {

                alert(
                    "Please write your review."
                );

                return;

            }


            // ==========================
            // CHECK EDIT MODE
            // ==========================

            const editingReviewId =
                submitReviewBtn.dataset.editingReviewId
                ||
                "";


            // ==========================
            // UPDATE EXISTING REVIEW
            // ==========================

            if (editingReviewId) {

                const reviewToEdit =
                    firestoreReviews.find(
                        function(review) {

                            return (
                                review.id ===
                                editingReviewId
                                &&
                                review.userId ===
                                user.id
                            );

                        }
                    );


                if (!reviewToEdit) {

                    alert(
                        "Review not found."
                    );

                    return;

                }


                try {

                    await updateDoc(
                        doc(
                            db,
                            "reviews",
                            editingReviewId
                        ),
                        {

                            rating:
                                rating,

                            text:
                                text,

                            date:
                                "Just now"

                        }
                    );


                    alert(
                        "Review updated successfully!"
                    );


                    delete submitReviewBtn.dataset.editingReviewId;


                    submitReviewBtn.textContent =
                        "Submit Review";


                    window.location.reload();

                } catch (error) {

                    console.error(
                        "Could not update review:",
                        error
                    );


                    alert(
                        "Could not update your review. Please try again."
                    );

                }


                return;

            }


            // ==========================
            // CHECK EXISTING REVIEW
            // ==========================

            const existingReview =
                firestoreReviews.find(
                    function(review) {

                        return (
                            review.userId ===
                            user.id
                        );

                    }
                );


            if (existingReview) {

                alert(
                    "You have already reviewed this place. You can edit your existing review."
                );


                return;

            }


            // ==========================
            // CREATE NEW REVIEW
            // ==========================

            const newReview = {

                placeId:
                    place.id,

                userId:
                    user.id,

                user:
                    user.name,

                email:
                    user.email,

                rating:
                    rating,

                text:
                    text,

                date:
                    "Just now"

            };


            // ==========================
            // UNIQUE REVIEW ID
            // ==========================

            /*
                One user can have only one
                review for one place.

                Example:

                place 1 + user UID
                =
                1_xxxxxxxxx
            */

            const reviewId =
                place.id
                + "_"
                + user.id;


            // ==========================
            // SAVE TO FIRESTORE
            // ==========================

            try {

                await setDoc(
                    doc(
                        db,
                        "reviews",
                        reviewId
                    ),
                    newReview
                );


                alert(
                    "Review submitted successfully!"
                );


                window.location.reload();

            } catch (error) {

                console.error(
                    "Could not save review:",
                    error
                );


                alert(
                    "Could not submit your review. Please try again."
                );

            }

        }
    );


    // ==========================
    // FIREBASE AUTH STATE
    // ==========================

    onAuthStateChanged(
        auth,
        function(user) {

firebaseUser = user;

user;



            // ==========================
            // USER NOT LOGGED IN
            // ==========================

            if (!user) {

                accountLink.textContent =
                    "Login";


                accountLink.href =
                    "../html/login.html";


                accountMenu.style.display =
                    "none";


                accountMenu.dataset.open =
                    "false";


                reviewNameInput.value =
                    "Please login first";


                renderReviews();


                return;

            }


            // ==========================
            // USER NAME
            // ==========================

            const userName =
                user.displayName
                ||
                user.email?.split("@")[0]
                ||
                "User";


            // ==========================
            // USER EMAIL
            // ==========================

            const userEmail =
                user.email
                ||
                "";


            // ==========================
            // ACCOUNT LINK
            // ==========================

            accountLink.innerHTML =
    userName;


            accountLink.href =
                "#";


            // ==========================
            // ACCOUNT MENU
            // ==========================

            accountLink.onclick =
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


                            <a href="../html/my-reviews.html">
    📝 My Reviews
</a>

<a href="../html/saved-places.html">
    ❤️ Saved Places
</a>

<a href="../html/account.html">
    ⚙️ Account Settings
</a>

<hr>

<button id="placeLogoutBtn">
    Logout
</button>

                        </div>

                    `;


                    // ==========================
                    // TOGGLE ACCOUNT MENU
                    // ==========================

                    if (
                        accountMenu.dataset.open ===
                        "true"
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

                    const placeLogoutBtn =
                        document.getElementById(
                            "placeLogoutBtn"
                        );


                    if (placeLogoutBtn) {

                        placeLogoutBtn.onclick =
                            async function() {

                                try {

                                    await signOut(
                                        auth
                                    );

                                    window.location.href =
                                        "../html/login.html";

                                } catch (error) {

                                    console.error(
                                        "Logout failed:",
                                        error
                                    );

                                }

                            };

                    }

                };


            // ==========================
            // REVIEW NAME
            // ==========================

            reviewNameInput.value =
                userName;


            // ==========================
            // RENDER REVIEWS
            // ==========================

            renderReviews();

        }
    );


    // ==========================
    // LOAD FIRESTORE REVIEWS
    // ==========================

    loadReviewsFromFirestore();




    // ==========================
    // CLOSE ACCOUNT MENU
    // ==========================

    document.addEventListener(
        "click",
        function(event) {

            if (
                accountMenu
                &&
                accountLink
                &&
                !accountMenu.contains(
                    event.target
                )
                &&
                !accountLink.contains(
                    event.target
                )
            ) {

                accountMenu.style.display =
                    "none";


                accountMenu.dataset.open =
                    "false";

            }

        }
    );

}