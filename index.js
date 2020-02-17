const inquirer = require("inquirer");
const Database = require("mysql-sync-query");
const db = new Database("employees_db");
const cTable = require('console.table');
let exit = false;
let action = "";
let table = "";
let employeeRole = "";
let roleDeptID = 0;
let employeeManagerID = 0;
const noRoleTitle = "No Role";
const noRoleDept = "No Department";
const noManager = "No Manager";
const employeeSelectSql = `SELECT employee.id, employee.first_name,employee.last_name,title,concat( emp1.first_name , ' ', emp1.last_name) AS manager
              FROM employees_db.employee LEFT JOIN employees_db.role ON role_id=employees_db.role.id LEFT JOIN employees_db.employee AS emp1 ON employee.manager_id=emp1.id  ORDER BY employee.first_name,employee.last_name,title;`
let newTitle;
let newSalary;
let employeeByManagerView = "Employees By Manager";
let tUBDView = "Total Utilized Budget By Department";

//Siavash 2/8/2020 Added the following code to suppress the MaxListenersExceeded warning. 
//I assume that the warning eventually reappears if the number of team members grows but I tested it with up to 8 employees and worked fine.
require('events').EventEmitter.defaultMaxListeners = 250;

start();

async function getIDForDelete(sqlQuery) {
  let result = await db.executeQuery(sqlQuery);
  result = result.map(record => { return JSON.stringify(record); });

  return inquirer
    .prompt({
      name: "item",
      type: "list",
      message: "Please select the row to be deleted:",
      choices: result
    }).then(async function (recordInfo) {
      let deleteId = JSON.parse(recordInfo.item).id;
      await db.executeQuery(`DELETE FROM ${table} WHERE id=${deleteId}`);
    })
}

async function getAction() {
  let options = ["Add"];

  const promise1 = db.executeQuery("SELECT * FROM employee");
  const promise2 = db.executeQuery("SELECT * FROM role");
  const promise3 = db.executeQuery("SELECT * FROM department");

  await Promise.all([promise1, promise2, promise3]).then(function (values) {
    if ((values[0].length > 0) || (values[1].length > 0) || (values[2].length > 0)) {
      options.push("View", "Update", "Delete");
    }
  });
  options.push("EXIT");
  return inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "Please select an action:",
      choices: options
    }).then(async function (menuAnswer) {
      action = menuAnswer.action;
      exit = action == "EXIT";
      if (!exit) {
        await getTable();
      }
    })
}

async function addNewEmployee() {
  return inquirer
    .prompt([{
      name: "firstName",
      type: "input",
      message: "Please enter First Name:"
    }, {
      name: "lastName",
      type: "input",
      message: "Please enter Last Name:"
    }]).then(async function (employeeInfo) {
      let roles = await db.executeQuery("SELECT * FROM role");
      let sql = `INSERT INTO employee SET first_name= '${employeeInfo.firstName}' , last_name= '${employeeInfo.lastName}'`;
      if (roles.length > 0) {
        await getEmployeeRole(roles);
        if (employeeRole != noRoleTitle) {
          let roles = await db.executeQuery(`SELECT id from role WHERE title='${employeeRole}'`)
          if (roles.length > 0) {
            let employeeId = roles[0].id;
            sql += `, role_id=${employeeId}`
          }
        }
      }

      let possibleManagers = await db.executeQuery(`SELECT * FROM employee`);
      if (possibleManagers.length > 0) {
        await getEmployeeManager(possibleManagers, true);
        if (employeeManagerID != 0) {
          managerId = employeeManagerID;
          sql += `, manager_id=${employeeManagerID}`
        }

      }
      await db.executeQuery(sql);
    })
}
async function getEmployeeRole(roles) {
  let titles = roles.map(role => { return role.title; });
  titles.push(noRoleTitle);
  return inquirer
    .prompt({
      name: "role",
      type: "list",
      message: "Please select the role:",
      choices: titles
    }).then(async function (roleInfo) {
      employeeRole = roleInfo.role;
    })
}

