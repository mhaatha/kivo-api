import mongoose from 'mongoose';

// Chat Session Schema - menggunakan UUID dari frontend sebagai _id
const chatSchema = new mongoose.Schema(
  {
    _id: {
      type: String, // UUID dari frontend
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Chat',
    },
  },
  {
    timestamps: true,
    _id: false, // Disable auto ObjectId generation
  },
);

// Virtual for id (return _id as-is since it's already a string UUID)
chatSchema.virtual('id').get(function () {
  return this._id;
});

chatSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});

// Location schema for user messages
const locationSchema = new mongoose.Schema(
  {
    latitude: { type: Number },
    longitude: { type: Number },
    accuracy: { type: Number },
  },
  { _id: false },
);

// Message Schema
const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: String, // Reference to Chat UUID
      ref: 'Chat',
      required: true,
      index: true,
    },
    content: {
      type: String,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system', 'tool'],
      required: true,
    },
    // For tool calls from assistant
    tool_calls: {
      type: Array,
      default: undefined,
    },
    // For tool responses
    tool_call_id: {
      type: String,
    },
    // Location data from user
    location: {
      type: locationSchema,
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.virtual('id').get(function () {
  return this._id.toString();
});

messageSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Chat = mongoose.model('Chat', chatSchema);
export const Message = mongoose.model('Message', messageSchema);
