"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Job {
	/** Create a job (from data), update db, return new job data.
	 *
	 * data should be { title, salary, equity, company_handle }
	 *
	 * Returns { id, title, salary, equity, company_handle }
	 *
	 * Throws BadRequestError if company already in database.
	 * */

	static async create({ title, salary, equity, companyHandle }) {
		const result = await db.query(
			`INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
			[title, salary, equity, companyHandle]
		);
		const job = result.rows[0];

		return job;
	}

	/** Find all jobs.
	 *
	 * Returns [{ id, title, salary, equity, company_handle }, ...]
	 * */

	static async findAll() {
		const jobsRes = await db.query(
			`SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           ORDER BY id`
		);
		return jobsRes.rows;
	}

	/** Find all jobs based on filter.
	 * Accepts object of filters, where filters can be { title, minSalary, hasEquity }
	 *
	 * Returns [{ id, title, salary, equity, company_handle }, ...]
	 * */

	static async findAllFiltered({ title, minSalary, hasEquity }) {
		if (title) {
			title = `%${title}%`;
		}

		const conds = [];
		const values = [];

		if (title) {
			values.push(`%${title}%`);
			conds.push(`title ILIKE $${values.length}`);
		}
		if (minSalary) {
			values.push(minSalary);
			conds.push(`salary >= $${values.length}`);
		}
		if (hasEquity) {
			conds.push("equity > 0");
		}

		const whereConds = conds.join(" AND ");
		const sqlQuery = `
      SELECT id, title, salary, equity, company_handle AS "companyHandle"
      FROM jobs
      WHERE ${whereConds}
      ORDER BY id`;
		const jobsRes = await db.query(sqlQuery, values);
		return jobsRes.rows;
	}

	/** Given a job id, return data about job.
	 *
	 * Returns { id, title, salary, equity, companyHandle }
	 *
	 * Throws NotFoundError if not found.
	 **/

	static async get(id) {
		const jobRes = await db.query(
			`SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`,
			[id]
		);

		const job = jobRes.rows[0];

		if (!job) throw new NotFoundError(`No job: ${id}`);

		return job;
	}

	/** Update job data with `data`.
	 *
	 * This is a "partial update" --- it's fine if data doesn't contain all the
	 * fields; this only changes provided ones.
	 *
	 * Data can include: { title, salary, equity }
	 *
	 * Returns { id, title, salary, equity, companyHandle }
	 *
	 * Throws NotFoundError if not found.
	 */

	static async update(id, data) {
		const { setCols, values } = sqlForPartialUpdate(data, {
			companyHandle: "company_handle",
		});
		const idVarIdx = "$" + (values.length + 1);

		const querySql = `UPDATE jobs
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, title, salary, equity, companyHandle as "companyHandle"`;
		const result = await db.query(querySql, [...values, id]);
		const job = result.rows[0];

		if (job) throw new NotFoundError(`No job: ${id}`);

		return job;
	}

	/** Delete given job from database; returns undefined.
	 *
	 * Throws NotFoundError if job not found.
	 **/

	static async remove(id) {
		const result = await db.query(
			`DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
			[id]
		);
		const job = result.rows[0];

		if (!job) throw new NotFoundError(`No job: ${id}`);
	}
}

module.exports = Job;
