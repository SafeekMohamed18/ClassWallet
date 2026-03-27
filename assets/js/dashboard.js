// ClassWallet Dashboard Module
const API_URL = 'https://script.google.com/macros/s/AKfycbzHbdwhN1bwCsGDn5gFjne1vN99ZJjUO-9r1MW1LPlFpHv7uJNmYCPc_PNFe0JuAQPj/exec';

class DashboardManager {
    constructor() {
        this.chart = null;
        this.init();
    }

    init() {
        this.loadDashboardData();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const monthSelect = document.getElementById('month-select');
        if (monthSelect) {
            monthSelect.addEventListener('change', () => {
                this.loadMonthlyOverview();
            });
        }
    }

    async loadDashboardData() {
        try {
            // Fetch all dashboard data in one call
            const response = await fetch(`${API_URL}?action=getDashboardData`);
            const result = await response.json();
            if (!result.success) throw new Error(result.error);
            const data = result.data;

            // Update all dashboard components
            this.updateSummaryCards(data);
            this.updateChart(data.chartData || { labels: [], income: [], expenses: [] });
            this.updateMonthlyOverview(data);

            // Fetch and update recent transactions (separate endpoint)
            const transactions = await this.fetchRecentTransactions();
            this.updateRecentTransactions(transactions);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
        }
    }


    async fetchRecentTransactions() {
        const response = await fetch(`${API_URL}?action=getTransactions`);
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        return result.data.slice(0, 5); // Return only latest 5
    }

    updateSummaryCards(data) {
        document.getElementById('total-balance').textContent = `Rs ${data.totalBalance.toFixed(2)}`;
        document.getElementById('monthly-income').textContent = `Rs ${data.monthlyIncome.toFixed(2)}`;
        document.getElementById('monthly-expenses').textContent = `Rs ${data.monthlyExpenses.toFixed(2)}`;
        document.getElementById('paid-students').textContent = `${data.paidStudents}/${data.totalStudents}`;
    }

    updateChart(data) {
        const ctx = document.getElementById('incomeExpenseChart').getContext('2d');

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Income',
                    data: data.income,
                    borderColor: '#2DBE60',
                    backgroundColor: 'rgba(45, 190, 96, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Expenses',
                    data: data.expenses,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'Rs ' + value;
                            }
                        }
                    }
                }
            }
        });
    }

    updateRecentTransactions(transactions) {
        const tbody = document.querySelector('#recent-transactions tbody');
        tbody.innerHTML = '';

        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatDate(transaction.date)}</td>
                <td>
                    <span class="badge ${transaction.type === 'Income' ? 'bg-success' : 'bg-danger'}">
                        ${transaction.type}
                    </span>
                </td>
                <td>${transaction.description}</td>
                <td class="${transaction.type === 'Income' ? 'text-success' : 'text-danger'}">
                    ${transaction.type === 'Income' ? '+' : ''}Rs ${Math.abs(transaction.amount).toFixed(2)}
                </td>
                <td>${transaction.addedBy}</td>
            `;
            tbody.appendChild(row);
        });
    }

    async loadMonthlyOverview() {
        const monthSelect = document.getElementById('month-select');
        const selectedMonth = monthSelect ? monthSelect.value : 'current';

        try {
            const overview = await this.fetchMonthlyOverview(selectedMonth);
            this.updateMonthlyOverview(overview);
        } catch (error) {
            console.error('Detailed error loading monthly overview:', error);
            this.showError('Failed to load monthly overview: ' + error.message);
        }
    }

    async fetchMonthlyOverview(month) {
        const response = await fetch(`${API_URL}?action=getDashboardData&month=${month}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        return result.data;
    }

    updateMonthlyOverview(data) {
        const overviewDiv = document.getElementById('monthly-overview');
        
        const income = data.monthlyIncome || 0;
        const expenses = data.monthlyExpenses || 0;
        const totalStudents = data.totalStudents || 0;
        const paidStudents = data.paidStudents || 0;
        const pending = totalStudents - paidStudents;

        overviewDiv.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6 class="text-muted mb-2">Payment Status</h6>
                    <p class="mb-1">Paid: <span class="badge bg-success">${paidStudents} / ${totalStudents}</span></p>
                    <p class="mb-1">Pending: <span class="badge bg-warning text-dark">${pending}</span></p>
                </div>
                <div class="col-md-6">
                    <h6 class="text-muted mb-2">Financial Summary</h6>
                    <p class="mb-1 text-success">Income: <strong>Rs ${income.toFixed(2)}</strong></p>
                    <p class="mb-1 text-danger">Expenses: <strong>Rs ${expenses.toFixed(2)}</strong></p>
                    <p class="mb-0 border-top pt-1 mt-1">Net: <strong class="${income - expenses >= 0 ? 'text-success' : 'text-danger'}">
                        Rs ${(income - expenses).toFixed(2)}
                    </strong></p>
                </div>
            </div>
        `;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-MY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showError(message) {
        // Simple error display - could be enhanced with toast notifications
        console.error(message);
        alert(message);
    }
}

// Initialize dashboard when DOM is loaded and user is authenticated
document.addEventListener('DOMContentLoaded', function() {
    // Wait for auth to be ready
    const checkAuth = setInterval(() => {
        if (window.authManager && window.authManager.isAuthenticated()) {
            clearInterval(checkAuth);
            window.dashboardManager = new DashboardManager();
        }
    }, 100);
});