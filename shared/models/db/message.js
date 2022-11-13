define("MessageSchema", ["mongoose"], function(mongoose) {

    const Schema = mongoose.Schema;
    const ObjectId = mongoose.ObjectId;

    var MessageSchema = new Schema({
        message: String,
        source: String,
        sent_at: {type: Date, default: Date.now}
    });    
  
    return mongoose.model('MessageSchema', MessageSchema);
  
});
  

