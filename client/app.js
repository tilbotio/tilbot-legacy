requirejs.config({
    baseUrl: '/',
    paths: {
        // External libraries
        text: 'vendor/text',
        handlebars: 'vendor/handlebars.min-v4.7.7',
        jquery: 'vendor/jquery-3.6.0.min',
        jqueryui: 'vendor/jquery-ui-1.13.1.custom/jquery-ui.min',
        jqueryuitouch: 'vendor/jquery.ui.touch-punch.min',

        // Shared modules
        Util: 'util',

        // Controllers
        Observable: 'controllers/observable',
        ClientController: 'client/controllers/client',
        TextClientController: 'client/controllers/text_client',
        TextServerController: 'client/controllers/text_server',
        TypingIndicatorController: 'client/controllers/typing_indicator',
        BasicProjectController: 'controllers/basicproject',
        LocalProjectController: 'client/controllers/localproject',
        RemoteProjectController: 'client/controllers/remoteproject',
        ExecutingProjectController: 'shared/controllers/executingproject',
        InputMCController: 'client/controllers/input_mc',
        InputListController: 'client/controllers/input_list',

        // Models
        Project: 'models/project',
        BasicBlock: 'models/basicblock',
        AutoBlock: 'models/blocks/autoblock',
        MCBlock: 'models/blocks/mcblock',
        TextBlock: 'models/blocks/textblock',
        ListBlock: 'models/blocks/listblock',
        GroupBlock: 'models/blocks/groupblock',
        BasicConnector: 'models/basicconnector',
        LabeledConnector: 'models/connectors/labeledconnector',
        GroupConnector: 'models/connectors/groupconnector'
    }
});

requirejs(["client/controllers/main"]);
