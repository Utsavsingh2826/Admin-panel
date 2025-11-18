import { Response, NextFunction } from 'express';
import DefaultValue from '../models/DefaultValue';
import { asyncHandler } from '../middleware/asyncHandler';
import { ErrorResponse } from '../utils/errorResponse';
import { AuthRequest } from '../types';

// Metal price field mappings
const metalPriceFieldMap: Record<string, 'gold' | 'silver' | 'platinum' | 'titanium'> = {
  goldValue24PerGram: 'gold',
  silverPricePerGram: 'silver',
  platinumPricePerGram: 'platinum',
  titaniumPricePerGram: 'titanium',
};

// Labour cost field mappings
const labourCostFieldMap: Record<string, 'gold' | 'silver' | 'platinum' | 'titanium'> = {
  labourCostGold: 'gold',
  labourCostSilver: 'silver',
  labourCostPlatinum: 'platinum',
  labourCostTitanium: 'titanium',
};

// Expense field mappings
const expenseFieldMap: Record<string, 'gold' | 'silver' | 'platinum' | 'titanium'> = {
  goldExpense: 'gold',
  silverExpense: 'silver',
  platinumExpense: 'platinum',
  titaniumExpense: 'titanium',
};

const keyToFieldMap: Record<'gold' | 'silver' | 'platinum' | 'titanium', string> = {
  gold: 'goldValue24PerGram',
  silver: 'silverPricePerGram',
  platinum: 'platinumPricePerGram',
  titanium: 'titaniumPricePerGram',
};

// All allowed fields in the schema
const allAllowedFields = [
  'goldValue24PerGram',
  'silverPricePerGram',
  'platinumPricePerGram',
  'titaniumPricePerGram',
  'labourCostGold',
  'labourCostPlatinum',
  'labourCostSilver',
  'labourCostTitanium',
  'goldExpense',
  'silverExpense',
  'platinumExpense',
  'titaniumExpense',
  'gstValue',
];

const baseResponse = () => ({
  gold: null as any,
  silver: null as any,
  platinum: null as any,
  titanium: null as any,
});

export const getDefaultValues = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const documents = await DefaultValue.find({});
  const data = baseResponse();
  
  // Initialize metal data structure
  const metalData: any = {
    gold: { price: null, labourCost: null, expense: null },
    silver: { price: null, labourCost: null, expense: null },
    platinum: { price: null, labourCost: null, expense: null },
    titanium: { price: null, labourCost: null, expense: null },
  };
  
  let gstValue: any = null;

  documents.forEach((doc) => {
    const docObject = doc.toObject();
    
    // Map metal prices
    const priceField = Object.keys(metalPriceFieldMap).find((field) => docObject[field] !== undefined && docObject[field] !== null);
    if (priceField) {
      const metalKey = metalPriceFieldMap[priceField];
      data[metalKey] = {
        _id: doc._id,
        key: metalKey,
        field: priceField,
        value: docObject[priceField],
      };
      metalData[metalKey].price = {
        _id: doc._id,
        field: priceField,
        value: docObject[priceField],
      };
    }
    
    // Map labour costs
    const labourField = Object.keys(labourCostFieldMap).find((field) => docObject[field] !== undefined && docObject[field] !== null);
    if (labourField) {
      const metalKey = labourCostFieldMap[labourField];
      metalData[metalKey].labourCost = {
        _id: doc._id,
        field: labourField,
        value: docObject[labourField],
      };
    }
    
    // Map expenses
    const expenseField = Object.keys(expenseFieldMap).find((field) => docObject[field] !== undefined && docObject[field] !== null);
    if (expenseField) {
      const metalKey = expenseFieldMap[expenseField];
      metalData[metalKey].expense = {
        _id: doc._id,
        field: expenseField,
        value: docObject[expenseField],
      };
    }
    
    // Map GST value
    if (docObject.gstValue !== undefined && docObject.gstValue !== null) {
      gstValue = {
        _id: doc._id,
        field: 'gstValue',
        value: docObject.gstValue,
      };
    }
  });

  // Also return all documents as an array for the Prices page
  const allDocuments = documents.map((doc) => doc.toObject());

  // Debug logging
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 DEFAULT VALUES API RESPONSE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Total documents found:', documents.length);
  console.log('Metal prices data:', JSON.stringify(data, null, 2));
  console.log('All documents:', JSON.stringify(allDocuments, null, 2));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  res.status(200).json({
    success: true,
    data, // Legacy format for backward compatibility (metal prices only)
    metalData, // New structured format with prices, labour costs, and expenses
    gstValue, // GST value
    allDocuments, // All documents as array for Prices page
  });
});

export const updateDefaultValue = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const bodyFields = Object.keys(req.body).filter((field) => allAllowedFields.includes(field));

  if (bodyFields.length !== 1) {
    return next(new ErrorResponse('Please provide exactly one valid field to update', 400));
  }

  const fieldToUpdate = bodyFields[0];
  const value = req.body[fieldToUpdate];

  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
    return next(new ErrorResponse('Value must be a non-negative number', 400));
  }

  const document = await DefaultValue.findById(id);

  if (!document) {
    return next(new ErrorResponse('Entry not found', 404));
  }

  document.set(fieldToUpdate, value);
  await document.save();

  // Determine the metal key and category based on the field
  const metalKey = metalPriceFieldMap[fieldToUpdate] || 
                   labourCostFieldMap[fieldToUpdate] || 
                   expenseFieldMap[fieldToUpdate] || 
                   null;
  
  const category = metalPriceFieldMap[fieldToUpdate] ? 'price' :
                   labourCostFieldMap[fieldToUpdate] ? 'labourCost' :
                   expenseFieldMap[fieldToUpdate] ? 'expense' :
                   fieldToUpdate === 'gstValue' ? 'gst' : null;

  res.status(200).json({
    success: true,
    data: {
      _id: document._id,
      key: metalKey,
      category: category,
      field: fieldToUpdate,
      value: document.get(fieldToUpdate),
    },
  });
});
