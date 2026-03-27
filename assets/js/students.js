// ClassWallet Students Management Module
const API_URL = 'https://script.google.com/macros/s/AKfycbxojIElp5StBRvezU8uZ8RSvmnxKIkYHR6jLI9Urr2nC0u84ZhCi-z7vrS_LrX2TxE1/exec';

class StudentsManager {
    constructor() {
        this.students = [];
        this.filteredStudents = [];
        this.init();
    }

    init() {
        this.loadStudents();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.filterStudents();
            });
        }

        // Filter functionality
        const filterSelect = document.getElementById('filter-select');
        if (filterSelect) {
            filterSelect.addEventListener('change', () => {
                this.filterStudents();
            });
        }

        // Add student form
        const saveBtn = document.getElementById('save-student-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveStudent();
            });
        }

        // Edit student form
        const updateBtn = document.getElementById('update-student-btn');
        if (updateBtn) {
            updateBtn.addEventListener('click', () => {
                this.updateStudent();
            });
        }
    }

    async loadStudents() {
        try {
            // Mock data - replace with actual API call to Google Sheets
            this.students = await this.fetchStudents();
            this.filteredStudents = [...this.students];
            this.renderStudents();
        } catch (error) {
            console.error('Error loading students:', error);
            this.showError('Failed to load students: ' + error.message);
        }
    }

    async fetchStudents() {
        const response = await fetch(`${API_URL}?action=getStudents`);
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        return result.data;
    }

    filterStudents() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const filterValue = document.getElementById('filter-select').value;

        this.filteredStudents = this.students.filter(student => {
            const matchesSearch = student.name.toLowerCase().includes(searchTerm) ||
                                student.regNo.toLowerCase().includes(searchTerm) ||
                                student.email.toLowerCase().includes(searchTerm);

            const matchesFilter = true; // status filter removed

            return matchesSearch && matchesFilter;
        });

        this.renderStudents();
    }

    renderStudents() {
        const tbody = document.querySelector('#students-table tbody');
        tbody.innerHTML = '';

        if (this.filteredStudents.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No students found</td></tr>';
            return;
        }

        this.filteredStudents.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.regNo}</td>
                <td>${student.name}</td>
                <td>${student.mobile || '-'}</td>
                <td>${student.email || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-info me-1" onclick="studentsManager.viewStudent(${student.id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="studentsManager.editStudent(${student.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="studentsManager.deleteStudent(${student.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    viewStudent(id) {
        const student = this.students.find(s => s.id === id);
        if (!student) return;

        // Create a simple view modal or redirect to detail page
        // For now, just show an alert with details
        alert(`Student Details:
Name: ${student.name}
Reg No: ${student.regNo}
Mobile: ${student.mobile || 'N/A'}
Email: ${student.email || 'N/A'}
Address: ${student.address || 'N/A'}
Guardian Name: ${student.guardianName || 'N/A'}
Guardian Mobile: ${student.guardianMobile || 'N/A'}
Birthday: ${student.birthday || 'N/A'}
Race: ${student.race || 'N/A'}
Notes: ${student.notes || 'N/A'}`);
    }

    editStudent(id) {
        const student = this.students.find(s => s.id === id);
        if (!student) return;

        // Populate edit form
        document.getElementById('edit-student-id').value = student.id;
        document.getElementById('edit-reg-no').value = student.regNo;
        document.getElementById('edit-full-name').value = student.name;
        document.getElementById('edit-mobile').value = student.mobile || '';
        document.getElementById('edit-email').value = student.email || '';
        document.getElementById('edit-address').value = student.address || '';
        document.getElementById('edit-guardian-name').value = student.guardianName || '';
        document.getElementById('edit-guardian-mobile').value = student.guardianMobile || '';
        document.getElementById('edit-birthday').value = student.birthday || '';
        document.getElementById('edit-race').value = student.race || '';
        document.getElementById('edit-notes').value = student.notes || '';

        // Show edit modal
        const modal = new bootstrap.Modal(document.getElementById('editStudentModal'));
        modal.show();
    }

    async saveStudent() {
        const form = document.getElementById('add-student-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const studentData = {
            regNo: document.getElementById('reg-no').value,
            name: document.getElementById('full-name').value,
            mobile: document.getElementById('mobile').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            guardianName: document.getElementById('guardian-name').value,
            guardianMobile: document.getElementById('guardian-mobile').value,
            birthday: document.getElementById('birthday').value,
            race: document.getElementById('race').value,
            notes: document.getElementById('notes').value,
            paymentStatus: 'unpaid' // New students start as unpaid
        };

        try {
            // Mock API call - replace with actual save to Google Sheets
            const newStudent = await this.saveStudentToAPI(studentData);
            this.students.push(newStudent);
            this.filteredStudents = [...this.students];
            this.renderStudents();

            // Close modal and reset form
            bootstrap.Modal.getInstance(document.getElementById('addStudentModal')).hide();
            form.reset();

            this.showSuccess('Student added successfully');
        } catch (error) {
            console.error('Error saving student:', error);
            this.showError('Failed to save student');
        }
    }

    async updateStudent() {
        const form = document.getElementById('edit-student-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const id = parseInt(document.getElementById('edit-student-id').value);
        const studentData = {
            regNo: document.getElementById('edit-reg-no').value,
            name: document.getElementById('edit-full-name').value,
            mobile: document.getElementById('edit-mobile').value,
            email: document.getElementById('edit-email').value,
            address: document.getElementById('edit-address').value,
            guardianName: document.getElementById('edit-guardian-name').value,
            guardianMobile: document.getElementById('edit-guardian-mobile').value,
            birthday: document.getElementById('edit-birthday').value,
            race: document.getElementById('edit-race').value,
            notes: document.getElementById('edit-notes').value
        };

        try {
            // Mock API call - replace with actual update to Google Sheets
            await this.updateStudentInAPI(id, studentData);

            // Update local data
            const index = this.students.findIndex(s => s.id === id);
            if (index !== -1) {
                this.students[index] = { ...this.students[index], ...studentData };
                this.filteredStudents = [...this.students];
                this.renderStudents();
            }

            // Close modal
            bootstrap.Modal.getInstance(document.getElementById('editStudentModal')).hide();

            this.showSuccess('Student updated successfully');
        } catch (error) {
            console.error('Error updating student:', error);
            this.showError('Failed to update student');
        }
    }

    async deleteStudent(id) {
        if (!confirm('Are you sure you want to delete this student?')) {
            return;
        }

        try {
            // Mock API call - replace with actual delete from Google Sheets
            await this.deleteStudentFromAPI(id);

            // Remove from local data
            this.students = this.students.filter(s => s.id !== id);
            this.filteredStudents = [...this.students];
            this.renderStudents();

            this.showSuccess('Student deleted successfully');
        } catch (error) {
            console.error('Error deleting student:', error);
            this.showError('Failed to delete student');
        }
    }

    // Mock API methods - replace with actual Google Apps Script calls
    async saveStudentToAPI(data) {
        const response = await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors', // Use no-cors if experiencing redirect issues with GAS
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'addStudent', student: data })
        });
        // Note: With no-cors, you won't be able to read the response body. 
        // For full CRUD reliability, ensure doOptions() is configured in GAS.
        return { id: Date.now(), ...data }; 
    }

    async updateStudentInAPI(id, data) {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ 
                action: 'updateStudent', 
                student: { ...data, id: id } 
            })
        });
    }

    async deleteStudentFromAPI(id) {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ 
                action: 'deleteStudent', 
                studentId: id 
            })
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

// Initialize students manager when DOM is loaded and user is authenticated
document.addEventListener('DOMContentLoaded', function() {
    // Wait for auth to be ready
    const checkAuth = setInterval(() => {
        if (window.authManager && window.authManager.isAuthenticated()) {
            clearInterval(checkAuth);
            window.studentsManager = new StudentsManager();
        }
    }, 100);
});