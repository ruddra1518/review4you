const defaultReviews = {

    1: [
        {
            id: 1,
            user: "Rahul",
            rating: 5,
            text: "Very good samosa and affordable.",
            date: "2 days ago"
        },

        {
            id: 2,
            user: "Priya",
            rating: 4,
            text: "Fresh food, but seating is limited.",
            date: "5 days ago"
        }
    ],

    2: [
        {
            id: 3,
            user: "Amit",
            rating: 5,
            text: "Good availability of medicines.",
            date: "3 days ago"
        }
    ],

    3: [
        {
            id: 4,
            user: "Neha",
            rating: 4,
            text: "Good variety and reasonable prices.",
            date: "1 week ago"
        }
    ]

};
// USER REVIEWS
const savedUserReviews =
    localStorage.getItem("review4you_user_reviews");

const userReviews = savedUserReviews
    ? JSON.parse(savedUserReviews)
    : {};

// ==========================
// CALCULATE PLACE RATING
// ==========================

function getPlaceRating(placeId) {

    const defaultPlaceReviews =
        defaultReviews[placeId] || [];

    const addedReviews =
        userReviews[placeId] || [];


    const allReviews = [
        ...defaultPlaceReviews,
        ...addedReviews
    ];


    if (allReviews.length === 0) {

        return {
            rating: 0,
            reviews: 0
        };

    }


    const totalRating =
        allReviews.reduce(
            function(total, review) {

                return total + review.rating;

            },
            0
        );


    const averageRating =
        totalRating / allReviews.length;


    return {
        rating: Number(averageRating.toFixed(1)),
        reviews: allReviews.length
    };

}