INSERT INTO department SET name='Sales';
INSERT INTO department SET name='Engineering';

INSERT INTO role SET title= 'Marketing Manager',salary=120, department_id=1;
INSERT INTO role SET title= 'Sales Agent',salary=40, department_id=1;

INSERT INTO role SET title= 'Senior Project Manager',salary=180, department_id=2;
INSERT INTO role SET title= 'Project Manager',salary=120, department_id=2;
INSERT INTO role SET title= 'Systems Engineer',salary=60, department_id=2;
INSERT INTO role SET title= 'Software Engineer',salary=60, department_id=2;
INSERT INTO role SET title= 'Inter',salary=40, department_id=2;

INSERT INTO employee SET first_name= 'Jeff' , last_name= 'M.', role_id=1;
INSERT INTO employee SET first_name= 'Jason' , last_name= 'C.', role_id=2, manager_id=1;
INSERT INTO employee SET first_name= 'David' , last_name= 'B.', role_id=3;
INSERT INTO employee SET first_name= 'David' , last_name= 'R.', role_id=4, manager_id=3;
INSERT INTO employee SET first_name= 'Tom' , last_name= 'L.', role_id=5, manager_id=3;
INSERT INTO employee SET first_name= 'Chuck' , last_name= 'G.', role_id=6, manager_id=3;
INSERT INTO employee SET first_name= 'Kevin' , last_name= 'T.', role_id=7, manager_id=4;