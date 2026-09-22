import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    getDocs,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { auth } from "./firebase-config.js";


// ==========================
// FIRESTORE
// ==========================

const db = getFirestore();


// ==========================
// FORM
// ==========================

const recommendForm =
    document.getElementById("recommendForm");

const recommendCategory =
    document.getElementById("recommendCategory");


// ==========================
// LOAD CATEGORIES
// ==========================

async function loadCategories() {

    try {

        const savedCategoryList =
            localStorage.getItem(
                "review4you_categories"
            );

        const adminCategories =
            savedCategoryList
                ? JSON.parse(savedCategoryList)
                : [];


        const snapshot =
            await getDocs(
                collection(db, "places")
            );


        const placeCategories =
            snapshot.docs.map(
                function(docSnapshot) {

                    const data =
                        docSnapshot.data();

                    return data.category;
                }
            );


        const allCategories = [
            ...placeCategories,
            ...adminCategories
        ];


        const uniqueCategories = [
            ...new Set(
                allCategories.filter(
                    function(category) {

                        return category &&
                            category.trim() !== "";

                    }
                )
            )
        ];


        recommendCategory.innerHTML = `
            <option value="">
                Select a category
            </option>
        `;


        uniqueCategories.forEach(
            function(category) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    category;

                option.textContent =
                    category;

                recommendCategory.appendChild(
                    option
                );

            }
        );


        console.log(
            "Recommend categories loaded:",
            uniqueCategories
        );


    } catch (error) {

        console.error(
            "Could not load categories:",
            error
        );

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

            window.location.href =
                "login.html";

            return;
        }


        // ==========================
        // LOAD CATEGORIES
        // ==========================

        await loadCategories();


        // ==========================
        // CURRENT FIREBASE USER
        // ==========================

        const currentUser = {

            id:
                user.uid,

            name:
                user.displayName ||
                user.email?.split("@")[0] ||
                "User",

            email:
                user.email || ""

        };


        // ==========================
        // FORM SUBMIT
        // ==========================

        recommendForm.addEventListener(
            "submit",
            async function(event) {

                event.preventDefault();


                const placeName =
                    document
                        .getElementById(
                            "recommendPlaceName"
                        )
                        .value
                        .trim();


                const category =
                    document
                        .getElementById(
                            "recommendCategory"
                        )
                        .value;


                const address =
                    document
                        .getElementById(
                            "recommendAddress"
                        )
                        .value
                        .trim();


                const reason =
                    document
                        .getElementById(
                            "recommendReason"
                        )
                        .value
                        .trim();


                // ==========================
                // VALIDATION
                // ==========================

                if (
                    placeName === "" ||
                    category === "" ||
                    address === "" ||
                    reason === ""
                ) {

                    alert(
                        "Please fill in all fields."
                    );

                    return;
                }


                // ==========================
                // CREATE SUGGESTION
                // ==========================

                const newSuggestion = {

                    placeName:
                        placeName,

                    category:
                        category,

                    address:
                        address,

                    reason:
                        reason,

                    userId:
                        currentUser.id,

                    userName:
                        currentUser.name,

                    userEmail:
                        currentUser.email,

                    date:
                        new Date()
                            .toLocaleDateString(),

                    status:
                        "Pending"

                };


                // ==========================
                // SAVE TO FIRESTORE
                // ==========================

                try {

                    await addDoc(
                        collection(
                            db,
                            "suggestions"
                        ),
                        newSuggestion
                    );


                    console.log(
                        "Suggestion saved to Firestore."
                    );


                    // ==========================
                    // SUCCESS
                    // ==========================

                    alert(
                        "Thank you! Your place suggestion has been submitted. Our team will review it."
                    );


                    // ==========================
                    // CLEAR FORM
                    // ==========================

                    recommendForm.reset();


                } catch (error) {

                    console.error(
                        "Could not save suggestion:",
                        error
                    );


                    alert(
                        "Could not submit your suggestion. Please try again."
                    );

                }

            }
        );

    }
);