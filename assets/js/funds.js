// ClassWallet Funds Management Module
const API_URL = 'https://script.google.com/macros/s/AKfycbzHbdwhN1bwCsGDn5gFjne1vN99ZJjUO-9r1MW1LPlFpHv7uJNmYCPc_PNFe0JuAQPj/exec';

class FundsManager {
    constructor() {
        this.transactions = [];
        this.filteredTransactions = [];
        this.students = [];
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.setDefaultDates();
        this.initializeSelect();
    }

    initializeSelect() {
        // Initialize Tom Select for searchable dropdown
        setTimeout(() => {
            if (document.getElementById('income-student') && !this.tomSelectInitialized) {
                new TomSelect('#income-student', {
                    maxItems: 1,
                    create: false,
                    placeholder: 'Search student by last 3 digits...',
                    searchField: 'text'
                });
                this.tomSelectInitialized = true;
            }
        }, 100);
    }

    setDefaultDates() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;

        if (document.getElementById('income-date')) document.getElementById('income-date').value = today;
        if (document.getElementById('expense-date')) document.getElementById('expense-date').value = today;
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.filterTransactions();
            });
        }

        // Filter functionality
        const filterSelect = document.getElementById('filter-select');
        if (filterSelect) {
            filterSelect.addEventListener('change', () => {
                this.filterTransactions();
            });
        }

        // Add income form
        const saveIncomeBtn = document.getElementById('save-income-btn');
        if (saveIncomeBtn) {
            saveIncomeBtn.addEventListener('click', () => {
                this.saveIncome();
            });
        }

        // Add expense form
        const saveExpenseBtn = document.getElementById('save-expense-btn');
        if (saveExpenseBtn) {
            saveExpenseBtn.addEventListener('click', () => {
                this.saveExpense();
            });
        }
    }

    async loadData() {
        try {
            // Load students for the income student dropdown
            this.students = await this.fetchStudents();
            this.populateStudentDropdown();

            // Load transactions
            this.transactions = await this.fetchTransactions();
            this.filteredTransactions = [...this.transactions];
            this.renderTransactions();
        } catch (error) {
            console.error('Error loading funds data:', error);
            this.showError('Failed to load funds data');
        }
    }

    async fetchStudents() {
        const response = await fetch(`${API_URL}?action=getStudents`);
        const result = await response.json();
        return result.data || [];
    }

    async fetchTransactions() {
        const response = await fetch(`${API_URL}?action=getTransactions`);
        const result = await response.json();
        return result.data || [];
    }

    populateStudentDropdown() {
        const dropdown = document.getElementById('income-student');
        if (!dropdown) return;

        // Sort students by last 3 digits of registration number
        const sortedStudents = [...this.students].sort((a, b) => {
            const lastThreeA = a.regNo.slice(-3);
            const lastThreeB = b.regNo.slice(-3);
            return lastThreeA.localeCompare(lastThreeB);
        });

        dropdown.innerHTML = '<option value="">Select student...</option>';
        sortedStudents.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            const lastThreeDigits = student.regNo.slice(-3);
            option.textContent = lastThreeDigits;
            dropdown.appendChild(option);
        });

        // Reinitialize Tom Select after populating
        this.initializeSelect();
    }

    filterTransactions() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const filterValue = document.getElementById('filter-select').value;

        this.filteredTransactions = this.transactions.filter(transaction => {
            const matchesSearch = transaction.description.toLowerCase().includes(searchTerm) ||
                                (transaction.student && transaction.student.toLowerCase().includes(searchTerm)) ||
                                transaction.addedBy.toLowerCase().includes(searchTerm);

            let matchesFilter = true;
            if (filterValue === 'income') {
                matchesFilter = transaction.type === 'Income';
            } else if (filterValue === 'expense') {
                matchesFilter = transaction.type === 'Expense';
            }

            return matchesSearch && matchesFilter;
        });

        this.renderTransactions();
    }

    renderTransactions() {
        const tbody = document.querySelector('#transactions-table tbody');
        tbody.innerHTML = '';

        if (this.filteredTransactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No transactions found</td></tr>';
            return;
        }

        this.filteredTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatDate(transaction.date)}</td>
                <td>
                    <span class="badge ${transaction.type === 'Income' ? 'bg-success' : 'bg-danger'}">
                        ${transaction.type}
                    </span>
                </td>
                <td>${transaction.description}</td>
                <td>${transaction.student || '-'}</td>
                <td class="${transaction.type === 'Income' ? 'text-success' : 'text-danger'}">
                    ${transaction.type === 'Income' ? '+' : ''}Rs ${Math.abs(transaction.amount).toFixed(2)}
                </td>
                <td>${transaction.addedBy}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="fundsManager.deleteTransaction(${transaction.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async saveIncome() {
        const form = document.getElementById('add-income-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const saveBtn = document.getElementById('save-income-btn');
        const originalBtnHtml = saveBtn.innerHTML;

        const amount = parseFloat(document.getElementById('income-amount').value);
        const description = document.getElementById('income-description').value;
        const studentId = document.getElementById('income-student').value;
        const date = document.getElementById('income-date').value;

        const studentRegNo = studentId ? this.students.find(s => s.id == studentId)?.regNo : null;

        // Combine selected date with current system time to avoid the "5:30 AM" issue
        const now = new Date();
        const dateParts = date.split('-');
        const transactionDate = new Date(
            dateParts[0], 
            dateParts[1] - 1, 
            dateParts[2], 
            now.getHours(), 
            now.getMinutes(), 
            now.getSeconds()
        );

        const transactionData = {
            type: 'Income',
            amount: amount,
            description: description,
            student: studentRegNo,
            date: transactionDate.toISOString(),
            addedBy: window.authManager.getCurrentUser().email
        };

        try {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Saving...';

            // Mock API call - replace with actual save to Google Sheets
            const newTransaction = await this.saveTransactionToAPI(transactionData);
            this.transactions.unshift(newTransaction); // Add to beginning
            this.filteredTransactions = [...this.transactions];
            this.renderTransactions();

            // Close modal and reset form
            bootstrap.Modal.getInstance(document.getElementById('addIncomeModal')).hide();
            form.reset();
            this.setDefaultDates();

            this.showSuccess('Income recorded successfully');
        } catch (error) {
            console.error('Error saving income:', error);
            this.showError('Failed to save income');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalBtnHtml;
        }
    }

    async saveExpense() {
        const form = document.getElementById('add-expense-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const saveBtn = document.getElementById('save-expense-btn');
        const originalBtnHtml = saveBtn.innerHTML;

        const amount = parseFloat(document.getElementById('expense-amount').value);
        const description = document.getElementById('expense-description').value;
        const date = document.getElementById('expense-date').value;

        // Combine selected date with current system time to avoid the "5:30 AM" issue
        const now = new Date();
        const dateParts = date.split('-');
        const transactionDate = new Date(
            dateParts[0], 
            dateParts[1] - 1, 
            dateParts[2], 
            now.getHours(), 
            now.getMinutes(), 
            now.getSeconds()
        );

        const transactionData = {
            type: 'Expense',
            amount: -amount, // Negative for expenses
            description: description,
            student: null,
            date: transactionDate.toISOString(),
            addedBy: window.authManager.getCurrentUser().email
        };

        try {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Saving...';

            // Mock API call - replace with actual save to Google Sheets
            const newTransaction = await this.saveTransactionToAPI(transactionData);
            this.transactions.unshift(newTransaction); // Add to beginning
            this.filteredTransactions = [...this.transactions];
            this.renderTransactions();

            // Close modal and reset form
            bootstrap.Modal.getInstance(document.getElementById('addExpenseModal')).hide();
            form.reset();
            this.setDefaultDates();

            this.showSuccess('Expense recorded successfully');
        } catch (error) {
            console.error('Error saving expense:', error);
            this.showError('Failed to save expense');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalBtnHtml;
        }
    }

    async deleteTransaction(id) {
        if (!confirm('Are you sure you want to delete this transaction?')) {
            return;
        }

        try {
            // Mock API call - replace with actual delete from Google Sheets
            await this.deleteTransactionFromAPI(id);

            // Remove from local data
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.filteredTransactions = [...this.transactions];
            this.renderTransactions();

            this.showSuccess('Transaction deleted successfully');
        } catch (error) {
            console.error('Error deleting transaction:', error);
            this.showError('Failed to delete transaction');
        }
    }

    // Mock API methods - replace with actual Google Apps Script calls
    async saveTransactionToAPI(data) {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'addTransaction', transaction: data })
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        return { id: Date.now(), ...data };
    }

    async deleteTransactionFromAPI(id) {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'deleteTransaction', transactionId: id })
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-MY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    showSuccess(message) {
        // Simple success message - could be enhanced with toast notifications
        alert(message);
    }

    showError(message) {
        alert(message);
    }
}

// Initialize funds manager when DOM is loaded and user is authenticated
document.addEventListener('DOMContentLoaded', function() {
    // Wait for auth to be ready
    const checkAuth = setInterval(() => {
        if (window.authManager && window.authManager.isAuthenticated()) {
            clearInterval(checkAuth);
            window.fundsManager = new FundsManager();
        }
    }, 100);
});