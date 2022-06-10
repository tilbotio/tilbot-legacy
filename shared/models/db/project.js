define("ProjectSchema", ["mongoose"], function(mongoose) {

  const Schema = mongoose.Schema;
  const ObjectId = mongoose.ObjectId;

  var ProjectSchema = new Schema({
    id: {type: String, unique: true, required: true},
    name: {type: String, default: 'New project'},
    current_block_id: {type: Number, default: 1},
    // Blocks are stored as JSON because they can have many different classes
    blocks: {type: Map, of: String, default: () => ({})},
    starting_block_id: {type: Number, default: -1},
    canvas_width: {type: Number, default: -1},
    canvas_height: {type: Number, default: -1},
    user_id: {type: String, required: true}
  });

  ProjectSchema.statics.fromModel = function(model) {
    this.name = model.name;
    this.current_block_id = model.current_block_id;
    this.starting_block_id = model.starting_block_id;
    this.canvas_width = model.canvas_width;
    this.canvas_height = model.canvas_height;

    for (const [key, value] of Object.entries(model.blocks)) {
      this.blocks.set(key, JSON.stringify(value.toJSON()));
    }
  }

  return mongoose.model('ProjectSchema', ProjectSchema);

});
