import { Response, NextFunction } from 'express';
import DefaultValue from '../models/DefaultValue';
import { asyncHandler } from '../middleware/asyncHandler';
import { ErrorResponse } from '../utils/errorResponse';
import { AuthRequest } from '../types';

const fieldToKeyMap: Record<string, 'gold' | 'silver' | 'platinum' | 'titanium'> = {
  goldValue24PerGram: 'gold',
  silverPricePerGram: 'silver',
  platinumPricePerGram: 'platinum',
  titaniumPricePerGram: 'titanium',
};

const keyToFieldMap: Record<'gold' | 'silver' | 'platinum' | 'titanium', string> = {
  gold: 'goldValue24PerGram',
  silver: 'silverPricePerGram',
  platinum: 'platinumPricePerGram',
  titanium: 'titaniumPricePerGram',
};

const baseResponse = () => ({
  gold: null as any,
  silver: null as any,
  platinum: null as any,
  titanium: null as any,
});

export const getDefaultValues = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const documents = await DefaultValue.find({});
  const data = baseResponse();

  documents.forEach((doc) => {
    const docObject = doc.toObject();
    const fieldKey = Object.keys(fieldToKeyMap).find((field) => docObject[field] !== undefined && docObject[field] !== null);

    if (fieldKey) {
      const metalKey = fieldToKeyMap[fieldKey];
      data[metalKey] = {
        _id: doc._id,
        key: metalKey,
        field: fieldKey,
        value: docObject[fieldKey],
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    }
  });

  res.status(200).json({
    success: true,
    data,
  });
});

export const updateDefaultValue = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const allowedFields = Object.keys(fieldToKeyMap);
  const bodyFields = Object.keys(req.body).filter((field) => allowedFields.includes(field));

  if (bodyFields.length !== 1) {
    return next(new ErrorResponse('Please provide exactly one valid metal price field to update', 400));
  }

  const fieldToUpdate = bodyFields[0];
  const value = req.body[fieldToUpdate];

  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
    return next(new ErrorResponse('Price must be a non-negative number', 400));
  }

  const document = await DefaultValue.findById(id);

  if (!document) {
    return next(new ErrorResponse('Metal price entry not found', 404));
  }

  document.set(fieldToUpdate, value);
  await document.save();

  const metalKey = fieldToKeyMap[fieldToUpdate];

  res.status(200).json({
    success: true,
    data: {
      _id: document._id,
      key: metalKey,
      field: fieldToUpdate,
      value: document.get(fieldToUpdate),
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    },
  });
});
