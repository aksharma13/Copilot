// Open the WebSQL database
const db = openDatabase('financeTracker', '1.0', 'Finance Tracker Database', 2 * 1024 * 1024);

// Create the expenses table if it doesn't exist
db.transaction(function(tx) {
  tx.executeSql('CREATE TABLE IF NOT EXISTS expenses (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, description TEXT, amount REAL)');
});

// JavaScript code
let modal = document.getElementById("expenseModal");
let modalTitle = document.getElementById("modalTitle");
let modalButton = document.getElementById("modalButton");
let expenseTable = document.getElementById("expenseTable");
let selectedExpenseId = null;

// Open the modal
function openModal() {
  modal.style.display = "block";
  modalTitle.innerHTML = "Add Expense";
  modalButton.innerHTML = "Add";
  selectedExpenseId = null;
  document
  .getElementById("expenseDate").value = "";
  document.getElementById("expenseDescription").value = "";
  document.getElementById("expenseAmount").value = "";
}

// Close the modal
function closeModal() {
  modal.style.display = "none";
}

// Add expense to the table and WebSQL database
function addExpense() {
  let expenseDate = document.getElementById("expenseDate").value;
  let expenseDescription = document.getElementById("expenseDescription").value;
  let expenseAmount = document.getElementById("expenseAmount").value;

  // Validation checks
  if (expenseDate === "" || expenseDescription === "" || expenseAmount === "") {
    alert("Please fill in all fields");
    return;
  }

  // Insert into WebSQL database
  db.transaction(function(tx) {
    tx.executeSql('INSERT INTO expenses (date, description, amount) VALUES (?, ?, ?)', [expenseDate, expenseDescription, expenseAmount], function(tx, result) {
      console.log(`A new expense with ID ${result.insertId} has been inserted`);

      // Add row to the table
      let row = expenseTable.insertRow(-1);
      row.id = result.insertId;
      let dateCell = row.insertCell(0);
      let descCell = row.insertCell(1);
      let amountCell = row.insertCell(2);
      let actionCell = row.insertCell(3);

      dateCell.innerHTML = expenseDate;
      descCell.innerHTML = expenseDescription;
      amountCell.innerHTML = expenseAmount;
      actionCell.innerHTML = '<button class="button edit primary-button" onclick="editExpense(this)">Edit</button>' +
                              '<button class="button delete secondary-button" onclick="deleteExpense(this)">Delete</button>';
    }, function(error) {
      console.error('Error inserting expense:', error);
    });
  });

  closeModal();
}

// Edit expense
function editExpense(button) {
  let row = button.parentNode.parentNode;
  let dateCell = row.cells[0];
  let descCell = row.cells[1];
  let amountCell = row.cells[2];

  selectedExpenseId = row.id;
  document.getElementById("expenseDate").value = dateCell.innerHTML;
  document.getElementById("expenseDescription").value = descCell.innerHTML;
  document.getElementById("expenseAmount").value = amountCell.innerHTML;

  modal.style.display = "block";
  modalTitle.innerHTML = "Edit Expense";
  modalButton.innerHTML = "Save";
}

// Save expense changes
function saveExpense() {
  let expenseDate = document.getElementById("expenseDate").value;
  let expenseDescription = document.getElementById("expenseDescription").value;
  let expenseAmount = document.getElementById("expenseAmount").value;

  // Validation checks
  if (expenseDate === "" || expenseDescription === "" || expenseAmount === "") {
    alert("Please fill in all fields");
    return;
  }

  if (selectedExpenseId) {
    // Update WebSQL database
    db.transaction(function(tx) {
      tx.executeSql('UPDATE expenses SET date = ?, description = ?, amount = ? WHERE id = ?', [expenseDate, expenseDescription, expenseAmount, selectedExpenseId], function() {
        console.log(`Expense with ID ${selectedExpenseId} has been updated`);

        // Update table row
        let row = document.getElementById(selectedExpenseId);
        let dateCell = row.cells[0];
        let descCell = row.cells[1];
        let amountCell = row.cells[2];

        dateCell.innerHTML = expenseDate;
        descCell.innerHTML = expenseDescription;
        amountCell.innerHTML = expenseAmount;
      }, function(error) {
        console.error('Error updating expense:', error);
      });
    });
  } else {
    // Insert into WebSQL database
    db.transaction(function(tx) {
      tx.executeSql('INSERT INTO expenses (date, description, amount) VALUES (?, ?, ?)', [expenseDate, expenseDescription, expenseAmount], function(tx, result) {
        console.log(`A new expense with ID ${result.insertId} has been inserted`);

        // Add row to the table
        let row = expenseTable.insertRow(-1);
        row.id = result.insertId;
        let dateCell = row.insertCell(0);
        let descCell = row.insertCell(1);
        let amountCell = row.insertCell(2);
        let actionCell = row.insertCell(3);

        dateCell.innerHTML = expenseDate;
        descCell.innerHTML = expenseDescription;
        amountCell.innerHTML = expenseAmount;
        actionCell.innerHTML = '<button class="button edit" onclick="editExpense(this)">Edit</button>' +
                                '<button class="button delete" onclick="deleteExpense(this)">Delete</button>';
      }, function(error) {
        console.error('Error inserting expense:', error);
      });
    });
  }

  closeModal();
}

// Delete expense
function deleteExpense(button) {
  let row = button.parentNode.parentNode;

  // Delete from WebSQL database
  db.transaction(function(tx) {
    tx.executeSql('DELETE FROM expenses WHERE id = ?', [row.id], function() {
      console.log(`Expense with ID ${row.id} has been deleted`);

      // Remove table row
      row.remove();
    }, function(error) {
      console.error('Error deleting expense:', error);
    });
  });
}

// Filter table
function filterTable() {
    let inputDescription = document.getElementById("filterInputDescription").value.toUpperCase();
    let inputDate = document.getElementById("filterInputDate").value;
    let rows = expenseTable.getElementsByTagName("tr");
  
    for (let i = 0; i < rows.length; i++) {
      let description = rows[i].getElementsByTagName("td")[1];
      let date = rows[i].getElementsByTagName("td")[2];
  
      if (description && date) {
        let descriptionText = description.textContent || description.innerText;
        let dateText = date.textContent || date.innerText;
  
        if (
          descriptionText.toUpperCase().indexOf(inputDescription) > -1 &&
          (inputDate === "" || inputDate === dateText)
        ) {
          rows[i].style.display = "";
        } else {
          rows[i].style.display = "none";
        }
      }
    }
  }
  
