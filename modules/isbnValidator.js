function validateISBN(isbn) {
    const cleanISBN = isbn.replace(/[-\s]/g, '').toUpperCase();
    if (cleanISBN.length === 10) {
        return validateISBN10(cleanISBN);
    }
    if (cleanISBN.length === 13) {
        return validateISBN13(cleanISBN);
    }
    return false;
}

function validateISBN10(isbn) {
    if (!/^[0-9]{9}[0-9X]$/.test(isbn)) {
        return false;
    }
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(isbn[i]) * (10 - i);
    }
    
    const lastChar = isbn[9];
    sum += (lastChar === 'X') ? 10 : parseInt(lastChar);
    
    return sum % 11 === 0;
}

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
