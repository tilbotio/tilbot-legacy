requirejs.config({
    baseUrl: '/',
    paths: {
        // External libraries
        text: 'vendor/text',
        handlebars: 'vendor/handlebars.min-v4.7.7',
        jquery: 'vendor/jquery-3.6.0.min',
        jqueryui: 'vendor/jquery-ui-1.13.1.custom/jquery-ui.min',
        jqueryuitouch: 'vendor/jquery.ui.touch-punch.min',
        html2canvas: 'vendor/html2canvas.min',

        // Shared modules
        Util: 'util',

        // Controllers
        Observable: 'controllers/observable',
        EditorController: 'editor/controllers/editor',
        StartingPointController: 'editor/controllers/starting_point',
        EndPointController: 'editor/controllers/end_point',
        MinimapController: 'editor/controllers/minimap',
        NewBlockController: 'editor/controllers/new_block',
        EditBlockController: 'editor/controllers/edit_block',
        BlockController: 'editor/controllers/block',
        GroupBlockController: 'editor/controllers/groupblock',
        LineController: 'editor/controllers/line',
        BasicProjectController: 'shared/controllers/basicproject',
        EditorProjectController: 'editor/controllers/editorproject',

        // Models
        Project: 'models/project',
        BasicBlock: 'models/basicblock',
		AutoBlock: "shared/models/blocks/autoblock",
		GroupBlock: "shared/models/blocks/groupblock",
		ListBlock: "shared/models/blocks/listblock",
		MCBlock: "shared/models/blocks/mcblock",
		TextBlock: "shared/models/blocks/textblock",

        BasicConnector: 'models/basicconnector',
        LabeledConnector: 'models/connectors/labeledconnector',
        GroupConnector: 'models/connectors/groupconnector'
    }
});

requirejs(["editor/controllers/main"]);
