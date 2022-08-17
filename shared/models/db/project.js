define("ProjectSchema", ["mongoose"], function(mongoose) {

  const Schema = mongoose.Schema;
  const ObjectId = mongoose.ObjectId;

  var ProjectSchema = new Schema({
    id: {type: String, unique: true, required: true},
    name: {type: String, default: 'New project'},
    status: {type: Number, default: 0}, // 0 = paused, 1 = running
    current_block_id: {type: Number, default: 1},
    // Blocks are stored as JSON because they can have many different classes
    //blocks: {type: Map, of: Schema.Types.Mixed, default: () => ({})},
    blocks: {type: Schema.Types.Mixed, default: {}},
    starting_block_id: {type: Number, default: -1},
    canvas_width: {type: Number, default: -1},
    canvas_height: {type: Number, default: -1},
    user_id: {type: String, required: true},
    socket: {type: Number},
    active: {type: Boolean, default: true}
  }, {minimize: false});

  ProjectSchema.statics.fromModel = function(model) {
    var schema = new this();

    schema.name = model.name;
    schema.current_block_id = model.current_block_id;
    schema.starting_block_id = model.starting_block_id;
    schema.canvas_width = model.canvas_width;
    schema.canvas_height = model.canvas_height;
    schema.blocks = {};

    for (const [key, value] of Object.entries(model.blocks)) {
      //schema.blocks[key] = JSON.stringify(value.toJSON());
      console.log(key);
      //schema.blocks.set(key, JSON.stringify(value.toJSON()));
      schema.blocks[key] = value.toJSON();
    }

    return schema;
  }

  return mongoose.model('ProjectSchema', ProjectSchema);

});
