﻿//Note
;(function($){
    MKNoteWebclipper.Note = {
        clipper: MKNoteWebclipper,
        saveNote: function(title, sourceurl, notecontent, tags, categoryid, noteid, importance, successCallback, failCallback){
            var self = this;
            self.clipper.checkLogin(function(){
                self._saveNote(title, sourceurl, notecontent, tags, categoryid, noteid, importance, successCallback, failCallback);
            });
        },
        _saveNote: function(title, sourceurl, notecontent, tags, categoryid, noteid, importance, successCallback, failCallback){
            var self = this;
            if(!title && !notecontent){
                self.notifyHTML('CannotSaveBlankNote');
                return;
            }
            var dataObj = {
                title: self.getTitleByText(title),
                sourceurl: sourceurl,
                notecontent: notecontent,
                tags: tags || '',
                categoryid: categoryid || '',
                noteid: noteid || '',
                importance: importance || 0
            }
            self.notifyHTML('IsSavingNote', false);
            $.ajax({
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                type:'POST',
                url: self.clipper.baseUrl + '/note/save',
                data: JSON.stringify(dataObj),
                success: function(data){
                    if(data.error){
                        if(data.error == 'notlogin'){
                            self.notifyHTML('NotLogin');
                        }else{
                            self.notifyHTML('SaveNoteFailed');
                        }
                        failCallback && failCallback();
                        return;
                    }
                    self.notifyHTML('SaveNoteSuccess');
                    self.clipper.Util.log(data);
                    successCallback && successCallback();
                    var successTip = self.getI18nMessage('SaveNoteSuccess'),
                    viewURL = self.clipper.baseUrl + '/note/previewfull/' + data.Note.NoteID,
                    viewTxt = self.getI18nMessage('ViewText');
                    self.notifyHTML(successTip + '<a href="' + viewURL + '" target="_blank" id="customclosebtn">' + viewTxt + '</a>', 10000, true);
                },
                error: function(jqXHR, textStatus, errorThrown){
                    failCallback && failCallback();
                    self.notifyHTML('SaveNoteFailed');
                    self.clipper.Util.log(textStatus);
                    self.clipper.Util.log(errorThrown);
                }
            });
        },
        notifyHTML: function(message, lastTime, purgeText){
            var self = this;
            message = purgeText ? message : self.getI18nMessage(message);
            self.clipper.Notification.show(message, lastTime);
        },
        getI18nMessage: function(i18nString){
            return this.clipper.i18n.getMessage('mknotewebclipper.' + i18nString);
        },
        getTitleByText: function(txt){
            var self = this,
            finalTitle = '';
            if(txt.length <= 100) return txt;
            if(txt.length > 0){
                var t = txt.substr(0, 100), l = t.length, i = l - 1, hasSpecialChar = false;
                //9 : HT 
                //10 : LF 
                //44 : ,
                //65292 : ，
                //46 :　．
                //12290 : 。
                //59 : ;
                //65307 : ；
                while(i >= 0){
                    if(/^(9|10|44|65292|46|12290|59|65307)$/.test(t.charCodeAt(i))){
                        hasSpecialChar = true;
                        break;
                    }else{
                        i--;
                    }
                }
                hasSpecialChar ? (t = t.substr(0, i)) : '';
                i = 0;
                l = t.length;
                while(i < l){
                    if(/^(9|10)$/.test(t.charCodeAt(i))){
                        break;
                    }else{
                        finalTitle += t.charAt(i);
                        i++;
                    }
                }
            }
            finalTitle = finalTitle.trim();
            return finalTitle.length > 0 ? finalTitle : ('[' + self.clipper.i18n.getMessage('DefaultTitle') + ']');
        },
    }
})(MKNoteWebclipper.jQuery);