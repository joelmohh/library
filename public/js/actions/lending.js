document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('newLendingBtn').addEventListener('click', () => {
        const bookId = document.getElementById('newLendingBook').value;
        const userId = document.getElementById('newLendingUser').value;
        const returnDate = document.getElementById('newLendingReturnDate').value;

        fetch('/api/lendings/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ bookId, userId, returnDate })
        })        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                location.reload();
            } else {
                showToast('Error: ' + data.message, 'error');
            }
        }).catch(err => {
            showToast('Error: ' + err.message, 'error');
        });        
    })

    document.querySelectorAll('.returnLendingBtn').forEach(button => {
        button.addEventListener('click', () => {
            const lendingData = JSON.parse(button.getAttribute('data-item'));
            fetch('/api/lendings/return', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ lendingId: lendingData })
            }).then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    location.reload();
                } else {
                    showToast('Error: ' + data.message, 'error');
                }
            }).catch(err => {
                showToast('Error: ' + err.message, 'error');
            });
        });
    });
    document.querySelectorAll('.deleteLendingBtn').forEach(button => {
        button.addEventListener('click', () => {
            const lendingData = JSON.parse(button.getAttribute('data-item'));
            fetch('/api/lendings/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ lendingId: lendingData })
            }).then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    location.reload();
                } else {
                    showToast('Error: ' + data.message, 'error');
                }
            }).catch(err => {
                showToast('Error: ' + err.message, 'error');
            });
        });
    });
    document.querySelectorAll('.extendLendingBtn').forEach(button => {
        button.addEventListener('click', () => {
            const lendingData = JSON.parse(button.getAttribute('data-item'));
            document.getElementById('extendLendingId').value = lendingData;
        });
    });
    document.getElementById('extendLendingBtn').addEventListener('click', () => {
        const lendingData = document.getElementById('extendLendingId').value;
            fetch('/api/lendings/extend', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ lendingId: lendingData, newReturnDate: document.getElementById('extendLendingReturnDate').value })
            }).then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    location.reload();
                } else {
                    showToast('Error: ' + data.message, 'error');
                }
            }).catch(err => {
                showToast('Error: ' + err.message, 'error');
            });
    });
});
