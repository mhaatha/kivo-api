import mongoose from 'mongoose';

// Schema for coordinate (location)
const coordinateSchema = new mongoose.Schema(
  {
    lat: {
      type: Number,
      required: true,
    },
    long: {
      type: Number,
      required: true,
    },
    alt: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

// Schema for BMC item content
const itemContentSchema = new mongoose.Schema(
  {
    tag: {
      type: String,
      required: true,
      enum: [
        'CustomerSegments',
        'ValuePropositions',
        'Channels',
        'CustomerRelationships',
        'RevenueStreams',
        'KeyResources',
        'KeyActivities',
        'KeyPartnerships',
        'CostStructure',
      ],
    },
    content: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

// BMC Post Schema
const bmcPostSchema = new mongoose.Schema(
  {
    coordinat: {
      type: coordinateSchema,
      default: { lat: 0, long: 0, alt: 0 },
    },
    authorId: {
      type: String,
      required: true,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    items: [itemContentSchema],
  },
  {
    timestamps: true,
  },
);

// Virtual for id
bmcPostSchema.virtual('id').get(function () {
  return this._id.toString();
});

// Ensure virtuals are included in JSON output
bmcPostSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const BmcPost = mongoose.model('BmcPost', bmcPostSchema);
