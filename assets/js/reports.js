// ClassWallet Reports Module
const API_URL = 'https://script.google.com/macros/s/AKfycbzHbdwhN1bwCsGDn5gFjne1vN99ZJjUO-9r1MW1LPlFpHv7uJNmYCPc_PNFe0JuAQPj/exec';

class ReportsManager {
    constructor() {
        this.incomeChart = null;
        this.expenseChart = null;
        this.reports = [];
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        this.init();
    }

    // Cache utility functions
    setCache(key, data) {
        const cacheData = {
            data: data,
            timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(cacheData));
    }

    getCache(key) {
        const cached = localStorage.getItem(key);
        if (!cached) return null;
        
        const cacheData = JSON.parse(cached);
        if (Date.now() - cacheData.timestamp > this.cacheExpiry) {
            localStorage.removeItem(key);
            return null;
        }
        return cacheData.data;
    }

    init() {
        this.setDefaultMonth();
        this.loadReportData();
        this.setupEventListeners();
    }

    setDefaultMonth() {
        const monthInput = document.getElementById('report-month');
        if (monthInput) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            monthInput.value = `${year}-${month}`;
        }
    }

    setupEventListeners() {
        // Generate report button
        const generateBtn = document.getElementById('generate-report-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateReport();
            });
        }

        // Preview report button
        const previewBtn = document.getElementById('preview-report-btn');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                this.previewReport();
            });
        }

        // Download PDF button
        const downloadBtn = document.getElementById('download-pdf-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadPDF();
            });
        }
    }

    async loadReportData() {
        try {
            // Load cached data first
            const cachedStats = this.getCache('dashboardData');
            const cachedTransactions = this.getCache('recentTransactions');
            
            if (cachedStats) {
                this.updateStats(cachedStats);
            }
            if (cachedTransactions) {
                this.updateCharts({ transactions: cachedTransactions });
            }

            // Load summary stats
            const stats = await this.fetchStats();
            this.setCache('dashboardData', stats);
            this.updateStats(stats);

            // Load chart data
            const chartData = await this.fetchChartData();
            this.setCache('recentTransactions', chartData);
            this.updateCharts(chartData);

            // Load recent reports
            this.loadRecentReports();
        } catch (error) {
            console.error('Error loading report data:', error);
            if (!cachedStats && !cachedTransactions) {
                this.showError('Failed to load report data');
            }
        }
    }

    async fetchStats() {
        const response = await fetch(`${API_URL}?action=getDashboardData`);
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        return result.data;
    }

    async fetchChartData() {
        const response = await fetch(`${API_URL}?action=getTransactions`);
        const result = await response.json();
        const transactions = result.success ? result.data : [];
        
        const incomeMap = {};
        const expenseMap = {};
        
        transactions.forEach(t => {
            const amount = parseFloat(t.amount) || 0;
            const desc = t.description || 'Other';
            
            if (t.type === 'Income') {
                incomeMap[desc] = (incomeMap[desc] || 0) + amount;
            } else {
                expenseMap[desc] = (expenseMap[desc] || 0) + Math.abs(amount);
            }
        });
        
        return {
            incomeBreakdown: {
                labels: Object.keys(incomeMap).length ? Object.keys(incomeMap) : ['No Data'],
                data: Object.values(incomeMap).length ? Object.values(incomeMap) : [1]
            },
            expenseCategories: {
                labels: Object.keys(expenseMap).length ? Object.keys(expenseMap) : ['No Data'],
                data: Object.values(expenseMap).length ? Object.values(expenseMap) : [1]
            }
        };
    }

    updateStats(stats) {
        document.getElementById('total-students').textContent = stats.totalStudents || 0;
        document.getElementById('paid-this-month').textContent = stats.paidStudents || 0;
        document.getElementById('current-balance').textContent = `Rs ${(stats.totalBalance || 0).toFixed(2)}`;
        document.getElementById('monthly-income-stat').textContent = `Rs ${(stats.monthlyIncome || 0).toFixed(2)}`;
    }

    updateCharts(data) {
        // Income breakdown chart
        const incomeCtx = document.getElementById('incomeBreakdownChart').getContext('2d');
        if (this.incomeChart) {
            this.incomeChart.destroy();
        }
        this.incomeChart = new Chart(incomeCtx, {
            type: 'pie',
            data: {
                labels: data.incomeBreakdown.labels,
                datasets: [{
                    data: data.incomeBreakdown.data,
                    backgroundColor: [
                        '#2DBE60',
                        '#F4C542',
                        '#1E6F9F'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });

        // Expense categories chart
        const expenseCtx = document.getElementById('expenseCategoriesChart').getContext('2d');
        if (this.expenseChart) {
            this.expenseChart.destroy();
        }
        this.expenseChart = new Chart(expenseCtx, {
            type: 'doughnut',
            data: {
                labels: data.expenseCategories.labels,
                datasets: [{
                    data: data.expenseCategories.data,
                    backgroundColor: [
                        '#dc3545',
                        '#fd7e14',
                        '#6f42c1',
                        '#20c997'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }

    loadRecentReports() {
        // Mock recent reports - in real app, this would come from storage
        this.reports = [
            {
                id: 1,
                name: 'January 2024 Financial Report',
                type: 'Monthly Financial Report',
                period: 'January 2024',
                generated: '2024-01-31',
                fileUrl: '#'
            }
        ];
        this.renderRecentReports();
    }

    renderRecentReports() {
        const tbody = document.querySelector('#reports-table tbody');
        tbody.innerHTML = '';

        if (this.reports.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No reports generated yet</td></tr>';
            return;
        }

        this.reports.forEach(report => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${report.name}</td>
                <td>${report.type}</td>
                <td>${report.period}</td>
                <td>${this.formatDate(report.generated)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="reportsManager.downloadReport(${report.id})">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="reportsManager.deleteReport(${report.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async generateReport() {
        const reportType = document.getElementById('report-type').value;
        const reportMonth = document.getElementById('report-month').value;

        const generateBtn = document.getElementById('generate-report-btn');
        const originalText = generateBtn ? generateBtn.innerHTML : '';

        try {
            // Show loading
            if (generateBtn) {
                generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Generating...';
                generateBtn.disabled = true;
            }

            // Mock report generation delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Generate PDF
            await this.createPDF(reportType, reportMonth);
            this.showSuccess('Report generated successfully');
        } catch (error) {
            console.error('Error generating report:', error);
            this.showError('Failed to generate report');
        } finally {
            if (generateBtn) {
                generateBtn.innerHTML = originalText;
                generateBtn.disabled = false;
            }
        }
    }

    async previewReport() {
        const reportType = document.getElementById('report-type').value;
        const reportMonth = document.getElementById('report-month').value;

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('reportPreviewModal'));
        modal.show();

        // Generate preview content
        const previewContent = await this.generateReportPreview(reportType, reportMonth);
        document.getElementById('report-preview-content').innerHTML = previewContent;
    }

    async generateReportPreview(type, month) {
        const [year, monthNum] = month.split('-');
        const monthName = new Date(year, monthNum - 1).toLocaleString('default', { month: 'long' });

        // Fetch real data
        const txResponse = await fetch(`${API_URL}?action=getTransactions`);
        const txResult = await txResponse.json();
        const transactions = txResult.success ? txResult.data : [];

        const statResponse = await fetch(`${API_URL}?action=getDashboardData`);
        const statResult = await statResponse.json();
        const stats = statResult.success ? statResult.data : { totalStudents: 0, paidStudents: 0, totalBalance: 0, monthlyIncome: 0, monthlyExpenses: 0 };
        
        // Filter transactions for the selected month
        const monthTx = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getFullYear() === parseInt(year) && (d.getMonth() + 1) === parseInt(monthNum);
        });
        
        // Calculate paid students for this specific month
        const paidStudentsSet = new Set();
        monthTx.forEach(t => {
            const desc = (t.description || '').toLowerCase();
            if (t.type === 'Income' && (desc.includes('monthly') || desc.includes('special'))) {
                if (t.student) paidStudentsSet.add(t.student.toString().trim());
            }
        });
        const monthPaidCount = paidStudentsSet.size;

        const incomeTx = monthTx.filter(t => t.type === 'Income');
        const expenseTx = monthTx.filter(t => t.type !== 'Income');
        
        // Use either the real balance from stats (if current month) or calculate roughly
        const isCurrentMonth = (new Date().getFullYear() === parseInt(year) && (new Date().getMonth() + 1) === parseInt(monthNum));
        const displayIncome = isCurrentMonth ? (stats.monthlyIncome || 0) : incomeTx.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const displayExpenses = isCurrentMonth ? (stats.monthlyExpenses || 0) : expenseTx.reduce((sum, t) => sum + Math.abs(t.amount), 0);

        let incomeRows = incomeTx.map(t => `<tr><td>${t.date.split('T')[0]}</td><td>${t.description}</td><td class="text-success">+Rs ${Math.abs(t.amount).toFixed(2)}</td></tr>`).join('');
        if (!incomeRows) incomeRows = '<tr><td colspan="3" class="text-center text-muted">No income recorded</td></tr>';
        
        let expenseRows = expenseTx.map(t => `<tr><td>${t.date.split('T')[0]}</td><td>${t.description}</td><td class="text-danger">-Rs ${Math.abs(t.amount).toFixed(2)}</td></tr>`).join('');
        if (!expenseRows) expenseRows = '<tr><td colspan="3" class="text-center text-muted">No expenses recorded</td></tr>';

        return `
            <div class="report-preview">
                <div class="text-center mb-4">
                    <img src="assets/images/Logo.png" alt="ClassWallet Logo" width="80" class="logo-radius mb-3">
                    <h2><span class="brand-class">Class</span><span class="brand-wallet">Wallet</span> Financial Report</h2>
                    <h4>${monthName} ${year}</h4>
                    <p class="text-muted">Generated on ${new Date().toLocaleDateString()}</p>
                </div>

                <div class="row mb-4">
                    <div class="col-md-6">
                        <h5>Summary</h5>
                        <table class="table table-sm">
                            <tr><td>Total Students:</td><td>${stats.totalStudents || 0}</td></tr>
                            <tr><td>Paid Students:</td><td>${monthPaidCount}</td></tr>
                            <tr><td>Unpaid Students:</td><td>${(stats.totalStudents || 0) - monthPaidCount}</td></tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h5>Financial Summary</h5>
                        <table class="table table-sm">
                            <tr><td>Total Net Balance:</td><td><strong class="${stats.totalBalance >= 0 ? 'text-success' : 'text-danger'}">Rs ${(stats.totalBalance || 0).toFixed(2)}</strong></td></tr>
                            <tr><td>Monthly Income:</td><td class="text-success">+Rs ${displayIncome.toFixed(2)}</td></tr>
                            <tr><td>Monthly Expenses:</td><td class="text-danger">-Rs ${displayExpenses.toFixed(2)}</td></tr>
                        </table>
                    </div>
                </div>

                <div class="mb-4">
                    <h5>Income Details</h5>
                    <table class="table table-sm table-striped">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${incomeRows}
                        </tbody>
                    </table>
                </div>

                <div class="mb-4">
                    <h5>Expense Details</h5>
                    <table class="table table-sm table-striped">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${expenseRows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    async createPDF(type, month) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const [year, monthNum] = month.split('-');
        const monthName = new Date(year, monthNum - 1).toLocaleString('default', { month: 'long' });

        const downloadBtn = document.getElementById('download-pdf-btn');
        const originalText = downloadBtn ? downloadBtn.innerHTML : '';

        try {
            // Show loading state on button
            if (downloadBtn) {
                downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Preparing PDF...';
                downloadBtn.disabled = true;
            }

            // Fetch real data
            const [txRes, statRes] = await Promise.all([
                fetch(`${API_URL}?action=getTransactions`),
                fetch(`${API_URL}?action=getDashboardData`)
            ]);
            
            const txResult = await txRes.json();
            const statResult = await statRes.json();
            
            const transactions = txResult.success ? txResult.data : [];
            const stats = statResult.success ? statResult.data : { totalStudents: 0, paidStudents: 0, totalBalance: 0, monthlyIncome: 0, monthlyExpenses: 0 };

            // Filter transactions for the selected month
            const monthTx = transactions.filter(t => {
                const d = new Date(t.date);
                return d.getFullYear() === parseInt(year) && (d.getMonth() + 1) === parseInt(monthNum);
            });
            
            // Calculate paid students for this specific month
            const paidStudentsSet = new Set();
            monthTx.forEach(t => {
                const desc = (t.description || '').toLowerCase();
                if (t.type === 'Income' && (desc.includes('monthly') || desc.includes('special'))) {
                    if (t.student) paidStudentsSet.add(t.student.toString().trim());
                }
            });
            const monthPaidCount = paidStudentsSet.size;

            const incomeTx = monthTx.filter(t => t.type === 'Income');
            const expenseTx = monthTx.filter(t => t.type !== 'Income');
            
            const isCurrentMonth = (new Date().getFullYear() === parseInt(year) && (new Date().getMonth() + 1) === parseInt(monthNum));
            const displayIncome = isCurrentMonth ? (stats.monthlyIncome || 0) : incomeTx.reduce((sum, t) => sum + Math.abs(t.amount), 0);
            const displayExpenses = isCurrentMonth ? (stats.monthlyExpenses || 0) : expenseTx.reduce((sum, t) => sum + Math.abs(t.amount), 0);

            // --- PDF Content ---
            // 1. Header
            try {
                doc.addImage('assets/images/Logo.png', 'PNG', 15, 10, 22, 22);
            } catch (e) { console.warn('Logo not available'); }
            
            doc.setFontSize(22);
            doc.setTextColor(4, 63, 113); // #043F71
            doc.text('Class', 42, 20);
            const classWidth = doc.getTextWidth('Class');
            
            doc.setTextColor(93, 157, 22); // #5D9D16
            doc.text('Wallet', 42 + classWidth, 20);
            const walletWidth = doc.getTextWidth('Wallet');
            
            doc.setTextColor(33, 37, 41);
            doc.text(' Financial Report', 42 + classWidth + walletWidth, 20);
            
            doc.setFontSize(14);
            doc.text(`${monthName} ${year}`, 42, 28);
            
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on ${new Date().toLocaleDateString()}`, 42, 34);

            doc.setDrawColor(200, 200, 200);
            doc.line(15, 40, 195, 40);

            // 2. Summary
            doc.setFontSize(14);
            doc.setTextColor(33, 37, 41);
            doc.text('Summary', 20, 52);
            
            doc.setFontSize(11);
            doc.text([
                `Total Students: ${stats.totalStudents || 0}`,
                `Paid Students: ${monthPaidCount}`,
                `Unpaid Students: ${(stats.totalStudents || 0) - monthPaidCount}`
            ], 20, 60);

            doc.text([
                `Monthly Income: Rs ${displayIncome.toFixed(2)}`,
                `Monthly Expenses: Rs ${displayExpenses.toFixed(2)}`,
                `Closing Balance: Rs ${(stats.totalBalance || 0).toFixed(2)}`
            ], 110, 60);

            // 3. Income Table
            doc.setFontSize(14);
            doc.text('Income Details', 20, 85);
            
            const incomeData = incomeTx.map(t => [
                t.date.split('T')[0], 
                t.description, 
                `Rs ${Math.abs(t.amount).toFixed(2)}`
            ]);

            doc.autoTable({
                startY: 90,
                head: [['Date', 'Description', 'Amount']],
                body: incomeData.length > 0 ? incomeData : [['-', 'No income recorded', '-']],
                headStyles: { fillColor: [45, 190, 96] }, // Success green
                theme: 'striped'
            });

            // 4. Expense Table
            const lastY = doc.lastAutoTable.finalY + 15;
            doc.setFontSize(14);
            doc.text('Expense Details', 20, lastY);
            
            const expenseData = expenseTx.map(t => [
                t.date.split('T')[0], 
                t.description, 
                `Rs ${Math.abs(t.amount).toFixed(2)}`
            ]);

            doc.autoTable({
                startY: lastY + 5,
                head: [['Date', 'Description', 'Amount']],
                body: expenseData.length > 0 ? expenseData : [['-', 'No expenses recorded', '-']],
                headStyles: { fillColor: [220, 53, 69] }, // Danger red
                theme: 'striped'
            });

            // Save PDF
            const fileName = `ClassWallet_Report_${month}.pdf`;
            doc.save(fileName);

            // Add to history
            const newReport = {
                id: Date.now(),
                name: `${this.getReportTypeName(type)} - ${month}`,
                type: this.getReportTypeName(type),
                period: month,
                generated: new Date().toISOString().split('T')[0],
                fileUrl: fileName
            };
            this.reports.unshift(newReport);
            this.renderRecentReports();
        } catch (error) {
            console.error('Error creating PDF:', error);
            this.showError('Failed to generate PDF');
        } finally {
            if (downloadBtn) {
                downloadBtn.innerHTML = originalText;
                downloadBtn.disabled = false;
            }
        }
    }

    getReportTypeName(type) {
        const types = {
            'monthly': 'Monthly Financial Report',
            'annual': 'Annual Summary Report',
            'student-payment': 'Student Payment Report'
        };
        return types[type] || type;
    }

    downloadReport(id) {
        const report = this.reports.find(r => r.id === id);
        if (report) {
            // In real app, trigger download
            window.showToast(`Downloading ${report.name}`, 'info');
        }
    }

    deleteReport(id) {
        if (confirm('Are you sure you want to delete this report?')) {
            this.reports = this.reports.filter(r => r.id !== id);
            this.renderRecentReports();
            this.showSuccess('Report deleted successfully');
        }
    }

    async downloadPDF() {
        // Trigger PDF download from preview
        const reportType = document.getElementById('report-type').value;
        const reportMonth = document.getElementById('report-month').value;
        await this.createPDF(reportType, reportMonth);
        bootstrap.Modal.getInstance(document.getElementById('reportPreviewModal')).hide();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-MY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showSuccess(message) {
        window.showToast(message, 'success');
    }

    showError(message) {
        window.showToast(message, 'danger');
    }
}

// Initialize reports manager when DOM is loaded and user is authenticated
document.addEventListener('DOMContentLoaded', function() {
    // Wait for auth to be ready
    const checkAuth = setInterval(() => {
        if (window.authManager && window.authManager.isAuthenticated()) {
            clearInterval(checkAuth);
            window.reportsManager = new ReportsManager();
        }
    }, 100);
});