async function getRoleDept(depts, showNoDept) {
  depts = depts.map(dept => { return JSON.stringify(dept); });
  if (showNoDept) {
    depts.push(JSON.stringify({ id: 0, name: noRoleDept }));
  }
  return inquirer
    .prompt({
      name: "dept",
      type: "list",
      message: "Please select the department:",
      choices: depts
    }).then(async function (deptInfo) {
      roleDeptID = JSON.parse(deptInfo.dept).id;
    })
}


async function getUpdateRoleTitle() {
  return inquirer
    .prompt({
      name: "role",
      type: "input",
      message: "Please enter the new title for this role:",
    }).then(async function (roleInfo) {
      newTitle = roleInfo.role;
    })
}

async function getUpdateRoleSalary() {
  return inquirer
    .prompt({
      name: "role",
      type: "input",
      message: "Please enter the new salary for this role:",
    }).then(async function (roleInfo) {
      newSalary = roleInfo.role;
    })
}

async function getEmployeeManager(managers, showNoManagerOption) {
  let mngrs = managers.map(manager => { return JSON.stringify(manager); });
  if (showNoManagerOption) {
    mngrs.push(JSON.stringify({ id: 0, name: noManager }));
  }
  return inquirer
    .prompt({
      name: "manager",
      type: "list",
      message: "Please select the manager:",
      choices: mngrs
    }).then(async function (managerInfo) {
      employeeManagerID = JSON.parse(managerInfo.manager).id;
    })
}

async function addNewRole() {
  return inquirer
    .prompt([{
      name: "title",
      type: "input",
      message: "Please enter role title:"
    }, {
      name: "salary",
      type: "input",
      message: "Please enter role salary:"
    }]).then(async function (roleInfo) {
      let existingRole = await db.executeQuery("SELECT * FROM role WHERE title='" + roleInfo.title + "'");
      if (existingRole.length == 0) {
        let depts = await db.executeQuery("SELECT * FROM department");
        let querySQL = `INSERT INTO role SET title= '${roleInfo.title}',salary=${roleInfo.salary}`;
        if (depts.length > 0) {
          await getRoleDept(depts, true);
          if (roleDeptID != 0) {
            querySQL += `, department_id=${roleDeptID}`
          }
        }
        await db.executeQuery(querySQL);
      }
    })
}
async function addNewDepartment() {
  return inquirer
    .prompt({
      name: "name",
      type: "input",
      message: "Please enter department name:"
    }).then(async function (deptInfo) {
      let existingDept = await db.executeQuery("SELECT * FROM department WHERE name='" + deptInfo.name + "'");
      if (existingDept.length == 0) {
        await db.executeQuery("INSERT INTO department SET name='" + deptInfo.name + "'");
      }
    })
}


async function updateRole() {
  let roles = await db.executeQuery("SELECT * FROM role");
  roles = roles.map(role => { return JSON.stringify(role) });
  return inquirer
    .prompt({
      name: "id",
      type: "list",
      message: "Please select the  role that you want to update:",
      choices: roles
    }).then(async function (roleInfo) {
      let index = roles.indexOf(roleInfo.id);
      let roleId = JSON.parse(roles[index]).id;
      await roleUpdatePrompt(roleId);
    })
}

async function updateDept() {
  let depts = await db.executeQuery("SELECT * FROM department");
  depts = depts.map(dept => { return JSON.stringify(dept) });
  return inquirer
    .prompt({
      name: "id",
      type: "list",
      message: "Please select the  department that you want to update:",
      choices: depts
    }).then(async function (deptInfo) {
      let index = depts.indexOf(deptInfo.id);
      let deptId = JSON.parse(depts[index]).id;
      await deptUpdatePrompt(deptId);
    })
}

