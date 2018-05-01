const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  middleName: {
    type: String
  },
  lastName: {
    type: String,
    required: true
  },
  idNumber: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (value) => validator.isInt(value,{min: 10000000, max:100000000}),
      message: '{VALUE} is not a valid ID'
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: (value) => validator.isByteLength(value, {min: 8, max: 16})
    },
    message: '{VALUE} is not a valid password'
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
}
UserSchema.methods.generateAuthToken = function() { // can't user arrow function, there's no binding for "this"
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'drPatetta').toString();

  user.tokens = user.tokens.concat([{access, token}]);

  return user.save().then(() => {
    return token;
  });
};

var User = mongoose.model('Users', UserSchema);


module.exports = {User};
