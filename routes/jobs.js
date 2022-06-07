"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobFilterSchema = require("../schemas/jobFilter.json");

const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, company_handle }
 *
 * Returns { id, title, salary, equity, company_handle }
 *
 * Authorization required: login, admin
 */

router.post("/", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, jobNewSchema);
		if (!validator.valid) {
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}

		const job = await Job.create(req.body);
		return res.status(201).json({ job });
	} catch (err) {
		return next(err);
	}
});

/** GET /  =>
 *   { jobs: [{ id, title, salary, equity, company_handle }, ...] }
 *
 * Can filter on provided search filters:
 * - minSalary
 * - title
 * - hasEquity
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
	try {
		const { query } = req;
		if (query.minSalary) {
			query.minSalary = +query.minSalary;
		}
		if (query.hasEquity) {
			query.hasEquity = query.hasEquity === "true" ? true : false;
		}

		if (Object.keys(query).length > 0) {
			const validator = jsonschema.validate(query, jobFilterSchema);
			if (validator.valid) {
				const jobs = await Job.findAllFiltered(query);
				return res.json({ jobs });
			}
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}

		const jobs = await Job.findAll();
		return res.json({ jobs });
	} catch (err) {
		return next(err);
	}
});

/** GET /[id]  =>  { job }
 *
 *  Job is { id, title, salary, equity, companyHandle }
 *   where jobs is [{ id, title, salary, equity, company_handle }, ...]
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
	try {
		const job = await Job.get(req.params.id);
		return res.json({ job });
	} catch (err) {
		return next(err);
	}
});

/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: login
 */

router.patch(
	"/:id",
	ensureLoggedIn,
	ensureAdmin,
	async function (req, res, next) {
		try {
			const validator = jsonschema.validate(req.body, jobUpdateSchema);
			if (!validator.valid) {
				const errs = validator.errors.map((e) => e.stack);
				throw new BadRequestError(errs);
			}

			const job = await Job.update(req.params.id, req.body);
			return res.json({ job });
		} catch (err) {
			return next(err);
		}
	}
);

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: login
 */

router.delete(
	"/:id",
	ensureLoggedIn,
	ensureAdmin,
	async function (req, res, next) {
		try {
			await Job.remove(req.params.id);
			return res.json({ deleted: req.params.id });
		} catch (err) {
			return next(err);
		}
	}
);

module.exports = router;
