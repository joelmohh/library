document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('newStudentBtn').addEventListener('click', () => {
        fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: document.getElementById('studentName').value,
                email: document.getElementById('studentEmail').value,
                password: document.getElementById('studentPassword').value,
                type: 'student',
                username: document.getElementById('studentUsername').value
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showToast(data.message, 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                showToast(data.message, 'error');
            }
        })
        .catch(err => {
            showToast('Error creating student', 'error');
            console.error(err);
        });
    })

    document.querySelectorAll('.deleteUserBtn').forEach(button => {
        button.addEventListener('click', () => {
            const userId = button.getAttribute('data-id');
            fetch('/api/users/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    showToast(data.message, 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    showToast(data.message, 'error');
                }
            })
            .catch(err => {
                showToast('Error deleting user', 'error');
                console.error(err);
            });
        });
    });

    document.querySelectorAll('.editUserBtn').forEach(button => {
        button.addEventListener('click', () => {
            const userData = JSON.parse(button.getAttribute('data-bs-item'));

            document.getElementById('editStudentName').value = userData.name;
            document.getElementById('editStudentEmail').value = userData.email;
            document.getElementById('editStudentUsername').value = userData.username;
            document.getElementById('editStudentId').value = userData._id;
        })
    });
    document.getElementById('editStudentBtn').addEventListener('click', () => {
        fetch('/api/users/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: document.getElementById('editStudentId').value,
                name: document.getElementById('editStudentName').value,
                email: document.getElementById('editStudentEmail').value,
                type: document.URL.includes('teachers') ? 'teacher' : 'student',
                password: document.getElementById('editStudentPassword').value
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showToast(data.message, 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                showToast(data.message, 'error');
            }
        })
        .catch(err => {
            showToast('Error updating student', 'error');
            console.error(err);
        });
    });
    document.getElementById('newTeacherBtn').addEventListener('click', () => {
        fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: document.getElementById('teacherName').value,
                email: document.getElementById('teacherEmail').value,
                password: document.getElementById('teacherPassword').value,
                type: 'teacher',
                username: document.getElementById('teacherUsername').value
            })
        })
        .then(response => response.json())
        .then(data => { 
            if (data.status === 'success') {
                showToast(data.message, 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                showToast(data.message, 'error');
            }
        })
        .catch(err => {
            showToast('Error creating teacher', 'error');
            console.error(err);
        });
    })

});