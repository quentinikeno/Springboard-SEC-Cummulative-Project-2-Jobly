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
