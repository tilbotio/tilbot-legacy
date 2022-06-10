requirejs.config({
    baseUrl: '/',
    paths: {
        // External libraries
        text: 'vendor/text',
        handlebars: 'vendor/handlebars.min-v4.7.7',
        jquery: 'vendor/jquery-3.6.0.min',
        jqueryui: 'vendor/jquery-ui-1.13.1.custom/jquery-ui.min',
        jqueryuitouch: 'vendor/jquery.ui.touch-punch.min',
        socket: '/socket.io/socket.io',

        // Shared modules
        Util: 'util',

        // Controllers
        //LoginController: 'dashboard/controllers/login',
        Observable: 'controllers/observable',
        ClientController: 'client/controllers/client',
        TextClientController: 'client/controllers/text_client',
        TextServerController: 'client/controllers/text_server',
        TypingIndicatorController: 'client/controllers/typing_indicator',
        ProjectController: 'client/controllers/project',
        LocalProjectController: 'client/controllers/localproject',
        RemoteProjectController: 'client/controllers/remoteproject',
        InputMCController: 'client/controllers/input_mc',
        InputListController: 'client/controllers/input_list',

        // Models
        User: 'models/user',
        Project: 'models/project',
        BasicBlock: 'models/basicblock',
        AutoBlock: 'models/blocks/autoblock',
        MCBlock: 'models/blocks/mcblock',
        TextBlock: 'models/blocks/textblock',
        ListBlock: 'models/blocks/listblock',
        BasicConnector: 'models/basicconnector',
        LabeledConnector: 'models/connectors/labeledconnector'
    }
});

requirejs(["dashboard/controllers" + window.location.pathname]);
