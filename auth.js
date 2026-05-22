// ============ AUTHENTICATION SYSTEM ============

// Check if already logged in
if (sessionStorage.getItem('loggedIn') === 'true') {
    window.location.href = 'index.html';
}

const loginBtn = document.getElementById('loginBtn');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

function handleLogin() {
    let username = usernameInput.value.trim();
    
    if (username === "") {
        username = "PILOT";
    }
    
    // Store user session
    sessionStorage.setItem('loggedIn', 'true');
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('loginTime', Date.now());
    
    // Redirect to game
    window.location.href = 'index.html';
}

loginBtn.addEventListener('click', handleLogin);

// Enter key support
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
});
passwordInput.addEventListener('keypress', (e) {
    if (e.key === 'Enter') handleLogin();
});