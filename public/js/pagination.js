/**
 * @param {string} tableBodyId - The ID of the table's <tbody>
 * @param {string} rowsSelectId - The ID of the <select> for items per page
 * @param {string} paginationId - The ID of the <ul> where the page numbers are located
 * @param {string} prevBtnId - The ID of the "Previous" button
 * @param {string} nextBtnId - The ID of the "Next" button
 */
function initTablePagination(tableBodyId, rowsSelectId, paginationId, prevBtnId, nextBtnId) {
    const tableBody = document.getElementById(tableBodyId);
    if (!tableBody) return; 

    const rows = Array.from(tableBody.querySelectorAll('tr')); 
    const rowsPerPageSelect = document.getElementById(rowsSelectId);
    const paginationContainer = document.getElementById(paginationId);
    const btnPrev = document.getElementById(prevBtnId);
    const btnNext = document.getElementById(nextBtnId);

    let currentPage = 1;
    let rowsPerPage = parseInt(rowsPerPageSelect.value);

    function displayRows(page, perPage) {
        const start = (page - 1) * perPage;
        const end = start + perPage;

        rows.forEach((row, index) => {
            if (row.innerText.trim() === "Nenhum livro encontrado.") return;

            if (index >= start && index < end) {
                row.style.display = ''; 
            } else {
                row.style.display = 'none'; 
            }
        });
        
        setupPaginationButtons(rows.length, perPage, page);
    }

    function setupPaginationButtons(totalItems, perPage, curPage) {
        const existingNumbers = paginationContainer.querySelectorAll('.generated-page-item');
        existingNumbers.forEach(el => el.remove());

        const pageCount = Math.ceil(totalItems / perPage);
        
        for (let i = 1; i <= pageCount; i++) {
            let li = document.createElement('li');
            li.className = `page-item generated-page-item ${i === curPage ? 'active' : ''}`;
            
            let a = document.createElement('a');
            a.className = 'page-link';
            a.href = '#';
            a.innerText = i;
            
            a.addEventListener('click', (e) => {
                e.preventDefault();
                updatePage(i);
            });

            li.appendChild(a);
            paginationContainer.insertBefore(li, btnNext);
        }

        if (curPage === 1) btnPrev.classList.add('disabled');
        else btnPrev.classList.remove('disabled');

        if (curPage === pageCount || pageCount === 0) btnNext.classList.add('disabled');
        else btnNext.classList.remove('disabled');
    }

    function updatePage(newPage) {
        const pageCount = Math.ceil(rows.length / rowsPerPage);
        if (newPage < 1 || newPage > pageCount) return;
        currentPage = newPage;
        displayRows(currentPage, rowsPerPage);
    }

    btnPrev.onclick = (e) => { e.preventDefault(); updatePage(currentPage - 1); };
    btnNext.onclick = (e) => { e.preventDefault(); updatePage(currentPage + 1); };
    rowsPerPageSelect.onchange = (e) => {
        rowsPerPage = parseInt(e.target.value);
        currentPage = 1;
        displayRows(currentPage, rowsPerPage);
    };

    displayRows(currentPage, rowsPerPage);
}

function initTableSearch(inputId, buttonId, tableBodyId) {
    const searchInput = document.getElementById(inputId);
    const searchBtn = document.getElementById(buttonId);
    const tableBody = document.getElementById(tableBodyId);

    if (!searchInput || !tableBody) return;

    const rows = Array.from(tableBody.querySelectorAll('tr'));

    function executeSearch() {
        const filter = searchInput.value.toLowerCase();
        let hasVisibleRow = false;

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(filter)) {
                row.style.display = '';
                hasVisibleRow = true;
            } else {
                row.style.display = 'none';
            }
        });

        let noResultRow = document.getElementById(`no-result-${tableBodyId}`);

        if (!hasVisibleRow) {
            if (!noResultRow) {
                noResultRow = document.createElement('tr');
                noResultRow.id = `no-result-${tableBodyId}`;
                noResultRow.innerHTML = '<td colspan="4" class="text-center">Não encontramos nada correspondente à pesquisa.</td>';
                tableBody.appendChild(noResultRow);
            } else {
                noResultRow.style.display = '';
            }
        } else {
            if (noResultRow) {
                noResultRow.style.display = 'none';
            }
        }
    }

    searchInput.addEventListener('keyup', executeSearch);

    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            executeSearch();
        });
    }
}