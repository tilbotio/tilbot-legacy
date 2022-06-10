define("Models", ["mongoose"], function(mongoose) {
    const Schema = mongoose.Schema;
    const ObjectId = mongoose.ObjectId;

    var MessageSchema = new Schema({
      message: String,
      source: String,
      sent_at: {type: Date, default: Date.now}
    });

    var LogSchema = new Schema({
      messages: [MessageSchema],
      current_block_id: Number,
      session_started: {type: Date, default: Date.now},
      session_closed: {type: Date, default: Date.now},
      qualtrics_id: String,
      user_avatar_id: Number,
      chatbot_avatar_id: Number
    });

    var Models = {
      Message: mongoose.model('MessageSchema', MessageSchema),
      Log: mongoose.model('LogSchema', LogSchema)
    };

    return Models;
});
