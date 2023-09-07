import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

const tagSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    }
})

export default mongoose.model('Tag', tagSchema);