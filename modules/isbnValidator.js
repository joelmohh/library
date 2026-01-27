// Validação de ISBN no backend
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

module.exports = { validateISBN };
