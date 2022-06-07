"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	u1Token,
	u2Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", () => {
	const newJob = {
		title: "Music Teacher",
		salary: 500000,
		equity: "0",
		companyHandle: "c1",
	};

	test("Creates a new job", async () => {
		const resp = await request(app)
			.post("/jobs")
			.send(newJob)
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toBe(201);
		expect(resp.body).toEqual({
			job: { id: expect.any(Number), ...newJob },
		});
	});

	test("fails if unauthorized", async () => {
		const resp = await request(app).post("/jobs").send(newJob);
		expect(resp.statusCode).toBe(401);
	});

	test("bad request with missing data", async () => {
		const resp = await request(app)
			.post("/jobs")
			.send({
				title: "Music Teacher",
				salary: 500000,
			})
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toBe(400);
	});
});

/************************************** GET /jobs */

describe("GET /jobs", () => {
	test("Returns a list of jobs", async () => {
		const resp = await request(app).get("/jobs");
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({
			jobs: [
				{
					id: expect.any(Number),
					title: "Job 1",
					salary: 50000,
					equity: "0",
					companyHandle: "c1",
				},
				{
					id: expect.any(Number),
					title: "Job 2",
					salary: 100000,
					equity: "1",
					companyHandle: "c2",
				},
				{
					id: expect.any(Number),
					title: "Sound Engineer",
					salary: 50000,
					equity: "0",
					companyHandle: "c3",
				},
			],
		});
	});

	test("Works with title filter", async () => {
		const resp = await request(app).get("/jobs").query({ title: "job" });
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({
			jobs: [
				{
					id: expect.any(Number),
					title: "Job 1",
					salary: 50000,
					equity: "0",
					companyHandle: "c1",
				},
				{
					id: expect.any(Number),
					title: "Job 2",
					salary: 100000,
					equity: "1",
					companyHandle: "c2",
				},
			],
		});
	});

	test("Works with minSalary filter", async () => {
		const resp = await request(app)
			.get("/jobs")
			.query({ minSalary: 70000 });
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({
			jobs: [
				{
					id: expect.any(Number),
					title: "Job 2",
					salary: 100000,
					equity: "1",
					companyHandle: "c2",
				},
			],
		});
	});
	test("Works with hasEquity filter", async () => {
		const resp = await request(app).get("/jobs").query({ hasEquity: true });
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({
			jobs: [
				{
					id: expect.any(Number),
					title: "Job 2",
					salary: 100000,
					equity: "1",
					companyHandle: "c2",
				},
			],
		});
	});

	test("Works with all three filters", async () => {
		const resp = await request(app)
			.get("/jobs")
			.query({ title: "job", minSalary: 70000, hasEquity: true });
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({
			jobs: [
				{
					id: expect.any(Number),
					title: "Job 2",
					salary: 100000,
					equity: "1",
					companyHandle: "c2",
				},
			],
		});
	});
});
