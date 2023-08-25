const mongoose = require('mongoose');

const BeneficiarySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users', 
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    walletAddress: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Beneficiary', BeneficiarySchema);
