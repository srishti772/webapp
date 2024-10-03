const { validateUserFields } = require("../../controller/userController");

describe("validateUserFields", () => {
  const next = jest.fn(); 

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should return an error if a required field is missing", () => {
    const userData = { last_name: "Doe", email: "john.doe@example.com", password: "test123" };
    const requiredFields = ["first_name", "last_name", "email", "password"];
    const allowedFields = new Set(requiredFields);

    const result = validateUserFields(userData, requiredFields, next, allowedFields);

    expect(result).toBe(undefined); 
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: "Missing required field: first_name",
      statusCode: 400
    }));
  });

  test("Should return an error for invalid first_name", () => {
    const userData = { first_name: " ", last_name: "Doe", email: "john.doe@example.com", password: "test123" };
    const requiredFields = ["first_name", "last_name", "email", "password"];
    const allowedFields = new Set(requiredFields);

    const result = validateUserFields(userData, requiredFields, next, allowedFields);

    expect(result).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: "first_name must be a non-empty string",
      statusCode: 400 
    }));
  });

  test("Return true if all fields are valid", () => {
    const userData = { first_name: "John", last_name: "Doe", email: "john.doe@example.com", password: "test123" };
    const requiredFields = ["first_name", "last_name", "email", "password"];
    const allowedFields = new Set(requiredFields);

    const result = validateUserFields(userData, requiredFields, next, allowedFields);

    expect(result).toBe(true); 
    expect(next).not.toHaveBeenCalled(); 
  });

 
});
