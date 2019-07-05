var mongoose = require('mongoose');  
var InvitationSchema = new mongoose.Schema({  
  name: String,
  email: String,
  city: String,
  country: String,
  isEmailSent: {type: Boolean },
  error: String,
  success: String,
  createdTimestamp: { type: String, default: '' },

});
mongoose.model('Invitations', InvitationSchema);

module.exports = mongoose.model('Invitations');