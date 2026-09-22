# Review4You

<p align="center">
  <strong>Discover better local places. Make better everyday choices.</strong>
</p>

<p align="center">
  A local review platform for discovering useful, affordable, and trusted places in your area.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase">
</p>

---

## 📖 About

**Review4You** is a local review web application designed to help people discover useful and affordable places in their area.

Users can explore places, view ratings and reviews, save their favorite places, and share their own experiences.

The goal of Review4You is to make everyday local decisions easier through useful place information and community reviews.

---

## ✨ Features

### 🔎 Place Discovery

- Search for places
- Browse places by category
- View recommended places
- View detailed place information
- Sort places by rating, price, and recent updates

### ⭐ Reviews

- View place reviews
- Add a review
- Edit your own review
- Delete your own review
- Manage reviews through authenticated accounts

### ❤️ Saved Places

- Save favorite places
- Remove saved places
- View saved places from your account

### 👤 User Accounts

- User registration
- Login and logout
- Password reset
- Account management
- View personal reviews

### 📍 Location

- Detect user location
- Manually select a location
- Use location information for local discovery

### 🛠️ Administration

- Separate local admin dashboard
- Manage places
- Manage reviews
- Admin-only access controlled through Firebase Security Rules

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Page structure |
| CSS3 | Styling and responsive design |
| JavaScript | Application logic and interactions |
| Firebase Authentication | User authentication |
| Firebase Firestore | Application data and reviews |
| Firebase Hosting | Web hosting |
| Git | Version control |
| GitHub | Source code and collaboration |

---

## 📂 Project Structure

```text
review4you/
│
├── index.html
├── 404.html
│
├── html/
│   ├── about.html
│   ├── account.html
│   ├── forgot-password.html
│   ├── login.html
│   ├── my-reviews.html
│   ├── place.html
│   ├── recommend.html
│   ├── reset-password.html
│   ├── saved-places.html
│   └── signup.html
│
├── js/
│   ├── auth.js
│   ├── data.js
│   ├── firebase-config.js
│   ├── location.js
│   ├── place.js
│   ├── recommend.js
│   ├── review.js
│   ├── saved-places.js
│   └── script.js
│
├── css/
│   └── style.css
│
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── .firebaserc
├── .gitignore
└── README.md
