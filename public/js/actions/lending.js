document.addEventListener('DOMContentLoaded', () => {
    const lendingCreateButton = document.getElementById('lendingCreateButton');
    if (lendingCreateButton) {
        lendingCreateButton.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const response = await fetch('/api/lendings/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        bookId: document.getElementById('bookId').value,
                        userId: document.getElementById('studentId').value,
                        returnDate: document.getElementById('lending_returnDate').value
                    })
                });
                const result = await response.json();
                if (result.status === 'success') {
                    showToast('Lending created successfully', 'success');
                    window.location.reload();
                } else {
                    showToast(result.message, 'error');
                }
            } catch (err) {
                console.error('Error:', err);
                showToast('An error occurred while creating the lending', 'error');
            }
        });
    }

    const editLendingModal = document.getElementById('editLendingModal');
    if (editLendingModal) {
        editLendingModal.addEventListener('show.bs.modal', event => {
            const button = event.relatedTarget;
            const item = JSON.parse(button.getAttribute('data-item'));
            
            let lendingIdInput = document.getElementById('lendingId');
            if (!lendingIdInput) {
                lendingIdInput = document.createElement('input');
                lendingIdInput.type = 'hidden';
                lendingIdInput.id = 'lendingId';
                lendingIdInput.name = 'lendingId';
                document.getElementById('editLendingForm').appendChild(lendingIdInput);
            }
            lendingIdInput.value = item.id;
        });
    }

    const editLendingForm = document.getElementById('editLendingForm');
    if (editLendingForm) {
        editLendingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const lendingId = document.getElementById('lendingId').value;
                const response = await fetch('/api/lendings/return', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lendingId })
                });
                const result = await response.json();
                if (result.status === 'success') {
                    showToast('Lending returned successfully', 'success');
                    window.location.reload();
                } else {
                    showToast(result.message, 'error');
                }
            } catch (err) {
                console.error('Error:', err);
                showToast('An error occurred while returning the lending', 'error');
            }
        });
    }
});
