// backend/models/Project.js
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    html: { type: String, default: '' },
    css: { type: String, default: '' },
    js: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
