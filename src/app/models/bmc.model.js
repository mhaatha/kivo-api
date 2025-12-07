import mongoose from 'mongoose';

// Schema for location
const locationSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    accuracy: {
      type: Number,
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
        'customer_segments',
        'value_propositions',
        'channels',
        'customer_relationships',
        'revenue_streams',
        'key_resources',
        'key_activities',
        'key_partnerships',
        'cost_structure',
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
    location: {
      type: locationSchema,
      default: {latitude: -6.212389303808392, longitude: 106.79750324133452, accuracy: 996731.7919034803},
    },
    authorId: {
      type: String,
      required: true,
      index: true,
    },
    chatId: {
      type: String,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    items: [itemContentSchema],
    createdAt: {
      type: Date,
    },
    updatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Virtual for id
bmcPostSchema.virtual('id').get(function () {
  return this._id?.toString();
});

// Ensure virtuals are included in JSON output
bmcPostSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    if (ret._id) {
      ret.id = ret._id;
    }
    delete ret._id;
    delete ret.__v;
    // Ensure timestamps are included (for legacy documents)
    if (!ret.createdAt) ret.createdAt = null;
    if (!ret.updatedAt) ret.updatedAt = null;
    return ret;
  },
});

export const BmcPost = mongoose.model('BmcPost', bmcPostSchema);
