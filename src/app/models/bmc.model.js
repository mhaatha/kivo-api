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
      default: null,
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
