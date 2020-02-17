# EmployeeTracker2

#### EmployeeTracker2 Repo, 02/17/2020

#### By Siavash Ashkiani
​
## Description
A solution for managing a company's employees using node, inquirer, and MySQL.
- ** This is almost identical to https://github.com/ashkiani/EmployeeTracker with the exception that it doesn't have a lib/database.js file but instead it is using my own npm package (https://www.npmjs.com/package/mysql-sync-query) 


## Features
​
* Users can add departments, roles, employees.
* Users can view departments, roles, employees.
* Users can update employee roles. 
* Users can update employee managers.
* Users can update roles data (title, salary and department).
* Users can delete departments, roles, and employees.
* Users can view employees by manager. 
* Users can view the total utilized budget of a department -- ie the combined salaries of all employees in that department
​
​
## Setup/Installation Requirements
​
* Clone this repository.
* run command: npm install
* enter your local MySQL settings (e.g. username, password, etc...) in index.js (Line:484)
* use the db/schema.sql content to create the database
* [optional] populate the database by executing content of db/seed.sql
* run command: node server.js
​
​
## Known Bugs

None - at this time​.

​
## Support and contact details
​
Please email us for further questions at ashkiani@yahoo.com
​
## Technologies Used
​
Node.js, MySQL

### License
​
This software is licensed under MIT license.