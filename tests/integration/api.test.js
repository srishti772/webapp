const request = require("supertest");
const app = require("../../app");
const userService = require("../../service/userService");
const { v4: uuidv4 } = require('uuid');

jest.mock("../../service/userService");

const userId = uuidv4();
const currentDateTime = new Date().toISOString();
const existingUserData = {
  id: "existing-user-id",
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
  account_created: currentDateTime,
  account_updated: currentDateTime,
};

const createdUser = {
  id: userId,
  account_created: currentDateTime,
  account_updated: currentDateTime,
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("REGISTER USER POST /v1/user", () => {
  
  describe("Given valid user details", () => {
    test("Should respond with 201 Created and the correct payload", async () => {
      userService.createUser.mockResolvedValue(createdUser);

      const response = await request(app)
        .post("/v1/user")
        .send({
          first_name: "John",
          last_name: "Doe",
          password: "test123",
          email: "john.doe@example.com",
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: "User Created",
        data: createdUser,
      });
    });
  });

  describe("Given missing required fields", () => {
    const missingFieldsTests = [
      { field: "first_name", payload: { last_name: "Doe", password: "test123", email: "john.doe@example.com" } },
      { field: "last_name", payload: { first_name: "John", password: "test123", email: "john.doe@example.com" } },
      { field: "email", payload: { first_name: "John", last_name: "Doe", password: "test123" } },
      { field: "password", payload: { first_name: "John", last_name: "Doe", email: "john.doe@example.com" } },
    ];

    missingFieldsTests.forEach(({ field, payload }) => {
      test(`Should respond with 400 Bad Request when ${field} is missing`, async () => {
        const response = await request(app)
          .post("/v1/user")
          .send(payload);
        expect(response.status).toBe(400);
      });
    });
  });

  describe("Given an existing user", () => {
    beforeAll(() => {
      userService.getUserByEmail = jest.fn().mockResolvedValue(existingUserData.email);
      userService.createUser = jest.fn().mockRejectedValue({
        message: 'Something went wrong',
        statusCode: 400, 
      });

    
    });
 

    test("Should respond with 400 Bad Request", async () => {
      const response = await request(app)
        .post("/v1/user")
        .send({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
        });
      expect(response.status).toBe(400);
    });
  });
});