async function updateEmployee() {
  let employees = await db.executeQuery(employeeSelectSql);
  employees = employees.map(employee => { return JSON.stringify(employee) });
  return inquirer
    .prompt({
      name: "id",
      type: "list",
      message: "Please select the employee that you want to update:",
      choices: employees
    }).then(async function (employeeInfo) {
      let index = employees.indexOf(employeeInfo.id);
      let employeeId = JSON.parse(employees[index]).id;
      await employeeUpdatePrompt(employeeId);
    })
}

async function roleUpdatePrompt(roleId) {
  return inquirer
    .prompt({
      name: "updateAction",
      type: "list",
      message: "Please select the field to update:",
      choices: ["Title", "Salary", "Department"]
    }).then(async function (updateAction) {
      let sql;
      switch (updateAction.updateAction) {
        case "Title":
          await getUpdateRoleTitle();
          sql = `UPDATE role SET title= '${newTitle}' WHERE id=${roleId}`;
          await db.executeQuery(sql);
          break;
        case "Salary":
          await getUpdateRoleSalary();
          sql = `UPDATE role SET salary= ${newSalary} WHERE id=${roleId}`;
          await db.executeQuery(sql);
          break;
        case "Department":
          let depts = await db.executeQuery("SELECT * FROM department");
          await getRoleDept(depts, true);
          let deptId = 'NULL';
          if (roleDeptID != 0) {
            deptId = roleDeptID;
          }
          sql = `UPDATE role SET department_id= ${deptId} WHERE id=${roleId}`;
          await db.executeQuery(sql);
          break;
      }
    })
}

async function deptUpdatePrompt(deptId) {
  return inquirer
    .prompt({
      name: "name",
      type: "input",
      message: "Please enter the new department name to update:",
    }).then(async function (updateAction) {
      await db.executeQuery(`UPDATE department SET name= '${updateAction.name}' WHERE id=${deptId}`);
    })
}

async function employeeUpdatePrompt(employeeId) {
  return inquirer
    .prompt({
      name: "updateAction",
      type: "list",
      message: "Please select the field to update:",
      choices: ["Role", "Manager"]
    }).then(async function (updateAction) {
      switch (updateAction.updateAction) {
        case "Role":
          let roles = await db.executeQuery("SELECT * FROM role");
          if (roles.length > 0) {
            await getEmployeeRole(roles);
            let roleId = 'NULL';
            if (employeeRole != noRoleTitle) {
              roleId = await db.executeQuery(`SELECT id from role WHERE title='${employeeRole}'`)
              roleId = roleId[0].id;
            }
            let sql = `UPDATE employee SET role_id= ${roleId} WHERE id=${employeeId}`;
            await db.executeQuery(sql);
          }
          else { console.log("No Role is available. Please create a new Role first."); }
          break;
        case "Manager":
          let possibleManagers = await db.executeQuery(`SELECT * FROM employee WHERE id<>${employeeId}`);
          if (possibleManagers.length > 0) {
            await getEmployeeManager(possibleManagers, true);
            let managerId = 'NULL';
            if (employeeManagerID != 0) {
              managerId = employeeManagerID;
            }
            let sql = `UPDATE employee SET manager_id= ${managerId} WHERE id=${employeeId}`;
            await db.executeQuery(sql);
          } else { console.log("No Manager is available. Please add a new manager first."); }
          break;
      }

    })
}

