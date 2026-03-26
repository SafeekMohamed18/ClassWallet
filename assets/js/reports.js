// ClassWallet Reports Module
class ReportsManager {
    constructor() {
        this.incomeChart = null;
        this.expenseChart = null;
        this.reports = [];
        this.init();
    }

    init() {
        this.loadReportData();
        this.setupEventListeners();
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
            // Load summary stats
            const stats = await this.fetchStats();
            this.updateStats(stats);

            // Load chart data
            const chartData = await this.fetchChartData();
            this.updateCharts(chartData);

            // Load recent reports
            this.loadRecentReports();
        } catch (error) {
            console.error('Error loading report data:', error);
            this.showError('Failed to load report data');
        }
    }

    async fetchStats() {
        // Mock data - replace with actual API call
        return {
            totalStudents: 35,
            paidThisMonth: 28,
            currentBalance: 2500.00,
            monthlyIncome: 1200.00
        };
    }

    async fetchChartData() {
        // Mock data - replace with actual API call
        return {
            incomeBreakdown: {
                labels: ['Monthly Collection', 'Late Payments', 'Other'],
                data: [1000, 150, 50]
            },
            expenseCategories: {
                labels: ['Class Outing', 'Stationery', 'Events', 'Other'],
                data: [400, 150, 200, 100]
            }
        };
    }

    updateStats(stats) {
        document.getElementById('total-students').textContent = stats.totalStudents;
        document.getElementById('paid-this-month').textContent = stats.paidThisMonth;
        document.getElementById('current-balance').textContent = `RM ${stats.currentBalance.toFixed(2)}`;
        document.getElementById('monthly-income-stat').textContent = `RM ${stats.monthlyIncome.toFixed(2)}`;
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

        try {
            // Show loading
            const generateBtn = document.getElementById('generate-report-btn');
            const originalText = generateBtn.innerHTML;
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Generating...';
            generateBtn.disabled = true;

            // Mock report generation delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Generate PDF
            await this.createPDF(reportType, reportMonth);

            // Reset button
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;

            this.showSuccess('Report generated successfully');
        } catch (error) {
            console.error('Error generating report:', error);
            this.showError('Failed to generate report');
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
        // Mock report preview HTML
        const [year, monthNum] = month.split('-');
        const monthName = new Date(year, monthNum - 1).toLocaleString('default', { month: 'long' });

        return `
            <div class="report-preview">
                <div class="text-center mb-4">
                    <h2>ClassWallet Financial Report</h2>
                    <h4>${monthName} ${year}</h4>
                    <p class="text-muted">Generated on ${new Date().toLocaleDateString()}</p>
                </div>

                <div class="row mb-4">
                    <div class="col-md-6">
                        <h5>Summary</h5>
                        <table class="table table-sm">
                            <tr><td>Total Students:</td><td>35</td></tr>
                            <tr><td>Paid Students:</td><td>28</td></tr>
                            <tr><td>Unpaid Students:</td><td>7</td></tr>
                            <tr><td>Payment Rate:</td><td>80%</td></tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h5>Financial Summary</h5>
                        <table class="table table-sm">
                            <tr><td>Opening Balance:</td><td>RM 1,300.00</td></tr>
                            <tr><td>Total Income:</td><td>RM 1,200.00</td></tr>
                            <tr><td>Total Expenses:</td><td>RM 450.00</td></tr>
                            <tr><td>Closing Balance:</td><td>RM 2,050.00</td></tr>
                        </table>
                    </div>
                </div>

                <div class="mb-4">
                    <h5>Income Details</h5>
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>2024-01-15</td><td>Monthly fund collection</td><td>RM 1,200.00</td></tr>
                        </tbody>
                    </table>
                </div>

                <div class="mb-4">
                    <h5>Expense Details</h5>
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>2024-01-14</td><td>Class outing expenses</td><td>RM 150.00</td></tr>
                            <tr><td>2024-01-10</td><td>Stationery purchase</td><td>RM 300.00</td></tr>
                        </tbody>
                    </table>
                </div>

                <div class="mb-4">
                    <h5>Student Payment Status</h5>
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Reg No</th>
                                <th>Status</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Ahmad bin Abdullah</td><td>CS001</td><td>Paid</td><td>RM 50.00</td></tr>
                            <tr><td>Siti Nurhaliza</td><td>CS002</td><td>Unpaid</td><td>RM 0.00</td></tr>
                            <!-- More rows would be here -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    async createPDF(type, month) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Mock PDF generation - in real app, use proper PDF library
        doc.text('ClassWallet Financial Report', 20, 20);
        doc.text(`Report Type: ${type}`, 20, 40);
        doc.text(`Period: ${month}`, 20, 50);

        // Add more content based on type
        doc.text('This is a sample PDF report.', 20, 70);
        doc.text('In a real implementation, this would contain detailed financial data.', 20, 80);

        // Save the PDF
        const fileName = `ClassWallet_Report_${month}.pdf`;
        doc.save(fileName);

        // Add to recent reports
        const newReport = {
            id: Date.now(),
            name: `${type} - ${month}`,
            type: this.getReportTypeName(type),
            period: month,
            generated: new Date().toISOString().split('T')[0],
            fileUrl: fileName
        };
        this.reports.unshift(newReport);
        this.renderRecentReports();
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
            alert(`Downloading ${report.name}`);
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
        alert(message);
    }

    showError(message) {
        alert(message);
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