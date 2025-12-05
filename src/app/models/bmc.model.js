import mongoose from 'mongoose';

// --- Schema for Coordinate ---
const coordinateSchema = new mongoose.Schema(
  {
    lat: {
      type: Number,
      required: true,
    },
    lon: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

// --- Schema for BMC Item Content ---
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
  { _id: false }
);

// --- BMC Post Schema ---
const bmcPostSchema = new mongoose.Schema(
  {
    // Perbaikan: Ubah 'coordinat' jadi 'coordinate' (opsional)
    // Perbaikan: Default value harus 'lon', bukan 'lon' (mengikuti coordinateSchema)
    coordinate: {
      type: coordinateSchema,
      default: { lat: -6.212249928667231, lon: 106.79734681365301 }, 
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
  }
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

// --- EXPORT YANG AMAN (Safe Export) ---
// Mengecek apakah model sudah ada sebelum membuatnya (Penting untuk Next.js/Serverless)
const BmcPost = mongoose.models.BmcPost || mongoose.model('Bmc', bmcPostSchema);
export { BmcPost };