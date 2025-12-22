document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('bookForm').addEventListener('submit', function (event) {
        event.preventDefault();
        fetch('/api/books/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: document.getElementById('newBookTitle').value,
                category: document.getElementById('newBookCategory').value,
                author: document.getElementById('newBookAuthor').value,
                isbn: document.getElementById('newBookISBN').value
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    setCookie('message', 'Operação realizada com sucesso!', 1);
                    window.location.href = '?status=success';
                    location.reload();
                } else {
                    showToast('Error: ' + data.message, 'error');
                }
            })
            .catch(error => {
                showToast('Error: ' + error.message, 'error');
                console.error('Error:', error);
            });
    });
    document.getElementById('editBookForm').addEventListener('submit', function (event) {
        event.preventDefault();

        fetch(`/api/books/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bookId: this.getAttribute('data-book-id'),
                title: document.getElementById('editBookTitle').value,
                category: document.getElementById('editBookCategory').value,
                author: document.getElementById('editBookAuthor').value,
                isbn: document.getElementById('editBookISBN').value
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    location.reload();
                } else {
                    showToast('Error: ' + data.message, 'error');
                }
            })
            .catch(error => {
                showToast('Error: ' + error.message, 'error');
                console.error('Error:', error);
            });
    });
    document.getElementById('deleteBookForm').addEventListener('submit', function (event) {
        event.preventDefault();
        fetch(`/api/books/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bookId: document.getElementById('deleteBookId').value
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    location.reload();
                } else {
                    showToast('Error: ' + data.message, 'error');
                }
            })
            .catch(error => {
                showToast('Error: ' + error.message, 'error');
                console.error('Error:', error);
            });
    });
    const editButtons = document.querySelectorAll('.editBookBtn');

    editButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            const itemData = this.getAttribute('data-bs-item');
            if (itemData) {
                const book = JSON.parse(itemData);
                document.getElementById('editBookTitle').value = book.title;
                document.getElementById('editBookCategory').value = book.category;
                document.getElementById('editBookAuthor').value = book.author;
                document.getElementById('editBookISBN').value = book.isbn;
                document.getElementById('editBookForm').setAttribute('data-book-id', book._id);
            }
        });
    });
    const deleteButtons = document.querySelectorAll('.btn-delete');

    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookId = this.getAttribute('data-id');
            const bookTitle = this.getAttribute('data-title');

            const deleteForm = document.getElementById('deleteBookForm');
            const modalBookTitle = document.getElementById('deleteBookTitle');

            if (deleteForm) deleteForm.setAttribute('data-book-id', bookId);
            if (modalBookTitle) {
                document.getElementById('deleteBookId').value = bookId;
                modalBookTitle.textContent = bookTitle;
            }
        });
    });
});
