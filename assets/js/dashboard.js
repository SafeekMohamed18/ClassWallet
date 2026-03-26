// ClassWallet Dashboard Module
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
            // Load summary data
            const summary = await this.fetchSummaryData();
            this.updateSummaryCards(summary);

            // Load chart data
            const chartData = await this.fetchChartData();
            this.updateChart(chartData);

            // Load recent transactions
            const transactions = await this.fetchRecentTransactions();
            this.updateRecentTransactions(transactions);

            // Load monthly overview
            this.loadMonthlyOverview();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    async fetchSummaryData() {
        // Mock data - replace with actual API call to Google Sheets
        return {
            totalBalance: 2500.00,
            monthlyIncome: 1200.00,
            monthlyExpenses: 450.00,
            paidStudents: 28,
            totalStudents: 35
        };
    }

    async fetchChartData() {
        // Mock data - replace with actual API call
        return {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            income: [1000, 1100, 1200, 1150, 1300, 1200],
            expenses: [400, 350, 450, 500, 425, 450]
        };
    }

    async fetchRecentTransactions() {
        // Mock data - replace with actual API call
        return [
            {
                date: '2024-01-15',
                type: 'Income',
                description: 'Monthly fund collection - January',
                amount: 1200.00,
                addedBy: 'admin@university.edu'
            },
            {
                date: '2024-01-14',
                type: 'Expense',
                description: 'Class outing expenses',
                amount: -150.00,
                addedBy: 'committee1@university.edu'
            },
            {
                date: '2024-01-13',
                type: 'Income',
                description: 'Late payment - December',
                amount: 50.00,
                addedBy: 'admin@university.edu'
            }
        ];
    }

    updateSummaryCards(data) {
        document.getElementById('total-balance').textContent = `RM ${data.totalBalance.toFixed(2)}`;
        document.getElementById('monthly-income').textContent = `RM ${data.monthlyIncome.toFixed(2)}`;
        document.getElementById('monthly-expenses').textContent = `RM ${data.monthlyExpenses.toFixed(2)}`;
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
                                return 'RM ' + value;
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
                    ${transaction.type === 'Income' ? '+' : ''}RM ${Math.abs(transaction.amount).toFixed(2)}
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
            console.error('Error loading monthly overview:', error);
            this.showError('Failed to load monthly overview');
        }
    }

    async fetchMonthlyOverview(month) {
        // Mock data - replace with actual API call
        return {
            paidStudents: month === 'current' ? 28 : 32,
            totalStudents: 35,
            pendingPayments: month === 'current' ? 7 : 3,
            totalIncome: month === 'current' ? 1200 : 1350,
            totalExpenses: month === 'current' ? 450 : 520
        };
    }

    updateMonthlyOverview(data) {
        const overviewDiv = document.getElementById('monthly-overview');
        overviewDiv.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>Payment Status</h6>
                    <p class="mb-1">Paid: <strong>${data.paidStudents}/${data.totalStudents}</strong></p>
                    <p class="mb-1">Pending: <strong>${data.pendingPayments}</strong></p>
                </div>
                <div class="col-md-6">
                    <h6>Financial Summary</h6>
                    <p class="mb-1 text-success">Income: <strong>RM ${data.totalIncome.toFixed(2)}</strong></p>
                    <p class="mb-1 text-danger">Expenses: <strong>RM ${data.totalExpenses.toFixed(2)}</strong></p>
                    <p class="mb-0">Net: <strong class="${data.totalIncome - data.totalExpenses >= 0 ? 'text-success' : 'text-danger'}">
                        RM ${(data.totalIncome - data.totalExpenses).toFixed(2)}
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