// Dropdown Menu Functionality
document.addEventListener('DOMContentLoaded', () => {
    const dropdownToggles = document.querySelectorAll('.dToggle');
    const dropdownMenus = document.querySelectorAll('.dMenu');

    if (dropdownToggles.length > 0) {
        dropdownToggles.forEach((toggle, index) => {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenus.forEach((menu, i) => {
                    if (i !== index) menu.classList.remove('show');
                });
                dropdownToggles.forEach((t, i) => {
                    if (i !== index) t.classList.remove('active');
                });

                dropdownMenus[index].classList.toggle('show');
                toggle.classList.toggle('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown-container')) {
                dropdownMenus.forEach(menu => menu.classList.remove('show'));
                dropdownToggles.forEach(toggle => toggle.classList.remove('active'));
            }
        });
    }
});
/*

async function getLoansData() {
    try {
        const response = await fetch('/api/lendings/list');
        const data = await response.json();
        if (data.status === 'success') {
            return data.data;
        } else {
            console.error('Failed to fetch loans data:', data.message);
            showToast('Failed to load loans data', 'error');
            return null;
        }
    } catch (error) {
        console.error('Error fetching loans data:', error);
        return null;
    }
}

// Dashboard Graph
const lendings = await JSON.parse(getLoansData());

    const ctx = document
        .getElementById("loansHistoryChart")
        .getContext("2d");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: lendings.byDays.labels,
            datasets: [{
                label: "Empréstimos",
                data: lendings.byDays.data,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });*/