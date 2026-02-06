document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('updateProfile').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/auth/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, username, email, password })
            });
            const result = await response.json();
            if (result.status === 'success') {
                showToast('Profile updated successfully!', 'success');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast(error.message, 'error');
        }
    });
});