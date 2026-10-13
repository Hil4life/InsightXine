
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

// LOGIN EXISTING USERS
if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const message = document.getElementById("auth-message");
        const submitButton = loginForm.querySelector(
            'button[type="submit"]'
        );

        message.textContent = "Signing you in...";
        submitButton.disabled = true;

        try {
            const { error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                message.textContent = error.message;
                return;
            }

            message.textContent = "Sign in successful! Redirecting...";
            window.location.href = "dashboard.html";

        } catch (error) {
            console.error("Login error:", error);
            message.textContent =
                "Something went wrong. Please try again.";

        } finally {
            submitButton.disabled = false;
        }
    });
}


// CREATE NEW ACCOUNTS
if (signupForm) {
    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;
        const message = document.getElementById("auth-message");
        const submitButton = signupForm.querySelector(
            'button[type="submit"]'
        );

        if (password !== confirmPassword) {
            message.textContent = "Your passwords do not match.";
            return;
        }

        message.textContent = "Creating your account...";
        submitButton.disabled = true;

        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: name
                    }
                }
            });

            if (error) {
                message.textContent = error.message;
                return;
            }

            if (data.session) {
                message.textContent =
                    "Account created! Let's set up your business.";

                window.location.href = "setup.html";
            } else {
                message.textContent =
                    "Account created! Check your email to confirm your account, then sign in.";
            }

        } catch (error) {
            console.error("Signup error:", error);
            message.textContent =
                "Something went wrong. Please try again.";

        } finally {
            submitButton.disabled = false;
        }
    });
}
