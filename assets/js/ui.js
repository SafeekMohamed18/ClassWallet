// Global UI helpers for notifications
window.showToast = (message, type = 'success', delay = 3000) => {
    const container = document.getElementById('toast-container');
    if (!container) {
        console.warn('Toast container not found. Please add a toast container with id="toast-container"');
        return;
    }

    const alertType = type === 'error' || type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : 'success';
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-bg-${alertType} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    container.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast, { delay });
    bsToast.show();

    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
};

window.showInfoModal = (title, htmlContent) => {
    let modalEl = document.getElementById('app-info-modal');
    if (!modalEl) {
        modalEl = document.createElement('div');
        modalEl.className = 'modal fade';
        modalEl.id = 'app-info-modal';
        modalEl.tabIndex = -1;
        modalEl.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">${htmlContent}</div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalEl);
    } else {
        modalEl.querySelector('.modal-title').textContent = title;
        modalEl.querySelector('.modal-body').innerHTML = htmlContent;
    }

    const infoModal = new bootstrap.Modal(modalEl);
    infoModal.show();
};
