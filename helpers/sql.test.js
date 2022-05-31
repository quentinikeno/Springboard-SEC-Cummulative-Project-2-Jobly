const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", () => {
	test("It should return an object with setCols and values.", () => {
		data_1 = {
			firstName: "test",
			lastName: "user",
			password: "password",
			email: "test@email.com",
			isAdmin: false,
		};
		const sql_1 = sqlForPartialUpdate(data_1, {
			firstName: "first_name",
			lastName: "last_name",
			isAdmin: "is_admin",
		});
		expect(sql_1).toEqual({
			setCols: `"first_name"=$1, "last_name"=$2, "password"=$3, "email"=$4, "is_admin"=$5`,
			values: ["test", "user", "password", "test@email.com", false],
		});
	});
});
