import mongoose, { Schema, Model } from 'mongoose';
import { IDefaultValue } from '../types';

const defaultValueSchema = new Schema<IDefaultValue>(
  {
    goldValue24PerGram: {
      type: Number,
      min: [0, 'Gold value must be a positive number'],
    },
    silverPricePerGram: {
      type: Number,
      min: [0, 'Silver price must be a positive number'],
    },
    platinumPricePerGram: {
      type: Number,
      min: [0, 'Platinum price must be a positive number'],
    },
    titaniumPricePerGram: {
      type: Number,
      min: [0, 'Titanium price must be a positive number'],
    },
    labourCostGold: {
      type: Number,
      min: [0, 'Labour cost must be a positive number'],
    },
    labourCostPlatinum: {
      type: Number,
      min: [0, 'Labour cost must be a positive number'],
    },
    labourCostSilver: {
      type: Number,
      min: [0, 'Labour cost must be a positive number'],
    },
    labourCostTitanium: {
      type: Number,
      min: [0, 'Labour cost must be a positive number'],
    },
    goldExpense: {
      type: Number,
      min: [0, 'Expense must be a positive number'],
    },
    silverExpense: {
      type: Number,
      min: [0, 'Expense must be a positive number'],
    },
    platinumExpense: {
      type: Number,
      min: [0, 'Expense must be a positive number'],
    },
    titaniumExpense: {
      type: Number,
      min: [0, 'Expense must be a positive number'],
    },
    gstValue: {
      type: Number,
      min: [0, 'GST value must be a positive number'],
    },
  },
  {
    timestamps: false,
    collection: 'defaultvalues',
  }
);

const DefaultValue = mongoose.model<IDefaultValue, Model<IDefaultValue>>('DefaultValue', defaultValueSchema);

export default DefaultValue;
