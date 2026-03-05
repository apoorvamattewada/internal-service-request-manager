import mongoose, { Schema, Document } from 'mongoose';
import { IServiceRequest, Priority, Status } from '../types';

export interface IServiceRequestDocument extends Omit<IServiceRequest, '_id'>, Document {}

const serviceRequestSchema = new Schema<IServiceRequestDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    priority: {
      type: String,
      enum: Object.values(Priority),
      required: [true, 'Priority is required'],
      default: Priority.MEDIUM,
    },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.OPEN,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common query patterns
serviceRequestSchema.index({ status: 1, priority: 1 });
serviceRequestSchema.index({ createdBy: 1 });
serviceRequestSchema.index({ assignedTo: 1 });
serviceRequestSchema.index({ title: 'text', description: 'text' });
serviceRequestSchema.index({ createdAt: -1 });

export const ServiceRequest = mongoose.model<IServiceRequestDocument>(
  'ServiceRequest',
  serviceRequestSchema
);
