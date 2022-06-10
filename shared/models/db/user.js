define("UserSchema", ["mongoose"], function(mongoose) {

  const Schema = mongoose.Schema;
  const ObjectId = mongoose.ObjectId;

  var UserSchema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true, bcrypt: true},
    role: {type: Number, required: true, default: 1},
    active: {type: Boolean, default: true}
  });

  UserSchema.plugin(require('mongoose-bcrypt'));

  return mongoose.model('UserSchema', UserSchema);

});
