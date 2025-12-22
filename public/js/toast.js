function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.classList.add('toast', `toast-${type}`);
    toast.innerHTML = `
        <span>${message}</span>
        <i class="fa-solid fa-xmark toast-close"></i>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }, duration);
}
function dismissToast(toast) {
    toast.classList.add('fade-out');
    toast.addEventListener('transitionend', () => {
        toast.remove();
    });
}
document.addEventListener('DOMContentLoaded', () => {
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
    
    if (toastContainer) {
        toastContainer.addEventListener('click', (e) => {
            const clickedToast = e.target.closest('.toast');
            if (e.target.classList.contains('toast-close')) {
                dismissToast(clickedToast);
            } 
            else if (clickedToast) {
                 dismissToast(clickedToast);
            }
        });
    }
});
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return null;
}
function setCookie(name, value, minutes) {
    let expires = '';
    if (minutes) {
        const date = new Date();
        date.setTime(date.getTime() + minutes * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/';
}
function deleteCookie(name) {
    document.cookie = `${name}=; Max-Age=0; path=/`;
}

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');

    if (!status) return;

    const messages = {
        success: 'Operação realizada com sucesso!',
        error: 'Ocorreu um erro ao realizar a operação.'
    };

    const message = getCookie('message') || messages[status];

    if (messages[status]) {
        showToast(message, status);
        deleteCookie('message');

        history.replaceState({}, '', window.location.pathname);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('hidden.bs.modal', function (event) {
        const modal = event.target;
        const forms = modal.querySelectorAll('form');

        forms.forEach(form => {
            form.reset();
        });
    });
});
