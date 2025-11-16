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
  },
  {
    timestamps: false,
    collection: 'defaultvalues',
  }
);

const DefaultValue = mongoose.model<IDefaultValue, Model<IDefaultValue>>('DefaultValue', defaultValueSchema);

export default DefaultValue;
