import { describe, it, expect, beforeAll } from "vitest";
import { hashPassword, verifyPassword } from "./_core/auth";
import { getAdminByUsername, createAdminCredentials, updateAdminPassword } from "./db";

describe("Admin Authentication", () => {
  const testUsername = "admin_test_" + Date.now();
  const testPassword = "SecurePassword123!";
  const newPassword = "NewSecurePassword456!";

  it("should hash and verify passwords correctly", () => {
    const hash = hashPassword(testPassword);
    expect(hash).toBeTruthy();
    expect(hash).toContain(":");

    const isValid = verifyPassword(testPassword, hash);
    expect(isValid).toBe(true);

    const isInvalid = verifyPassword("WrongPassword", hash);
    expect(isInvalid).toBe(false);
  });

  it("should create admin credentials", async () => {
    const passwordHash = hashPassword(testPassword);
    await createAdminCredentials(testUsername, passwordHash);

    const admin = await getAdminByUsername(testUsername);
    expect(admin).toBeTruthy();
    expect(admin?.username).toBe(testUsername);
    expect(admin?.passwordHash).toBe(passwordHash);
  });

  it("should verify admin login with correct password", async () => {
    const admin = await getAdminByUsername(testUsername);
    expect(admin).toBeTruthy();

    if (admin) {
      const isValid = verifyPassword(testPassword, admin.passwordHash);
      expect(isValid).toBe(true);
    }
  });

  it("should reject admin login with wrong password", async () => {
    const admin = await getAdminByUsername(testUsername);
    expect(admin).toBeTruthy();

    if (admin) {
      const isInvalid = verifyPassword("WrongPassword", admin.passwordHash);
      expect(isInvalid).toBe(false);
    }
  });

  it("should update admin password", async () => {
    const newHash = hashPassword(newPassword);
    await updateAdminPassword(testUsername, newHash);

    const admin = await getAdminByUsername(testUsername);
    expect(admin).toBeTruthy();

    if (admin) {
      const isValid = verifyPassword(newPassword, admin.passwordHash);
      expect(isValid).toBe(true);

      const isInvalid = verifyPassword(testPassword, admin.passwordHash);
      expect(isInvalid).toBe(false);
    }
  });
});
