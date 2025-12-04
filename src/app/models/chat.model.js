import mongoose from 'mongoose';

// Chat Session Schema
const chatSchema = new mongoose.Schema(
  {
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
  },
);

// Virtual for id
chatSchema.virtual('id').get(function () {
  return this._id.toString();
});

chatSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// Message Schema
const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
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
