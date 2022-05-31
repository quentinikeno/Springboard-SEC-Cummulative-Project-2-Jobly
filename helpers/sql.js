const { BadRequestError } = require("../expressError");

/** Create an object with the cols to set and values to update in a SQL Update query. 
 * 
 * For users, dataToUpdate can include: { firstName, lastName, password, email, isAdmin }
 * For companies, dataToUpdate can include: {name, description, numEmployees, logoUrl}
 * 
 * jsToSql is an object with mappings of the camel cased JS variables to the snake cased
 * SQL variables.  
 * For users: {
          firstName: "first_name",
          lastName: "last_name",
          isAdmin: "is_admin",
        }
 * For companies: {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        }
 * 
 *  Returns { setCols, values }
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
	const keys = Object.keys(dataToUpdate);
	if (keys.length === 0) throw new BadRequestError("No data");

	// {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
	const cols = keys.map(
		(colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
	);

	return {
		setCols: cols.join(", "),
		values: Object.values(dataToUpdate),
	};
}

module.exports = { sqlForPartialUpdate };
