import { faker } from '@faker-js/faker/locale/pt_BR';
import { createUserFactory } from '@test/factories';
import { E2ETestContext } from '@test/setup/e2e-test-context';

describe('UsersController (e2e)', () => {
  let ctx: E2ETestContext;

  beforeAll(async () => {
    ctx = await E2ETestContext.create();
  });

  afterAll(async () => {
    await ctx.close();
  });

  beforeEach(async () => {
    await ctx.resetTables(['users']);
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const userData = createUserFactory();

      const response = await ctx.request.post('/users').send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
    });
  });

  describe('GET /users/:id', () => {
    it('should get a user by id', async () => {
      const userData = createUserFactory();
      const createResponse = await ctx.request.post('/users').send(userData);
      const userId = createResponse.body.id;

      const response = await ctx.request.get(`/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('name', userData.name);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await ctx.request.get(
        '/users/00000000-0000-0000-0000-000000000000',
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /users/:id', () => {
    it('should update a user', async () => {
      const userData = createUserFactory();
      const createResponse = await ctx.request.post('/users').send(userData);
      const userId = createResponse.body.id;

      const updateData = { name: faker.person.fullName() };

      const response = await ctx.request
        .put(`/users/${userId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', userId);
      expect(response.body.name).toBe(updateData.name);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await ctx.request
        .put('/users/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Test' });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /users', () => {
    it('should list users with pagination', async () => {
      // Cria 3 usuários
      for (let i = 0; i < 3; i++) {
        await ctx.request.post('/users').send(createUserFactory());
      }

      const response = await ctx.request.get('/users?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('items');
      expect(Array.isArray(response.body.data.items)).toBe(true);
      expect(response.body.data.items.length).toBe(3);
      expect(response.body.data).toHaveProperty('total', 3);
      expect(response.body.data).toHaveProperty('currentPage', 1);
      expect(response.body.data).toHaveProperty('perPage', 10);
    });

    it('should return empty list when no users exist', async () => {
      const response = await ctx.request.get('/users?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.data.items).toHaveLength(0);
      expect(response.body.data.total).toBe(0);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      const userData = createUserFactory();
      const createResponse = await ctx.request.post('/users').send(userData);
      const userId = createResponse.body.id;

      await ctx.request.delete(`/users/${userId}`).expect(204);
      await ctx.request.get(`/users/${userId}`).expect(404);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await ctx.request.delete(
        '/users/00000000-0000-0000-0000-000000000000',
      );

      expect(response.status).toBe(404);
    });
  });
});
