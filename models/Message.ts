import mongoose, { Schema, Document, model } from 'mongoose';

export interface IMessage extends Document {
  user: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  content: string;
}

const MessageSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

export default model<IMessage>('Message', MessageSchema);
