define("SettingsController", ["jquery", "handlebars", "Observable", "text!/editor/views/settings.html"],
function($, Handlebars, Observable, view) {

  return class SettingsController extends Observable {
    constructor() {
        super();
        this.settingsTemplate = Handlebars.compile(view);
    }

    bindEvents() {
      $('#btn_settings_confirm').on('click', {self: this}, this.save_settings);

      $('#settings_form').submit({self: this}, function(event){

        event.preventDefault();

        $.ajax({
            url: $(this).attr("action"),
            type: $(this).attr("method"),
            dataType: "JSON",
            data: new FormData(this),
            headers: { 'projectid': $('#projectid').val() },
            processData: false,
            contentType: false,
            success: function (data, status)
            {
                /*if ($('#avatar_image').val() !== '') {
                    var filename = 'uploads/' + $('#projectid').val() + '/' + 'avatar.' + $('#avatar_image').val().split('.')[1];       
                    console.log(filename);
                    event.data.self.notifyAll('update_settings', {avatar_image: filename, bot_name: $('#bot_name').val() });    
                }
                else {*/
                    event.data.self.notifyAll('update_settings', {bot_name: $('#bot_name').val() });    
                //}                
            },
            error: function (xhr, desc, err)
            {            
                console.log(err);
                event.data.self.notifyAll('close_overlay');
            }
        });        

      });      
    }

    render(settings) {
        if (this.dom !== undefined) {
            this.dom.remove();
        }

        this.dom = $(this.settingsTemplate(settings));
        $('#editor_container').append(this.dom);
    }

    show(settings) {
        settings.avatar_image = '/' + settings.avatar_image;
        this.render(settings);
        this.bindEvents();
        this.dom.show( "scale", 250, function() {
            // Animation complete.
        });
    }

    hide() {
        this.dom.hide( "scale", 250, function() {
            // Animation complete.
        });
    }

    save_settings(event) {
        $('#settings_form').submit();
    }
  }

});
