import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import { auth } from "./firebase-config.js";


// ==========================
// SIGN UP
// ==========================

const signupBtn = document.getElementById("signupBtn");

if (signupBtn) {

    signupBtn.addEventListener("click", async function () {

        const name =
            document.getElementById("signupName").value.trim();

        const email =
            document.getElementById("signupEmail").value.trim().toLowerCase();

        const password =
            document.getElementById("signupPassword").value;


        if (name === "") {
            alert("Please enter your name.");
            return;
        }

        if (email === "") {
            alert("Please enter your email.");
            return;
        }

        if (password === "") {
            alert("Please enter a password.");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }


        try {

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;


            await updateProfile(user, {
                displayName: name
            });


            alert("Account created successfully!");

            window.location.href = "../index.html";


        } catch (error) {

            console.error(error);

            if (error.code === "auth/email-already-in-use") {
                alert("An account with this email already exists.");
            }
            else if (error.code === "auth/invalid-email") {
                alert("Please enter a valid email address.");
            }
            else if (error.code === "auth/weak-password") {
                alert("Password must be at least 6 characters.");
            }
            else {
                alert("Could not create your account. Please try again.");
            }

        }

    });

}


// ==========================
// LOGIN
// ==========================

const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {

    loginBtn.addEventListener("click", async function () {

        const email =
            document.getElementById("loginEmail").value.trim().toLowerCase();

        const password =
            document.getElementById("loginPassword").value;


        if (email === "") {
            alert("Please enter your email.");
            return;
        }

        if (password === "") {
            alert("Please enter your password.");
            return;
        }


        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


            alert("Login successful!");

            window.location.href = "../index.html";


        } catch (error) {

            console.error(error);

            if (
                error.code === "auth/invalid-credential" ||
                error.code === "auth/wrong-password" ||
                error.code === "auth/user-not-found"
            ) {
                alert("Invalid email or password.");
            }
            else {
                alert("Could not login. Please try again.");
            }

        }

    });

}


// ==========================
// ACCOUNT SETTINGS
// ==========================

const accountNameInput =
    document.getElementById("accountName");

const accountEmailInput =
    document.getElementById("accountEmail");

const saveProfileBtn =
    document.getElementById("saveProfileBtn");

const changePasswordBtn =
    document.getElementById("changePasswordBtn");

const accountLogoutBtn =
    document.getElementById("accountLogoutBtn");


// ==========================
// LOAD CURRENT USER
// ==========================

if (accountNameInput && accountEmailInput) {

    onAuthStateChanged(auth, function(user) {

        if (!user) {

            window.location.href = "../html/login.html";
            return;

        }


        accountNameInput.value =
            user.displayName || "";

        accountEmailInput.value =
            user.email || "";

    });

}


// ==========================
// SAVE NAME
// ==========================

if (saveProfileBtn) {

    saveProfileBtn.addEventListener("click", async function () {

        const newName =
            accountNameInput.value.trim();


        if (newName === "") {
            alert("Please enter your name.");
            return;
        }


        const user = auth.currentUser;

        if (!user) {
            alert("Please login again.");
            window.location.href = "../html/login.html";
            return;
        }


        try {

            await updateProfile(user, {
                displayName: newName
            });


            alert("Profile updated successfully!");

        } catch (error) {

            console.error(error);

            alert("Could not update your profile.");

        }

    });

}


// ==========================
// CHANGE PASSWORD
// ==========================

if (changePasswordBtn) {

    changePasswordBtn.addEventListener("click", async function () {

        const currentPassword =
            document.getElementById("currentPassword").value;

        const newPassword =
            document.getElementById("newPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        if (currentPassword === "") {
            alert("Please enter your current password.");
            return;
        }

        if (newPassword === "") {
            alert("Please enter a new password.");
            return;
        }

        if (newPassword.length < 6) {
            alert("New password must be at least 6 characters.");
            return;
        }

        if (confirmPassword === "") {
            alert("Please confirm your new password.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("New passwords do not match.");
            return;
        }


        const user = auth.currentUser;

        if (!user || !user.email) {
            alert("Please login again.");
            window.location.href = "../html/login.html";
            return;
        }


        try {

            const credential =
                EmailAuthProvider.credential(
                    user.email,
                    currentPassword
                );


            await reauthenticateWithCredential(
                user,
                credential
            );


            await updatePassword(
                user,
                newPassword
            );


            document.getElementById("currentPassword").value = "";
            document.getElementById("newPassword").value = "";
            document.getElementById("confirmPassword").value = "";


            alert("Password changed successfully!");


        } catch (error) {

            console.error(error);

            if (error.code === "auth/invalid-credential") {
                alert("Current password is incorrect.");
            }
            else {
                alert("Could not change your password. Please try again.");
            }

        }

    });

}


// ==========================
// LOGOUT
// ==========================

if (accountLogoutBtn) {

    accountLogoutBtn.addEventListener("click", async function () {

        const confirmLogout =
            confirm("Are you sure you want to logout?");

        if (!confirmLogout) {
            return;
        }


        try {

            await signOut(auth);

            window.location.href = "../html/login.html";

        } catch (error) {

            console.error(error);

            alert("Could not logout. Please try again.");

        }

    });

}


// ==========================
// FORGOT PASSWORD
// ==========================

const verifyEmailBtn =
    document.getElementById("verifyEmailBtn");

if (verifyEmailBtn) {

    verifyEmailBtn.addEventListener("click", async function () {

        const email =
            document.getElementById("forgotEmail")
                .value
                .trim()
                .toLowerCase();


        if (email === "") {
            alert("Please enter your email.");
            return;
        }


        try {

            await sendPasswordResetEmail(
                auth,
                email
            );


            alert(
                "Password reset email sent! Please check your inbox."
            );


            window.location.href =
                "../html/login.html";


        } catch (error) {

            console.error(error);

            if (error.code === "auth/invalid-email") {
                alert("Please enter a valid email address.");
            }
            else if (error.code === "auth/user-not-found") {
                alert("No account was found with this email.");
            }
            else {
                alert(
                    "Could not send the password reset email. Please try again."
                );
            }

        }

    });

}