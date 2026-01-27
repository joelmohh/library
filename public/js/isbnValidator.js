// Função para validar ISBN-10 e ISBN-13
function validateISBN(isbn) {
    // Remove hífens, espaços e outros caracteres não numéricos (exceto X para ISBN-10)
    const cleanISBN = isbn.replace(/[-\s]/g, '').toUpperCase();
    
    // Verifica se é ISBN-10
    if (cleanISBN.length === 10) {
        return validateISBN10(cleanISBN);
    }
    
    // Verifica se é ISBN-13
    if (cleanISBN.length === 13) {
        return validateISBN13(cleanISBN);
    }
    
    return false;
}

// Validação específica para ISBN-10
function validateISBN10(isbn) {
    if (!/^[0-9]{9}[0-9X]$/.test(isbn)) {
        return false;
    }
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(isbn[i]) * (10 - i);
    }
    
    // O último dígito pode ser X (que representa 10)
    const lastChar = isbn[9];
    sum += (lastChar === 'X') ? 10 : parseInt(lastChar);
    
    return sum % 11 === 0;
}

// Validação específica para ISBN-13
function validateISBN13(isbn) {
    if (!/^[0-9]{13}$/.test(isbn)) {
        return false;
    }
    
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(isbn[i]) * (i % 2 === 0 ? 1 : 3);
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === parseInt(isbn[12]);
}

// Função para buscar dados do livro pela API do Google Books
async function fetchBookDataFromISBN(isbn, modalType = 'new') {
    const cleanISBN = isbn.replace(/[-\s]/g, '');
    
    try {
        const response = await fetch(`/api/books/google-books/${cleanISBN}`);
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
            const bookData = data.data;
            
            // Preenche os campos do formulário com base no tipo de modal
            const prefix = modalType === 'edit' ? 'edit' : 'new';
            
            if (bookData.title) {
                document.getElementById(`${prefix}BookTitle`).value = bookData.title;
            }
            if (bookData.author) {
                document.getElementById(`${prefix}BookAuthor`).value = bookData.author;
            }
            if (bookData.category) {
                document.getElementById(`${prefix}BookCategory`).value = bookData.category;
            }
            
            showToast('Dados do livro carregados com sucesso!', 'success');
        } else {
            showToast('Nenhum livro encontrado para este ISBN', 'error');
        }
    } catch (error) {
        showToast('Erro ao buscar dados do livro: ' + error.message, 'error');
        console.error('Error:', error);
    }
}

// Função para adicionar feedback visual de validação
function addISBNValidation(inputId, buttonId, modalType) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    
    if (!input || !button) return;
    
    input.addEventListener('input', function() {
        const isbn = this.value.trim();
        
        if (isbn === '') {
            // Remove classes de validação se o campo estiver vazio
            this.classList.remove('is-valid', 'is-invalid');
            button.disabled = true;
            return;
        }
        
        if (validateISBN(isbn)) {
            this.classList.remove('is-invalid');
            this.classList.add('is-valid');
            button.disabled = false;
        } else {
            this.classList.remove('is-valid');
            this.classList.add('is-invalid');
            button.disabled = true;
        }
    });
    
    // Evento de clique no botão de busca
    button.addEventListener('click', function() {
        const isbn = input.value.trim();
        if (validateISBN(isbn)) {
            fetchBookDataFromISBN(isbn, modalType);
        }
    });
}
