const defaultCategories = [
    "Food & Snacks",
    "Medical & Pharmacy",
    "Grocery",
    "Services"
];

const savedCategories =
    localStorage.getItem("review4you_categories");

const categories =
    savedCategories
        ? JSON.parse(savedCategories)
        : defaultCategories;

const defaultPlaces = [
    {
        id: 1,
        name: "Sharma Samosa",
        category: "Food & Snacks",
        categoryClass: "food-photo",
        emoji: "🥟",
        rating: 4.7,
        reviews: 128,
        price: "Affordable",
        distance: "0.6 km away",
        address: "Main Road",
        latitude: null,
        longitude: null,
        tags: ["Best Value", "Fresh"],
        lastChecked: "Last checked 2 days ago",
        verified: true
    },

    {
        id: 2,
        name: "City Care Medical",
        category: "Medical & Pharmacy",
        categoryClass: "medical-photo",
        emoji: "💊",
        rating: 4.8,
        reviews: 96,
        price: "Affordable",
        distance: "0.9 km away",
        address: "Station Road",
        latitude: null,
        longitude: null,
        tags: ["Good Availability", "Trusted"],
        lastChecked: "Last checked 5 days ago",
        verified: true
    },

    {
        id: 3,
        name: "Fresh Mart",
        category: "Grocery",
        categoryClass: "grocery-photo",
        emoji: "🛍️",
        rating: 4.5,
        reviews: 74,
        price: "Budget",
        distance: "1.2 km away",
        address: "Market Road",
        latitude: null,
        longitude: null,
        tags: ["Low Prices", "Variety"],
        lastChecked: "Last checked 1 week ago",
        verified: true
    }
];


// LOAD SAVED PLACES

const savedPlaces = localStorage.getItem("review4you_places");

let places = savedPlaces
    ? JSON.parse(savedPlaces)
    : defaultPlaces;