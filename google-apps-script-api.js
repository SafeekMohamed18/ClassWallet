// ClassWallet Google Apps Script API
// Deploy this as a web app and use the URL in the frontend

function doGet(e) {
  const action = e.parameter.action;

  switch(action) {
    case 'getStudents':
      return getStudents();
    case 'getTransactions':
      return getTransactions();
    case 'getDashboardData':
      return getDashboardData(e.parameter);
    default:
      return ContentService
        .createTextOutput(JSON.stringify({error: 'Invalid action'}))
        .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;

  switch(action) {
    case 'addStudent':
      return addStudent(data.student);
    case 'updateStudent':
      return updateStudent(data.student);
    case 'deleteStudent':
      return deleteStudent(data.studentId);
    case 'addTransaction':
      return addTransaction(data.transaction);
    case 'deleteTransaction':
      return deleteTransaction(data.transactionId);
    default:
      return ContentService
        .createTextOutput(JSON.stringify({error: 'Invalid action'}))
        .setMimeType(ContentService.MimeType.JSON);
  }
}

function getStudents() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Students');
    const data = sheet.getDataRange().getValues();

    // Skip header row
    const students = data.slice(1).map((row, index) => ({
      id: index + 1,
      regNo: row[0] || '',
      name: row[1] || '',
      mobile: row[2] || '',
      email: row[3] || '',
      address: row[4] || '',
      guardianName: row[5] || '',
      guardianMobile: row[6] || '',
      birthday: (row[7] instanceof Date) ? row[7].toISOString().split('T')[0] : '',
      race: row[8] || '',
      notes: row[9] || ''
    }));

    return ContentService
      .createTextOutput(JSON.stringify({success: true, data: students}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function addStudent(student) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Students');

    // Find next empty row
    const lastRow = sheet.getLastRow() + 1;

    sheet.getRange(lastRow, 1, 1, 10).setValues([[
      student.regNo,
      student.name,
      student.mobile,
      student.email,
      student.address,
      student.guardianName,
      student.guardianMobile,
      student.birthday ? new Date(student.birthday) : '',
      student.race,
      student.notes
    ]]);

    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Student added successfully'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function updateStudent(student) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Students');
    const data = sheet.getDataRange().getValues();

    // Find student by ID (assuming ID is row number)
    const rowIndex = student.id;
    if (rowIndex < 1 || rowIndex >= data.length) {
      throw new Error('Student not found');
    }

    sheet.getRange(rowIndex + 1, 1, 1, 10).setValues([[
      student.regNo,
      student.name,
      student.mobile,
      student.email,
      student.address,
      student.guardianName,
      student.guardianMobile,
      student.birthday ? new Date(student.birthday) : '',
      student.race,
      student.notes
    ]]);

    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Student updated successfully'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function deleteStudent(studentId) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Students');

    // Delete row (studentId is row number)
    sheet.deleteRow(studentId + 1);

    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Student deleted successfully'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getTransactions() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Transactions');
    const data = sheet.getDataRange().getValues();

    // Skip header row
    const transactions = data.slice(1).map((row, index) => ({
      id: index + 1,
      type: row[1] || '',
      amount: parseFloat(row[2]) || 0,
      description: row[3] || '',
      student: row[4] || null,
      addedBy: row[5] || '',
      date: (row[6] instanceof Date) ? row[6].toISOString() : new Date().toISOString()
    }));

    return ContentService
      .createTextOutput(JSON.stringify({success: true, data: transactions}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function addTransaction(transaction) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Transactions');

    // Find next empty row
    const lastRow = sheet.getLastRow() + 1;

    sheet.getRange(lastRow, 1, 1, 7).setValues([[
      lastRow - 1, // ID
      transaction.type,
      transaction.amount,
      transaction.description,
      transaction.student || '',
      transaction.addedBy,
      new Date(transaction.date)
    ]]);

    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Transaction added successfully'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function deleteTransaction(transactionId) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Transactions');

    // Delete row (transactionId is row number)
    sheet.deleteRow(transactionId + 1);

    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Transaction deleted successfully'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getDashboardData(params) {
  try {
    const transactionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Transactions');
    const studentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Students');

    const transactions = transactionSheet.getDataRange().getValues().slice(1);
    const students = studentSheet.getDataRange().getValues().slice(1);

    const now = new Date();
    let targetMonth = now.getMonth();
    let targetYear = now.getFullYear();

    // Handle month parameter
    if (params && params.month === 'previous') {
      targetMonth--;
      if (targetMonth < 0) {
        targetMonth = 11;
        targetYear--;
      }
    }

    // Calculate dashboard metrics for the target month
    let totalBalance = 0;
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    const paidStudentRegNos = new Set();

    // Helper to check if a transaction belongs to a specific month/year
    const isTargetMonth = (date, m, y) => date.getMonth() === m && date.getFullYear() === y;

    // Helper to check if a transaction is a monthly payment
    const isMonthlyPayment = (row) => {
      const type = row[1];
      const desc = (row[3] || '').toString().toLowerCase();
      return type === 'Income' && (desc.includes('monthly') || desc.includes('special'));
    };

    transactions.forEach(row => {
      const amount = parseFloat(row[2]) || 0;
      const date = new Date(row[6]);
      
      // Always update total balance
      totalBalance += amount;

      if (isTargetMonth(date, targetMonth, targetYear)) {
        if (amount > 0) {
          monthlyIncome += amount;
        } else {
          monthlyExpenses += Math.abs(amount);
        }
        
        // Track paid students for target month
        if (isMonthlyPayment(row)) {
          const regNo = row[4]; 
          if (regNo) {
            paidStudentRegNos.add(regNo.toString().trim());
          }
        }
      }
    });

    // Generate chart data for the last 6 months
    const chartLabels = [];
    const chartIncome = [];
    const chartExpenses = [];

    for (let i = 5; i >= 0; i--) {
      let m = now.getMonth() - i;
      let y = now.getFullYear();
      if (m < 0) {
        m += 12;
        y--;
      }

      const monthName = new Date(y, m).toLocaleString('default', { month: 'short' });
      chartLabels.push(monthName);

      let mIncome = 0;
      let mExpenses = 0;

      transactions.forEach(row => {
        const amount = parseFloat(row[2]) || 0;
        const date = new Date(row[6]);
        if (isTargetMonth(date, m, y)) {
          if (amount > 0) mIncome += amount;
          else mExpenses += Math.abs(amount);
        }
      });

      chartIncome.push(mIncome);
      chartExpenses.push(mExpenses);
    }

    const dashboardData = {
      totalBalance: totalBalance,
      monthlyIncome: monthlyIncome,
      monthlyExpenses: monthlyExpenses,
      totalStudents: students.length,
      paidStudents: paidStudentRegNos.size,
      chartData: {
        labels: chartLabels,
        income: chartIncome,
        expenses: chartExpenses
      }
    };

    return ContentService
      .createTextOutput(JSON.stringify({success: true, data: dashboardData}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// CORS headers for web app deployment
function doOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}