async function PrintTable() {
  let sql = `SELECT * FROM ${table}`;
  // SELECT employee.id, first_name,last_name,title,salary,department.name AS department
  // FROM employees_db.employee LEFT JOIN employees_db.role ON role_id=employees_db.role.id LEFT JOIN employees_db.department ON department_id=employees_db.department.id;
  switch (table) {
    case "employee":
      sql = employeeSelectSql;
      break;
    case "role":
      sql ="SELECT title, salary, name AS department FROM role LEFT JOIN department ON department_id=department.id;"
      break;
    case "department":
      break;
    case employeeByManagerView:
      let Managers = await db.executeQuery(`SELECT DISTINCT employee.manager_id as id, emp1.first_name, emp1.last_name FROM employee INNER JOIN employee as emp1 ON employee.manager_id=emp1.id WHERE employee.manager_id IS NOT NULL`);
      if (Managers.length > 0) {
        await getEmployeeManager(Managers, false);
        sql = `SELECT employee.first_name, employee.last_name, CONCAT(emp1.first_name, ' ',emp1.last_name) AS manager FROM employee INNER JOIN employee as emp1 ON 
        employee.manager_id=emp1.id WHERE emp1.id=${employeeManagerID}`
      }
      break;
    case tUBDView:
      let depts = await db.executeQuery("SELECT * FROM department");
      await getRoleDept(depts, false);
      sql = `SELECT SUM(salary) AS 'Combined salaries of all employees in the department' FROM 
      employees_db.department LEFT JOIN role ON department_id=department.id LEFT JOIN employee ON 
      employee.role_id=role.id WHERE department.id=${roleDeptID}`
  }
  let res = await db.executeQuery(sql);
  if (res.length > 0) {
    console.table(res);
  } else {
    console.log(`${table} table is empty`);
  }

  // let caption = `----Table:${table}---`;
  // console.log("start " + caption);
  // res.forEach(row => console.log(JSON.stringify(row)));
  // console.log("end " + caption);
}
async function getValues() {
  switch (action) {
    case "View":
      return PrintTable();
    case "Add":
      switch (table) {
        case "employee":
          return addNewEmployee();
        case "role":
          return addNewRole();
        case "department":
          return addNewDepartment();
      }
    case "Update":
      switch (table) {
        case "employee":
          return updateEmployee();
        case "role":
          return updateRole();
        case "department":
          return updateDept();
      }
      break;
    case "Delete":
      let querySQL;
      switch (table) {
        case "employee":
          querySQL = employeeSelectSql;
          break;
        case "role":
          querySQL = "SELECT * FROM role";
          break;
        case "department":
          querySQL = "SELECT * FROM department";
          break;
      }
      return getIDForDelete(querySQL);
  }

}

async function getTable() {
  let options = [];
  let msgSelectType = "table";
  switch (action) {
    case "Add":
      options = ["Employees", "Departments", "Roles"];
      break;
    case "View":
    case "Update":
    case "Delete":
      const promise1 = db.executeQuery("SELECT * FROM employee");
      const promise2 = db.executeQuery("SELECT * FROM role");
      const promise3 = db.executeQuery("SELECT * FROM department");
      const promise4 = db.executeQuery("SELECT * FROM employee WHERE manager_id IS NOT NULL");
      await Promise.all([promise1, promise2, promise3, promise4]).then(function (values) {
        if (values[0].length > 0) { options.push("Employees"); }
        if (action == "View") {
          if (values[3].length > 0) {
            options.push(employeeByManagerView);
            msgSelectType += "/View";
          }
        }
        if (values[2].length > 0) { options.push("Departments"); }
        if (action == "View") {
          if (values[2].length > 0) {
            options.push(tUBDView);
            if (msgSelectType == "table") {
              msgSelectType += "/View";
            }
          }
        }
        if (values[1].length > 0) { options.push("Roles"); }
      });
  }

  return inquirer
    .prompt({
      name: "table",
      type: "list",
      message: `Please select a ${msgSelectType}:`,
      choices: options
    }).then(async function (menuAnswer) {
      if (menuAnswer.table == employeeByManagerView || menuAnswer.table == tUBDView) {
        table = menuAnswer.table
      } else {
        table = menuAnswer.table.toLowerCase();
        table = table.substring(0, table.length - 1);
      }

      await getValues();
    })
}

async function start() {
  db.connectLocal("localHost",3306,"user","password");
  try {
    while (!exit) {
      await getAction();
    }
  }
  catch (err) {
    console.log(err);
  }
  finally {
    db.disconnect();
  }
}

