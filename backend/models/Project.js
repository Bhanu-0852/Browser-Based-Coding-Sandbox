import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    // Links this specific code directly to the logged-in user
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // The actual code files
    files: [{
        name: String,
        language: String,
        value: String
    }]
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);