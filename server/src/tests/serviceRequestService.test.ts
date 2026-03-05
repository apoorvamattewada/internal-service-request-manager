import { serviceRequestService } from '../services/serviceRequestService';
import { serviceRequestRepository } from '../repositories/serviceRequestRepository';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { Priority, Status, UserRole } from '../types';

jest.mock('../repositories/serviceRequestRepository');

const mockRepo = serviceRequestRepository as jest.Mocked<typeof serviceRequestRepository>;

const mockRequest = {
  _id: 'req123',
  title: 'Test Request',
  description: 'This is a test request with enough description',
  priority: Priority.MEDIUM,
  status: Status.OPEN,
  createdBy: { _id: 'user123', toString: () => 'user123' },
  assignedTo: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ServiceRequestService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('should throw NotFoundError for invalid object ID', async () => {
      mockRepo.isValidObjectId.mockReturnValue(false);

      await expect(serviceRequestService.getById('invalid-id')).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if request does not exist', async () => {
      mockRepo.isValidObjectId.mockReturnValue(true);
      mockRepo.findById.mockResolvedValue(null);

      await expect(serviceRequestService.getById('req123')).rejects.toThrow(NotFoundError);
    });

    it('should return service request when found', async () => {
      mockRepo.isValidObjectId.mockReturnValue(true);
      mockRepo.findById.mockResolvedValue(mockRequest as never);

      const result = await serviceRequestService.getById('req123');
      expect(result).toEqual(mockRequest);
    });
  });

  describe('update', () => {
    it('should throw ForbiddenError if non-owner employee tries to update', async () => {
      mockRepo.isValidObjectId.mockReturnValue(true);
      mockRepo.findById.mockResolvedValue(mockRequest as never);

      await expect(
        serviceRequestService.update(
          'req123',
          { title: 'New Title' },
          'differentUser456',
          UserRole.EMPLOYEE
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it('should throw ForbiddenError if employee tries to close a request', async () => {
      mockRepo.isValidObjectId.mockReturnValue(true);
      mockRepo.findById.mockResolvedValue(mockRequest as never);

      await expect(
        serviceRequestService.update(
          'req123',
          { status: Status.CLOSED },
          'user123',
          UserRole.EMPLOYEE
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it('should allow admin to close a request', async () => {
      mockRepo.isValidObjectId.mockReturnValue(true);
      mockRepo.findById.mockResolvedValue(mockRequest as never);
      mockRepo.update.mockResolvedValue({ ...mockRequest, status: Status.CLOSED } as never);

      const result = await serviceRequestService.update(
        'req123',
        { status: Status.CLOSED },
        'adminUser',
        UserRole.ADMIN
      );

      expect(result.status).toBe(Status.CLOSED);
    });

    it('should allow owner employee to update their own request', async () => {
      mockRepo.isValidObjectId.mockReturnValue(true);
      mockRepo.findById.mockResolvedValue(mockRequest as never);
      mockRepo.update.mockResolvedValue({ ...mockRequest, title: 'Updated Title' } as never);

      const result = await serviceRequestService.update(
        'req123',
        { title: 'Updated Title' },
        'user123',
        UserRole.EMPLOYEE
      );

      expect(result.title).toBe('Updated Title');
    });
  });

  describe('delete', () => {
    it('should throw ForbiddenError if non-owner tries to delete', async () => {
      mockRepo.isValidObjectId.mockReturnValue(true);
      mockRepo.findById.mockResolvedValue(mockRequest as never);

      await expect(
        serviceRequestService.delete('req123', 'otherUser', UserRole.EMPLOYEE)
      ).rejects.toThrow(ForbiddenError);
    });

    it('should allow admin to delete any request', async () => {
      mockRepo.isValidObjectId.mockReturnValue(true);
      mockRepo.findById.mockResolvedValue(mockRequest as never);
      mockRepo.delete.mockResolvedValue(mockRequest as never);

      await expect(
        serviceRequestService.delete('req123', 'adminUser', UserRole.ADMIN)
      ).resolves.not.toThrow();
    });
  });
});
