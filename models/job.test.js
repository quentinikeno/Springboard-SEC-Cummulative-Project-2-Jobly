"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	testJobs,
	jobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */
describe("create", () => {
	const newJob = {
		title: "test",
		salary: 1000000,
		equity: "0",
		companyHandle: "c2",
	};
	test("create new job", async () => {
		const job = await Job.create(newJob);
		const expectedData = {
			id: expect.any(Number),
			...newJob,
		};
		expect(job).toEqual(expectedData);

		const result = await db.query(`
			SELECT id, title, salary, equity, company_handle AS "companyHandle"
			FROM jobs
			WHERE id = ${job.id}
		`);
		expect(result.rows[0]).toEqual(expectedData);
	});
});

/************************************** findAll */

describe("findAll", () => {
	test("Should find all jobs with no filter", async () => {
		const jobs = await Job.findAll();
		expect(jobs).toEqual(testJobs);
	});
});

/************************************** findAllFiltered */

describe("findAllFiltered", () => {
	test("Works with title filter", async () => {
		const filter = { title: "job" };
		const expectedData = [
			{
				id: expect.any(Number),
				title: "job1",
				salary: 50000,
				equity: "1",
				companyHandle: "c1",
			},
			{
				id: expect.any(Number),
				companyHandle: "c2",
				equity: "0",
				salary: 60000,
				title: "job2",
			},
			{
				id: expect.any(Number),
				companyHandle: "c3",
				equity: "0.5",
				salary: 40000,
				title: "job3",
			},
		];
		const jobs = await Job.findAllFiltered(filter);
		expect(jobs).toEqual(expectedData);
	});

	test("Works with minSalary filter", async () => {
		const filter = { minSalary: 50000 };
		const expectedData = [
			{
				id: expect.any(Number),
				title: "job1",
				salary: 50000,
				equity: "1",
				companyHandle: "c1",
			},
			{
				id: expect.any(Number),
				companyHandle: "c2",
				equity: "0",
				salary: 60000,
				title: "job2",
			},
		];
		const jobs = await Job.findAllFiltered(filter);
		expect(jobs).toEqual(expectedData);
	});

	test("Works with hasEquity filter", async () => {
		const filter = { hasEquity: true };
		const expectedData = [
			{
				id: expect.any(Number),
				title: "job1",
				salary: 50000,
				equity: "1",
				companyHandle: "c1",
			},
			{
				id: expect.any(Number),
				companyHandle: "c3",
				equity: "0.5",
				salary: 40000,
				title: "job3",
			},
		];
		const jobs = await Job.findAllFiltered(filter);
		expect(jobs).toEqual(expectedData);
	});

	test("Works with all three filters", async () => {
		const filter = { title: "Job", minSalary: 50000, hasEquity: true };
		const expectedData = [
			{
				id: expect.any(Number),
				title: "job1",
				salary: 50000,
				equity: "1",
				companyHandle: "c1",
			},
		];
		const jobs = await Job.findAllFiltered(filter);
		expect(jobs).toEqual(expectedData);
	});
});

/************************************** get */

describe("get", () => {
	test("Finds a single job based on id", async () => {
		const job = await Job.get(jobIds[0]);
		const expectedData = {
			id: expect.any(Number),
			title: "job1",
			salary: 50000,
			equity: "1",
			companyHandle: "c1",
		};
		expect(job).toEqual(expectedData);
	});

	test("Throws an error if job not found", async () => {
		try {
			await Job.get(0);
			fail();
		} catch (error) {
			expect(error instanceof NotFoundError).toBeTruthy();
		}
	});
});

/************************************** update */

describe("update", () => {
	test("Updates a single job based on id", async () => {
		const job = await Job.update(jobIds[0], {
			title: "updated job",
			salary: 10,
			equity: "0",
		});
		const expectedData = {
			id: expect.any(Number),
			title: "updated job",
			salary: 10,
			equity: "0",
			companyHandle: "c1",
		};
		expect(job).toEqual(expectedData);
	});

	test("Throws an error if job not found", async () => {
		try {
			await Job.update(0, {
				title: "updated job",
				salary: 10,
				equity: "0",
			});
			fail();
		} catch (error) {
			expect(error instanceof NotFoundError).toBeTruthy();
		}
	});
});
