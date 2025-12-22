/**
 * Sistema integrado de paginação, busca e filtros para tabelas
 * @param {string} tableBodyId - The ID of the table's <tbody>
 * @param {string} rowsSelectId - The ID of the <select> for items per page
 * @param {string} paginationId - The ID of the <ul> where the page numbers are located
 * @param {string} prevBtnId - The ID of the "Previous" button
 * @param {string} nextBtnId - The ID of the "Next" button
 */
function initTablePagination(tableBodyId, rowsSelectId, paginationId, prevBtnId, nextBtnId) {
    const tableBody = document.getElementById(tableBodyId);
    if (!tableBody) return; 

    const allRows = Array.from(tableBody.querySelectorAll('tr.item')); 
    const rowsPerPageSelect = document.getElementById(rowsSelectId);
    const paginationContainer = document.getElementById(paginationId);
    const btnPrev = document.getElementById(prevBtnId);
    const btnNext = document.getElementById(nextBtnId);

    let currentPage = 1;
    let rowsPerPage = parseInt(rowsPerPageSelect.value);
    let filteredRows = [...allRows]; // Rows after search/filter

    // Função para obter linhas visíveis baseado nos filtros ativos
    function getVisibleRows() {
        return allRows.filter(row => {
            const display = row.style.display;
            return display === '' || display === 'table-row';
        });
    }

    function displayRows(page, perPage) {
        filteredRows = getVisibleRows();
        const start = (page - 1) * perPage;
        const end = start + perPage;

        // Esconde todas as linhas primeiro
        allRows.forEach(row => {
            if (filteredRows.includes(row)) {
                row.style.display = 'none';
            }
        });

        // Mostra apenas as linhas da página atual
        filteredRows.forEach((row, index) => {
            if (index >= start && index < end) {
                row.style.display = ''; 
            }
        });

        // Atualiza mensagem de "nenhum resultado"
        updateNoResultMessage();
        
        setupPaginationButtons(filteredRows.length, perPage, page);
    }

    function updateNoResultMessage() {
        let noResultRow = document.getElementById(`no-result-${tableBodyId}`);
        const visibleDataRows = filteredRows.length;

        if (visibleDataRows === 0) {
            if (!noResultRow) {
                noResultRow = document.createElement('tr');
                noResultRow.id = `no-result-${tableBodyId}`;
                noResultRow.innerHTML = '<td colspan="4" class="text-center">Nenhum livro encontrado.</td>';
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

    function setupPaginationButtons(totalItems, perPage, curPage) {
        const existingNumbers = paginationContainer.querySelectorAll('.generated-page-item');
        existingNumbers.forEach(el => el.remove());

        const pageCount = Math.ceil(totalItems / perPage) || 1;
        
        // Só mostra números de página se houver itens
        if (totalItems > 0) {
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
        }

        if (curPage === 1 || totalItems === 0) btnPrev.classList.add('disabled');
        else btnPrev.classList.remove('disabled');

        if (curPage === pageCount || totalItems === 0) btnNext.classList.add('disabled');
        else btnNext.classList.remove('disabled');
    }

    function updatePage(newPage) {
        const visibleRows = getVisibleRows();
        const pageCount = Math.ceil(visibleRows.length / rowsPerPage) || 1;
        if (newPage < 1 || newPage > pageCount) return;
        currentPage = newPage;
        displayRows(currentPage, rowsPerPage);
    }

    function refresh() {
        currentPage = 1;
        displayRows(currentPage, rowsPerPage);
    }

    btnPrev.onclick = (e) => { e.preventDefault(); updatePage(currentPage - 1); };
    btnNext.onclick = (e) => { e.preventDefault(); updatePage(currentPage + 1); };
    rowsPerPageSelect.onchange = (e) => {
        rowsPerPage = parseInt(e.target.value);
        currentPage = 1;
        displayRows(currentPage, rowsPerPage);
    };

    // Expõe a função de refresh globalmente para ser chamada pelos filtros
    window.refreshPagination = refresh;

    displayRows(currentPage, rowsPerPage);
}

function initTableSearch(inputId, buttonId, tableBodyId) {
    const searchInput = document.getElementById(inputId);
    const searchBtn = document.getElementById(buttonId);
    const tableBody = document.getElementById(tableBodyId);

    if (!searchInput || !tableBody) return;

    const rows = Array.from(tableBody.querySelectorAll('tr.item'));

    function executeSearch() {
        const filter = searchInput.value.toLowerCase();

        rows.forEach(row => {
            // Pega apenas o texto das células (ignora elementos hidden)
            const cells = row.querySelectorAll('td');
            let text = '';
            cells.forEach(cell => {
                text += cell.textContent.toLowerCase() + ' ';
            });

            // Aplica o filtro de busca
            if (text.includes(filter)) {
                row.classList.remove('hidden-by-search');
            } else {
                row.classList.add('hidden-by-search');
            }
        });

        // Atualiza a visualização considerando outros filtros
        applyAllFilters();
    }

    searchInput.addEventListener('keyup', executeSearch);

    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            executeSearch();
        });
    }

    // Executa busca inicial se houver valor
    if (searchInput.value) {
        executeSearch();
    }
}

function initAvailabilityFilter(selectId, tableBodyId) {
    const availabilitySelect = document.getElementById(selectId);
    const tableBody = document.getElementById(tableBodyId);

    if (!availabilitySelect || !tableBody) return;

    const rows = Array.from(tableBody.querySelectorAll('tr.item'));

    function applyFilter() {
        const filterValue = availabilitySelect.value.toLowerCase();

        rows.forEach(row => {
            const availabilityCell = row.querySelector('td:nth-child(4)'); // 4ª coluna = Availability
            
            if (!availabilityCell) return;

            const cellText = availabilityCell.textContent.toLowerCase();
            const isAvailable = cellText.includes('available') && !cellText.includes('not available');
            
            let shouldShow = true;

            if (filterValue === 'available') {
                shouldShow = isAvailable;
            } else if (filterValue === 'unavailable') {
                shouldShow = !isAvailable;
            }

            if (shouldShow) {
                row.classList.remove('hidden-by-availability');
            } else {
                row.classList.add('hidden-by-availability');
            }
        });

        // Atualiza a visualização considerando outros filtros
        applyAllFilters();
    }

    availabilitySelect.addEventListener('change', applyFilter);
}

// Função global que aplica todos os filtros e atualiza a paginação
function applyAllFilters() {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;

    const rows = Array.from(tableBody.querySelectorAll('tr.item'));

    rows.forEach(row => {
        const hiddenBySearch = row.classList.contains('hidden-by-search');
        const hiddenByAvailability = row.classList.contains('hidden-by-availability');

        if (hiddenBySearch || hiddenByAvailability) {
            row.style.display = 'none';
        } else {
            row.style.display = '';
        }
    });

    // Atualiza a paginação
    if (typeof window.refreshPagination === 'function') {
        window.refreshPagination();
    }
}