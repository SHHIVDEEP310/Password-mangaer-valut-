// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Check if the message is to save credentials
    if (request.action === "saveCredentials") {
        const url = new URL(request.url);
        const site = url.hostname;
        const username = request.username;
        const password = request.password;

        // Get the credentials from storage
        chrome.storage.local.get(['credentials'], (result) => {
            const credentials = result.credentials || {};

            // Check if master password hash exists before saving
            chrome.storage.local.get(['masterPasswordHash'], (hashResult) => {
                if (hashResult.masterPasswordHash) {
                    // Save the new credential
                    credentials[site] = {
                        username: username,
                        password: password
                    };
                    chrome.storage.local.set({ credentials: credentials }, () => {
                        console.log(`Saved login for ${site}`);
                    });
                } else {
                    console.warn("Master password not set. Credentials not saved automatically.");
                }
            });
        });
    }
});