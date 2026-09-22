import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAyFnLNWGmU0kheJIz9z7YCuJx2XMyhqPo",
    authDomain: "review4you-26.firebaseapp.com",
    projectId: "review4you-26",
    storageBucket: "review4you-26.firebasestorage.app",
    messagingSenderId: "163389517695",
    appId: "1:163389517695:web:00b0caaa257f3343aa344a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);