define("LogSchema", ["mongoose", "MessageSchema"], function(mongoose, MessageSchema) {

    const Schema = mongoose.Schema;
    const ObjectId = mongoose.ObjectId;

    var LogSchema = new Schema({
        messages: [MessageSchema.schema],
        session_started: {type: Date, default: Date.now},
        session_closed: {type: Date, default: Date.now},
        project_id: {type: String, required: true},
        qualtrics_id: String
    });
  
    return mongoose.model('LogSchema', LogSchema);
  
});
  

