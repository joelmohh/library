/*document.addEventListener('DOMContentLoaded', () => {
    const forms = ['book', 'user', 'lending', 'category'];

    forms.forEach(type => {
        const modalElement = document.getElementById(`${type}Modal`);
        if (!modalElement) return;

        modalElement.addEventListener('show.bs.modal', event => {
            const button = event.relatedTarget;
            const isEdit = button.classList.contains('btn-edit');
            const form = modalElement.querySelector('form');
            const modalTitle = modalElement.querySelector('.modal-title');

            form.reset();

            if (isEdit) {
                const item = JSON.parse(button.getAttribute('data-bs-item'));
                modalTitle.textContent = `Editar ${type.charAt(0).toUpperCase() + type.slice(1)}`;

                Object.keys(item).forEach(key => {
                    const input = form.querySelector(`[name="${key}"]`);
                    if (input) input.value = item[key];
                });

                let idInput = form.querySelector('[name="id"]');
                if (!idInput) {
                    idInput = document.createElement('input');
                    idInput.type = 'hidden';
                    idInput.name = 'id';
                    form.appendChild(idInput);
                }
                idInput.value = item._id;

                form.dataset.mode = 'update';
            } else {
                modalTitle.textContent = `Novo ${type.charAt(0).toUpperCase() + type.slice(1)}`;
                form.dataset.mode = 'add';
                const idInput = form.querySelector('[name="id"]');
                if (idInput) idInput.value = '';
            }
        });
    });

    document.addEventListener('submit', async (e) => {
        const form = e.target;
        if (!form.id.endsWith('Form')) return;

        e.preventDefault();
        const type = form.id.replace('Form', ''); 
        const mode = form.dataset.mode; 

        let endpoint = `/api/${type}s/${mode}`;
        if (type === 'lending') endpoint = `/api/lending/${mode === 'add' ? 'create' : 'extend'}`;
        if (type === 'category') endpoint = `/api/categories/${mode}`;

        const formData = Object.fromEntries(new FormData(form));

        if (mode === 'update') {
            formData[`${type}Id`] = formData.id;
        }

        try {
            const response = await fetch(endpoint, {
                method: mode === 'update' ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (response.ok) {
                location.reload();
            } else {
                showToast(result.message || 'Erro ao processar', 'error');
            }
        } catch (err) {
            showToast('Erro de conexão com o servidor', 'error');
        }
    });

    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('.btn-delete');
        if (!btn) return;

        const id = btn.dataset.id;
        const type = btn.dataset.type;

        if (!confirm('Tem certeza que deseja excluir?')) return;

        let endpoint = `/api/${type}s/delete`;
        if (type === 'lending') endpoint = `/api/lending/delete`;
        if (type === 'category') endpoint = `/api/categories/delete`;

        try {
            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [`${type}Id`]: id })
            });

            if (response.ok) {
                location.reload();
            } else {
                const result = await response.json();
                showToast(result.message || 'Erro ao deletar', 'error');
            }
        } catch (err) {
            showToast('Erro de conexão', 'error');
        }
    });
});*/