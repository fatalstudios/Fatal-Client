
        const API_BASE = "http://localhost:5000/api"; // Change if deployed

        async function apiRegister(username, password) {
            const res = await fetch(`${API_BASE}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            return res.json();
        }

        async function apiLogin(username, password) {
            const res = await fetch(`${API_BASE}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            return res.json();
        }

        async function apiGetProfile(username) {
            const res = await fetch(`${API_BASE}/profile/${username}`);
            return res.json();
        }

        async function apiUpdateProfile(username, updates) {
            const res = await fetch(`${API_BASE}/profile/${username}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates)
            });
            return res.json();
        }

        async function uploadToCloudinary(file) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "YOUR_UPLOAD_PRESET"); // replace this with your Cloudinary upload preset

            const res = await fetch("https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            return data.secure_url;
        }

        // Replace login logic with backend check
        document.querySelector("#loginModal form").addEventListener("submit", async function(e) {
            e.preventDefault();
            const uname = document.getElementById("username").value;
            const pass = document.getElementById("password").value;
            const result = await apiLogin(uname, pass);
            if (result.message) {
                saveLogin(uname);
                closeModal();
                loadProfileFromBackend();
            } else {
                alert(result.error || "Login failed");
            }
        });

        // Replace register logic with backend call
        document.querySelector("#registerModal form").addEventListener("submit", async function(e) {
            e.preventDefault();
            const uname = document.getElementById("reg-username").value;
            const pass = document.getElementById("reg-password").value;
            const result = await apiRegister(uname, pass);
            if (result.message) {
                saveLogin(uname);
                closeRegisterModal();
                loadProfileFromBackend();
            } else {
                alert(result.error || "Registration failed");
            }
        });

        // Profile form submit with avatar upload
        document.getElementById("profileForm").addEventListener("submit", async function(e) {
            e.preventDefault();
            const email = document.getElementById("profile-email").value;
            const bio = document.getElementById("profile-bio").value;
            const pass = document.getElementById("profile-password").value;
            const file = document.getElementById("profile-avatar").files[0];

            const updates = { email, bio };
            if (pass) updates.password = pass;

            if (file) {
                const avatarURL = await uploadToCloudinary(file);
                updates.avatar_url = avatarURL;
                localStorage.setItem("fatal_avatar", avatarURL);
                updateAvatarDisplay(avatarURL);
            }

            await apiUpdateProfile(username, updates);
            localStorage.setItem("fatal_email", email);
            localStorage.setItem("fatal_bio", bio);
            closeProfileModal();
        });

        async function loadProfileFromBackend() {
            const profile = await apiGetProfile(username);
            if (profile) {
                localStorage.setItem("fatal_email", profile.email || "");
                localStorage.setItem("fatal_bio", profile.bio || "");
                if (profile.avatar_url) {
                    localStorage.setItem("fatal_avatar", profile.avatar_url);
                    updateAvatarDisplay(profile.avatar_url);
                }
                updateAuthButtons();
            }
        }
