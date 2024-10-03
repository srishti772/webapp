const request = require("supertest");
const app = require("../../app");
const userModel = require("../../model/userModel");

beforeAll(async () => {
  await userModel.sync({ force: true });
});
afterAll(async () => {
    //await userModel.drop();
    await userModel.sequelize.close(); 
  });

describe("REGISTER USER POST /v1/user", () => {
  
  describe("Given valid user details", () => {
    test("Should respond with 201 Created and the correct payload", async () => {
      //Creating a new user
      const response = await request(app)
        .post("/v1/user")
        .send({
          first_name: "John",
          last_name: "Doe",
          password: "test123",
          email: "john.doe@example.com",
        });

      // Checking if user got created
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: "User Created",
        data: expect.objectContaining({
            id: expect.any(String), 
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
          account_created: expect.any(String), 
        account_updated: expect.any(String),
        }),
      });

      //verify in db
      const fetched_user = await userModel.findOne({ where: { email: "john.doe@example.com" } });
      expect(fetched_user).toBeTruthy(); 
      expect(fetched_user.first_name).toBe("John");
      expect(fetched_user.last_name).toBe("Doe");
      expect(fetched_user.email).toBe("john.doe@example.com");

      
    });
  });

  
  describe("Given duplicate user details", () => {
    test("Should respond with 400 Bad Request for duplicate user", async () => {
      
      const duplicateResponse = await request(app)
        .post("/v1/user")
        .send({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
        });
      
      expect(duplicateResponse.status).toBe(400);
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


});
