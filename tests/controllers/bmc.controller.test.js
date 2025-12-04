import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the services and validations
vi.mock('../../src/app/services/bmc.service.js', () => ({
  getPublicBmcPosts: vi.fn(),
  getBmcById: vi.fn(),
  getBmcsByAuthorId: vi.fn(),
  createBmc: vi.fn(),
  updateBmcById: vi.fn(),
  deleteBmcById: vi.fn(),
  toggleBmcVisibility: vi.fn(),
}));

vi.mock('../../src/app/validations/bmc.validation.js', () => ({
  validateBmcUpdate: vi.fn(),
  validateBmcId: vi.fn(),
}));

describe('BMC Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      user: { id: 'user123' },
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  describe('getPublicBmcPosts', () => {
    it('should return empty array when no public posts', async () => {
      const bmcService = await import('../../src/app/services/bmc.service.js');
      bmcService.getPublicBmcPosts.mockResolvedValue([]);

      const { getPublicBmcPosts } = await import('../../src/app/controllers/bmc.controller.js');
      await getPublicBmcPosts(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: [],
      });
    });

    it('should return list of public BMC posts', async () => {
      const bmcService = await import('../../src/app/services/bmc.service.js');
      const mockPosts = [
        { _id: 'bmc1', items: [], isPublic: true },
        { _id: 'bmc2', items: [], isPublic: true },
      ];
      bmcService.getPublicBmcPosts.mockResolvedValue(mockPosts);

      const { getPublicBmcPosts } = await import('../../src/app/controllers/bmc.controller.js');
      await getPublicBmcPosts(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockPosts,
      });
    });

    it('should return 500 on service error', async () => {
      const bmcService = await import('../../src/app/services/bmc.service.js');
      bmcService.getPublicBmcPosts.mockRejectedValue(new Error('Database error'));

      const { getPublicBmcPosts } = await import('../../src/app/controllers/bmc.controller.js');
      await getPublicBmcPosts(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get public BMC data.',
      });
    });
  });

  describe('getBmcById', () => {
    it('should return BMC when found', async () => {
      mockReq.params.id = 'bmc123';
      
      const validation = await import('../../src/app/validations/bmc.validation.js');
      validation.validateBmcId.mockReturnValue({ success: true });

      const bmcService = await import('../../src/app/services/bmc.service.js');
      const mockBmc = { _id: 'bmc123', items: [], isPublic: false };
      bmcService.getBmcById.mockResolvedValue(mockBmc);

      const { getBmcById } = await import('../../src/app/controllers/bmc.controller.js');
      await getBmcById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockBmc,
      });
    });

    it('should return 404 when BMC not found', async () => {
      mockReq.params.id = 'nonexistent';
      
      const validation = await import('../../src/app/validations/bmc.validation.js');
      validation.validateBmcId.mockReturnValue({ success: true });

      const bmcService = await import('../../src/app/services/bmc.service.js');
      bmcService.getBmcById.mockResolvedValue(null);

      const { getBmcById } = await import('../../src/app/controllers/bmc.controller.js');
      await getBmcById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'BMC data not found.',
      });
    });

    it('should return 400 for invalid ID format', async () => {
      mockReq.params.id = 'invalid';
      
      const validation = await import('../../src/app/validations/bmc.validation.js');
      validation.validateBmcId.mockReturnValue({ success: false });

      const { getBmcById } = await import('../../src/app/controllers/bmc.controller.js');
      await getBmcById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getMyBmcPosts', () => {
    it('should return user BMC posts', async () => {
      const bmcService = await import('../../src/app/services/bmc.service.js');
      const mockPosts = [{ _id: 'bmc1', authorId: 'user123', items: [] }];
      bmcService.getBmcsByAuthorId.mockResolvedValue(mockPosts);

      const { getMyBmcPosts } = await import('../../src/app/controllers/bmc.controller.js');
      await getMyBmcPosts(mockReq, mockRes);

      expect(bmcService.getBmcsByAuthorId).toHaveBeenCalledWith('user123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockPosts,
      });
    });
  });

  describe('createBmc', () => {
    it('should create BMC successfully', async () => {
      mockReq.body = { items: [], isPublic: false };
      
      const bmcService = await import('../../src/app/services/bmc.service.js');
      const mockBmc = { _id: 'newBmc', authorId: 'user123', items: [], isPublic: false };
      bmcService.createBmc.mockResolvedValue(mockBmc);

      const { createBmc } = await import('../../src/app/controllers/bmc.controller.js');
      await createBmc(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'BMC created successfully.',
        data: mockBmc,
      });
    });
  });

  describe('updateBmc', () => {
    it('should update BMC successfully', async () => {
      mockReq.params.id = 'bmc123';
      mockReq.body = { items: [{ tag: 'CustomerSegments', content: 'Test' }] };
      
      const validation = await import('../../src/app/validations/bmc.validation.js');
      validation.validateBmcUpdate.mockReturnValue({ success: true });

      const bmcService = await import('../../src/app/services/bmc.service.js');
      const mockUpdatedBmc = { _id: 'bmc123', items: mockReq.body.items };
      bmcService.updateBmcById.mockResolvedValue(mockUpdatedBmc);

      const { updateBmc } = await import('../../src/app/controllers/bmc.controller.js');
      await updateBmc(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'BMC updated successfully.',
        data: mockUpdatedBmc,
      });
    });

    it('should return 400 when validation fails', async () => {
      mockReq.params.id = 'bmc123';
      mockReq.body = { items: [] };
      
      const validation = await import('../../src/app/validations/bmc.validation.js');
      validation.validateBmcUpdate.mockReturnValue({
        success: false,
        error: { errors: [{ message: 'Items cannot be empty' }] },
      });

      const { updateBmc } = await import('../../src/app/controllers/bmc.controller.js');
      await updateBmc(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 when BMC not found', async () => {
      mockReq.params.id = 'nonexistent';
      mockReq.body = { items: [{ tag: 'Test', content: 'Test' }] };
      
      const validation = await import('../../src/app/validations/bmc.validation.js');
      validation.validateBmcUpdate.mockReturnValue({ success: true });

      const bmcService = await import('../../src/app/services/bmc.service.js');
      bmcService.updateBmcById.mockResolvedValue(null);

      const { updateBmc } = await import('../../src/app/controllers/bmc.controller.js');
      await updateBmc(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteBmc', () => {
    it('should delete BMC successfully', async () => {
      mockReq.params.id = 'bmc123';
      
      const bmcService = await import('../../src/app/services/bmc.service.js');
      bmcService.deleteBmcById.mockResolvedValue({ _id: 'bmc123' });

      const { deleteBmc } = await import('../../src/app/controllers/bmc.controller.js');
      await deleteBmc(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'BMC deleted successfully.',
      });
    });

    it('should return 404 when BMC not found', async () => {
      mockReq.params.id = 'nonexistent';
      
      const bmcService = await import('../../src/app/services/bmc.service.js');
      bmcService.deleteBmcById.mockResolvedValue(null);

      const { deleteBmc } = await import('../../src/app/controllers/bmc.controller.js');
      await deleteBmc(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('toggleVisibility', () => {
    it('should toggle visibility to public', async () => {
      mockReq.params.id = 'bmc123';
      
      const bmcService = await import('../../src/app/services/bmc.service.js');
      bmcService.toggleBmcVisibility.mockResolvedValue({ _id: 'bmc123', isPublic: true });

      const { toggleVisibility } = await import('../../src/app/controllers/bmc.controller.js');
      await toggleVisibility(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'BMC is now public.',
        data: expect.objectContaining({ isPublic: true }),
      });
    });

    it('should toggle visibility to private', async () => {
      mockReq.params.id = 'bmc123';
      
      const bmcService = await import('../../src/app/services/bmc.service.js');
      bmcService.toggleBmcVisibility.mockResolvedValue({ _id: 'bmc123', isPublic: false });

      const { toggleVisibility } = await import('../../src/app/controllers/bmc.controller.js');
      await toggleVisibility(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'BMC is now private.',
        data: expect.objectContaining({ isPublic: false }),
      });
    });

    it('should return 404 when BMC not found', async () => {
      mockReq.params.id = 'nonexistent';
      
      const bmcService = await import('../../src/app/services/bmc.service.js');
      bmcService.toggleBmcVisibility.mockResolvedValue(null);

      const { toggleVisibility } = await import('../../src/app/controllers/bmc.controller.js');
      await toggleVisibility(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });
});
