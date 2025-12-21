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
function dimissToast(toast) {
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
