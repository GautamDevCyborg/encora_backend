import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    associated_user_id: { type: String, required: true },
    users_username: { type: String, required: true },
    imageUrl: { type: String, required: true }, 
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    image_name: { type: String, required: true },
    country: { type: String, required: true },
    Plant_name: { type: String, required: true },
    is_verified:{ type: Boolean, default: false },
    Address: { type: String, required: true },
    plantedOn: { type: Date, required: true }
  },
  { timestamps: true }
);

const Image = mongoose.model('Image', imageSchema);

export default Image;


