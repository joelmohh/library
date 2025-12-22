const loginButton = document.getElementById('login-button');
if (loginButton) {

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    loginButton.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            const result = await response.json();
            if (response.ok) {
                if(result.type === 'admin'){
                    window.location.href = '/dashboard';
                } else {
                    window.location.href = '/student/home';
                }
            } else {
                showToast(result.message || 'Login failed', 'error', 4000);
            }
        } catch (error) {
            console.error('Error during login:', error);
            showToast('An error occurred. Please try again later.', 'error', 4000);
        }
    });
}
const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
    logoutButton.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.json();
            if (response.ok) {
                window.location.href = '/';
            } else {
                showToast(result.message || 'Logout failed', 'error', 4000);
            }
        } catch (error) {
            console.error('Error during logout:', error);
            showToast('An error occurred. Please try again later.', 'error', 4000);
        }
    });
}