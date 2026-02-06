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