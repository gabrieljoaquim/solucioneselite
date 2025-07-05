const request = require('supertest');
const app = require('../app'); // Assuming app.js initializes the server

describe('User Controller Tests', () => {
  describe('Email Verification', () => {
    it('should send a verification email upon registration', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'Test User',
          email: 'testuser@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Verification email sent');
    });

    it('should verify the email using the token', async () => {
      const token = 'sampleToken'; // Replace with actual token generation logic
      const response = await request(app)
        .get(`/api/users/verify/${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Email verified successfully');
    });
  });

  describe('Password Recovery', () => {
    it('should send a password reset link', async () => {
      const response = await request(app)
        .post('/api/users/forgot-password')
        .send({ email: 'testuser@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Password reset link sent');
    });

    it('should reset the password using the token', async () => {
      const token = 'sampleToken'; // Replace with actual token generation logic
      const response = await request(app)
        .post(`/api/users/reset-password/${token}`)
        .send({ password: 'newpassword123' });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Password reset successfully');
    });
  });
});
