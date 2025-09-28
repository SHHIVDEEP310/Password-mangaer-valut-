document.addEventListener('DOMContentLoaded', () => {
    const setPasswordScreen = document.getElementById('password-setup');
    const vaultLoginScreen = document.getElementById('vault-login');
    const vaultContentScreen = document.getElementById('vault-content');
    const masterPasswordInput = document.getElementById('master-password');
    const setPasswordBtn = document.getElementById('set-password-btn');
    const vaultPasswordInput = document.getElementById('vault-password');
    const unlockBtn = document.getElementById('unlock-btn');
    const credentialsList = document.getElementById('credentials-list');

    // Check if a master password hash is set
    chrome.storage.local.get(['masterPasswordHash'], (result) => {
        if (result.masterPasswordHash) {
            setPasswordScreen.style.display = 'none';
            vaultLoginScreen.style.display = 'block';
        } else {
            setPasswordScreen.style.display = 'block';
        }
    });

    // Handle setting the master password
    setPasswordBtn.addEventListener('click', () => {
        const password = masterPasswordInput.value;
        if (password) {
            const passwordHash = CryptoJS.SHA256(password).toString();
            chrome.storage.local.set({ masterPasswordHash: passwordHash }, () => {
                alert('Master password set! Please remember it.');
                setPasswordScreen.style.display = 'none';
                vaultLoginScreen.style.display = 'block';
            });
        }
    });

    // Handle unlocking the vault
    unlockBtn.addEventListener('click', () => {
        const password = vaultPasswordInput.value;
        const passwordHash = CryptoJS.SHA256(password).toString();

        chrome.storage.local.get(['masterPasswordHash', 'credentials'], (result) => {
            if (result.masterPasswordHash === passwordHash) {
                vaultLoginScreen.style.display = 'none';
                vaultContentScreen.style.display = 'block';
                
                const decryptedCredentials = decryptCredentials(result.credentials || {}, password);
                displayCredentials(decryptedCredentials);
            } else {
                alert('Incorrect master password!');
            }
        });
    });

    // Function to decrypt credentials
    function decryptCredentials(encryptedCreds, masterPassword) {
        const decryptedCreds = {};
        for (const site in encryptedCreds) {
            try {
                const bytesUsername = CryptoJS.AES.decrypt(encryptedCreds[site].username, masterPassword);
                const bytesPassword = CryptoJS.AES.decrypt(encryptedCreds[site].password, masterPassword);
                decryptedCreds[site] = {
                    username: bytesUsername.toString(CryptoJS.enc.Utf8),
                    password: bytesPassword.toString(CryptoJS.enc.Utf8)
                };
            } catch (e) {
                console.error("Decryption failed:", e);
                decryptedCreds[site] = { username: 'Error', password: 'Error' };
            }
        }
        return decryptedCreds;
    }

    // Function to display saved credentials with masked passwords
    function displayCredentials(credentials) {
        credentialsList.innerHTML = '';
        for (const site in credentials) {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${site}</strong><br>
                Email: ${credentials[site].username}<br>
                Password: <span class="masked-password">*****</span>
                <button class="show-password-btn" data-password="${credentials[site].password}">Show</button>
            `;
            credentialsList.appendChild(li);
        }
        
        // Add click listeners to the new buttons
        const showPasswordBtns = document.querySelectorAll('.show-password-btn');
        showPasswordBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const passwordSpan = btn.previousElementSibling;
                const realPassword = btn.getAttribute('data-password');
                
                if (passwordSpan.textContent === '*****') {
                    passwordSpan.textContent = realPassword;
                    btn.textContent = 'Hide';
                } else {
                    passwordSpan.textContent = '*****';
                    btn.textContent = 'Show';
                }
            });
        });
    }
});