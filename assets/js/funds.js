// ClassWallet Funds Management Module
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
        // Mock data - replace with actual API call
        return [
            { id: 1, name: 'Ahmad bin Abdullah', regNo: 'CS001' },
            { id: 2, name: 'Siti Nurhaliza', regNo: 'CS002' },
            { id: 3, name: 'Raj Kumar', regNo: 'CS003' }
        ];
    }

    async fetchTransactions() {
        // Mock data - replace with actual API call
        return [
            {
                id: 1,
                type: 'Income',
                amount: 1200.00,
                description: 'Monthly fund collection - January',
                student: null,
                addedBy: 'admin@university.edu',
                date: '2024-01-15T10:30:00Z'
            },
            {
                id: 2,
                type: 'Expense',
                amount: -150.00,
                description: 'Class outing expenses',
                student: null,
                addedBy: 'committee1@university.edu',
                date: '2024-01-14T14:20:00Z'
            },
            {
                id: 3,
                type: 'Income',
                amount: 50.00,
                description: 'Late payment - December',
                student: 'Ahmad bin Abdullah',
                addedBy: 'admin@university.edu',
                date: '2024-01-13T09:15:00Z'
            }
        ];
    }

    populateStudentDropdown() {
        const dropdown = document.getElementById('income-student');
        if (!dropdown) return;

        dropdown.innerHTML = '<option value="">Select student...</option>';
        this.students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = `${student.name} (${student.regNo})`;
            dropdown.appendChild(option);
        });
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
                    ${transaction.type === 'Income' ? '+' : ''}RM ${Math.abs(transaction.amount).toFixed(2)}
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

        const amount = parseFloat(document.getElementById('income-amount').value);
        const description = document.getElementById('income-description').value;
        const studentId = document.getElementById('income-student').value;
        const date = document.getElementById('income-date').value;

        const studentName = studentId ? this.students.find(s => s.id == studentId)?.name : null;

        const transactionData = {
            type: 'Income',
            amount: amount,
            description: description,
            student: studentName,
            date: new Date(date).toISOString(),
            addedBy: window.authManager.getCurrentUser().email
        };

        try {
            // Mock API call - replace with actual save to Google Sheets
            const newTransaction = await this.saveTransactionToAPI(transactionData);
            this.transactions.unshift(newTransaction); // Add to beginning
            this.filteredTransactions = [...this.transactions];
            this.renderTransactions();

            // Close modal and reset form
            bootstrap.Modal.getInstance(document.getElementById('addIncomeModal')).hide();
            form.reset();

            this.showSuccess('Income recorded successfully');
        } catch (error) {
            console.error('Error saving income:', error);
            this.showError('Failed to save income');
        }
    }

    async saveExpense() {
        const form = document.getElementById('add-expense-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const amount = parseFloat(document.getElementById('expense-amount').value);
        const description = document.getElementById('expense-description').value;
        const date = document.getElementById('expense-date').value;

        const transactionData = {
            type: 'Expense',
            amount: -amount, // Negative for expenses
            description: description,
            student: null,
            date: new Date(date).toISOString(),
            addedBy: window.authManager.getCurrentUser().email
        };

        try {
            // Mock API call - replace with actual save to Google Sheets
            const newTransaction = await this.saveTransactionToAPI(transactionData);
            this.transactions.unshift(newTransaction); // Add to beginning
            this.filteredTransactions = [...this.transactions];
            this.renderTransactions();

            // Close modal and reset form
            bootstrap.Modal.getInstance(document.getElementById('addExpenseModal')).hide();
            form.reset();

            this.showSuccess('Expense recorded successfully');
        } catch (error) {
            console.error('Error saving expense:', error);
            this.showError('Failed to save expense');
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
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            id: Date.now(), // Simple ID generation
            ...data
        };
    }

    async deleteTransactionFromAPI(id) {
        await new Promise(resolve => setTimeout(resolve, 500));
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