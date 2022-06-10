define("Util", [], function() {

  return class Util {

    // Source: https://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity/3866442#3866442
    static setEndOfContenteditable(contentEditableElement)
    {
        var range,selection;
        if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
        {
            range = document.createRange();//Create a range (a range is a like the selection but invisible)
            range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
            range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
            selection = window.getSelection();//get the selection object (allows you to change selection)
            selection.removeAllRanges();//remove any selections already made
            selection.addRange(range);//make the range you have just created the visible selection
        }
        else if(document.selection)//IE 8 and lower
        {
            range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
            range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
            range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
            range.select();//Select the range (make it the visible selection
        }
    }

    // Source: https://stackoverflow.com/questions/33551502/set-max-length-for-content-editable-element
    static check_char_limit(event) {

      if (event.type == 'keydown') {
        if ($(this).text().length >= event.data.limit && !event.originalEvent.metaKey && !event.originalEvent.ctrlKey && event.keyCode != 8 && event.keyCode != 13) {
          event.preventDefault();
        }
      }

      var self = this;

      setTimeout(function() {
        if ($(self).text().length > event.data.limit) {
          $(self).text($(self).text().substring(0, event.data.limit));
          Util.setEndOfContenteditable(self);
        }

        else if ($(self).text().replace(/\s/g,'') != $(self).html().replace(/&nbsp;/g,'').replace(/\s/g,'')) {
          $(self).text($(self).text());
          Util.setEndOfContenteditable(self);
        }
      }, 100);

    }

  }

});
