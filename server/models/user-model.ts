import mongoose from 'mongoose';

const Schema = mongoose.Schema

const userSchema = new Schema(
    {
        username: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        profilePic: { type: Buffer, required: true },
        maps: [{type: Schema.Types.ObjectId, required: true, ref: 'Map'}]
    },
    { timestamps: true },
)

const userModel = mongoose.model('User', userSchema);

export default userModel;