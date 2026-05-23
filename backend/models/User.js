import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // Prevents duplicate accounts
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true, // ✨ Now strictly required!
    },
    role: {
      type: String,
      enum: ['candidate', 'admin'],
      default: 'candidate', // Role-based access control (RBAC)
    },
    isVerified: {
      type: Boolean,
      default: false, // For email verification later
    },
    // The Active Session Management Array
    activeSessions: [
      {
        device: String,
        ipAddress: String,
        tokenId: String,
        loginTime: { type: Date, default: Date.now },
      },
    ],
    // Lockout Tracking (Brute Force Protection)
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    accountLockedUntil: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// 🛡️ SECURITY MIDDLEWARE: Hash the password before saving to the database
userSchema.pre('save', async function () {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return;

  // Generate a secure salt and hash the password
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper method to compare passwords during login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;