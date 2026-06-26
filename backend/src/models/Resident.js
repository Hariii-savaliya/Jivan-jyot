const mongoose = require('mongoose');

const residentSchema = new mongoose.Schema({
  residentId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  photo: { type: String, default: '' },
  admissionDate: { type: Date, required: true },
  admissionTime: { type: String, default: '' },
  name: { type: String, required: true, trim: true }, // Full Name
  age: { type: Number, required: true, min: 0 },
  fatherHusbandName: { type: String, default: '' },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  address: { type: String, default: '' },
  identificationMark: { type: String, default: '' },
  physicalCondition: { type: String, default: '' },
  healthCondition: { type: String, default: '' },
  broughtFrom: { type: String, default: '' },
  institutionName: { type: String, default: '' },
  informerName: { type: String, default: '' },
  informerAddress: { type: String, default: '' },
  informerMobile: { type: String, default: '' },
  guardianDetails: {
    name: { type: String, default: 'None', trim: true },
    mobile: { type: String, default: '0000000000', trim: true },
    relation: { type: String, default: 'Self', trim: true }
  },
  guardianName: { type: String, default: '' },
  guardianAddress: { type: String, default: '' },
  guardianMobile: { type: String, default: '' },
  remarks: { type: String, default: '', trim: true }, // Additional Remarks
  status: {
    type: String,
    required: true,
    enum: ['Active', 'Discharged', 'Deceased'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Resident', residentSchema);
