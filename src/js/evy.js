/*******************************************************
                           EVY TOOLKIT
********************************************************/
(function ($) {
  var table= null;
  function Table(){
    var self = this;
    this.el=null;
    this.loading=true;
    this.options={};
    this.rq=false;
    var actualPage=1;
    this.refresh = function(){
      if(self.rq){
        self.rq.abort();
      }
      self.render();
    }
    this.render= function(complete){
      $(self.el).addClass('e-table-box');
      var loading= $('<div class="e-table-loading">Cargando...</div>').appendTo(self.el);
      if($(self.el).find('.e-table').length==1){
        var table= $(self.el).find('.e-table').first();
        $(loading).css('background-color', 'rgba(64, 128, 255, 0.8)');
        $(loading).css('color', '#fff');
        $(loading).css('margin-left', ($(self.el).width()-$(table).width())/2);
        $(loading).css('width', $(table).width()+2);
        $(loading).css('line-height', ($(table).height()+2) + 'px');
        $(loading).css('top', 0);
      }
      if(self.options.Pagination)
        self.options.PageSize= self.options.PageSize ? self.options.PageSize : 10;
      var url =self.options.Url;
      if(self.options.UrlExtra)
        url+= window[self.options.UrlExtra]();
      self.rq= $.ajax({
        dataType: "json",
        url: url
      }).done(function(data){
        if(data){
            self.options.Rows= data;
            draw();
            $(loading).remove();
            self.rq=false;
        }
      }).error(function(x, t, m) {
        if(t!='abort' && t!='timeout'){
          alert('Error: ' + t + ' - ' + m);
        }
        $(loading).remove();
        self.rq=false;
        if(t=="timeout"){
          self.refresh();
        }
      });
    };
    var draw= function(){
      var table, thead, tbody, tfoot, tr, th, td = null;
      $(self.el).find('table').first().remove();
      table= $('<table class="e-table">').appendTo(self.el);
      if(self.options.Classes) $(table).addClass(self.options.Classes);
      $(table).css('width', self.options.Width ? self.options.Width : 'auto');
      if(self.options.MinWidth) $(table).css('min-width', self.options.MinWidth);
      $(table).css('margin', '0 auto');
      thead= $('<thead>').appendTo(table);
      tr= $('<tr>').appendTo(thead);
      jQuery.each(self.options.Columns, function(i, column) {
        header= $('<th>').appendTo(tr);
        header.append(column.Title);
      });
      if(self.options.Buttons){
        header= $('<th>').appendTo(tr);
        header.append('Opciones');
      }
      tbody= $('<tbody>').appendTo(table);
      var count_rows=0;
      var count_cols=0;
      jQuery.each(self.options.Rows, function(i, row) {
        count_rows++;
        if(!self.options.Pagination || (i>=(self.options.PageSize*actualPage-self.options.PageSize) &&i<self.options.PageSize*actualPage)){
          tr= $('<tr>').appendTo(tbody);
          jQuery.each(self.options.Columns, function(j, column) {
            var tdname= column.Id ? column.Id : column.Name;
            td= $('<td data-name="'+ tdname +'">').appendTo(tr);
            var parts= column.Name.split('.');
            if(parts.length==1){
              $(td).append(row[column.Name]);
            }
            else{
              var length= parts.length;
              var obj=row[parts[0]];
              if(obj){
                jQuery.each(parts, function(k, p) {
                  if(k!=0){
                    if(k==length-1){
                      $(td).append(obj[parts[k]]);
                    }
                    else{
                      obj=obj[p];
                    }
                  }
                });
              }
            }
          });
          var buttons= typeof self.options.Buttons != 'undefined';
          if(buttons){
            td= $('<td class="row-functions">').appendTo(tr);
            jQuery.each(self.options.Buttons, function(k, button) {
              var btn= $('<div class="e-button">').appendTo(td);
              $(btn).click(function () {
                  window[button.Action](row, $(this).parent().parent());
              })
              if(button.Classes)
                $(btn).addClass(button.Classes);
              if(button.Text){
                if(button.Icon){
                  button.Text= ' ' + button.Text;
                }
                $(btn).append(button.Text);
              }

              if(button.Icon)
                $(btn).prepend('<i class="fa fa-'+button.Icon+'"></i>');
          });
          }
          if(self.options.OnRowDrawed){
            window[self.options.OnRowDrawed](tr[0], row);
          }
        }
      });
      count_cols= $(tr).children().length;
      if(self.options.Pagination && self.options.PageSize-count_rows>0){
        tr= $('<tr style="height:'+ (self.options.PageSize-count_rows)*50 +'px">').appendTo(tbody);
        cell= $('<td colspan="'+count_cols+'">').appendTo(tr);
      }
      if(self.options.Pagination){
        var colspan= self.options.Buttons ?  self.options.Columns.length+1 : self.options.Columns.length;
        tfoot= $('<tfoot>').appendTo(table);
        tr = $('<tr>').appendTo(tfoot);
        th = $('<th colspan="'+colspan+'" style="text-align:center">').appendTo(tr);
        var bLeft= $('<div class="fa fa-arrow-circle-left">').appendTo(th);
        var pages = Math.ceil(self.options.Rows.length!=0 ? self.options.Rows.length / self.options.PageSize: 1);
        for(var i=1; i<=pages;i++){
          var page=null;
          if(actualPage==i){
            page= $('<span class="e-page e-active">' + i + '</span>').appendTo(th);
          }
          else{
            page= $('<span class="e-page">' + i + '</span>').appendTo(th);
          }
          $(page).on('click', function(){
            var newPage=$(this).text();
            if(newPage!=actualPage){
              actualPage=newPage;
              draw();
            }
          })
        }

        var bRight= $('<div class="fa fa-arrow-circle-right">').appendTo(th);

        if(actualPage==1){
          $(bLeft).addClass('e-disabled');
        }
        if(actualPage==pages){
          $(bRight).addClass('e-disabled');
        }

        $(bLeft).on('click', function(){
          if(actualPage!=1){
            actualPage--;
            draw();
          }
        })

        $(bRight).on('click', function(){
          if(actualPage!=pages){
            actualPage++;
            draw();
          }
        })
      }
    }
  }
  var loadTab= function(item){
      var index= item.attr('data-index');
      var content= item.closest('.e-menu').find(".e-menu-tabs-content .e-item[data-index='" + index +"']");
      var url = $(item).attr('data-url');
      if (typeof url !== typeof undefined && url !== false) {
        $(content).html('Cargando. Espere...');
        $.ajax({
          crossOrigin: true,
          url: url,
          success: function(data) {
           $(content).html(data);
          }
        });
        //$(content).load(url, function() {});
      }
  }

  var loadSection= function(item, contentBox){
      var url = $(item).attr('data-url');
      if (typeof url !== typeof undefined && url !== false) {
        $(contentBox).html('Cargando. Espere...');
        $.ajax({
          crossOrigin: true,
          url: url,
          success: function(data) {
           $(contentBox).html(data);
          }
        });
      }
  }

  var getActualDate= function(){
    var today = new Date();
    var d = today.getDate();
    var m = today.getMonth()+1;
    var y= today.getFullYear();
    if(d<10)
      d='0'+d;
    if(m<10)
      m='0'+m;
    return d+'/'+m+'/'+y;
  }

  var getActualHour= function(){
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    if(h<10)
      h='0'+h;
    if(m<10)
      m='0'+m;
    if(s<10)
      s='0'+s;
    return h+':'+m+':'+s;
  }

  var completeDigits = function(i){
    if(i<10)
      return '0' + i;
    return i;
  }
  $.extend({
    evy: function(){
      var init= function(){
        $.each($('.e-menu'), function( key, menu ) {
          //menu-bar
          if($(menu).hasClass('e-menu-bar') || $(menu).hasClass('e-menu-bar-xl')
            || $(menu).hasClass('e-menu-bar-sm') || $(menu).hasClass('e-menu-bar-md')
            || $(menu).hasClass('e-menu-bar-lg')
          ){
            $(menu).menuBar();
          }
          //menu-tab
          if($(menu).hasClass('e-menu-tab')){
            $(menu).menuTab();
          }

          //menu-sidebar
          if($(menu).hasClass('e-menu-sidebar')){
            $(menu).menuSidebar();
          }

        });
      };
      init();
      return this;
    },
    openWindow: function(options){
      if(!options) options={};
      if(options.Url){
        var ewindow= $('<div>').appendTo('body');
        var overlay= $('<div class="e-overlay">').insertBefore(ewindow);
        if(options.Name)
          $(ewindow).attr('id', options.Name);
        var content= $('<div class="e-window-content">').appendTo(ewindow);
        $.showWait();
        $(content).load(options.Url, function() {
          if(options.OnLoad) window[options.OnLoad]();
          //$.hideWait();
          //document.body.style.overflow = 'hidden';
          var documentTitle= document.title;
          if(options.State){
            window.history.pushState({path: options.State.NewUrl}, '', options.State.NewUrl);
            document.title=options.State.Title;
          }
          if(options.Class)
            $(ewindow).addClass(options.Class);

          var eheader= $('<div class="e-window-header">').prependTo(ewindow);
          if(options.ClassHeader)
              $(eheader).addClass(options.ClassHeader);
          if(options.Title){
            var etitle= $('<div class="e-window-title">').appendTo(eheader);
            $(etitle).html(options.Title);
          }
          var ewindowoptions=$('<div class="e-window-options">').appendTo(eheader);
          var close= $('<div class="e-window-close">').appendTo(ewindowoptions);
          $(close).append('<i class="fa fa-close"><i>');
          $('html').css('overflow-y', 'hidden');
          $(ewindow).on("click", ".e-window-header .e-window-close" ,function() {
           if(options.OnClose) window[options.OnClose]();
           document.body.style.overflow = '';
           $(overlay).remove();
           $(ewindow).remove();
           if(options.State){
             window.history.back();
             document.title=documentTitle;
           }
           $('html').css('overflow-y', 'auto');
         });
         $.closeWait();
         $(ewindow).addClass('e-window');

         if(options.FullScreen){
           options.MinWidth = String($(window).width());
           options.MinHeight = String($(window).height());
         }

         var minWidth= options.MinWidth ? options.MinWidth : 0;
         if(minWidth!=0 && $(window).outerWidth(false)>=Number(minWidth.replace('px', '').replace('%', ''))){
           $(ewindow).css('min-width', minWidth + 'px');
         }
         var minHeight= options.MinHeight ? options.MinHeight : 0;
         if(minHeight!=0 && $(window).outerHeight(false)>=Number(minHeight.replace('px', '').replace('%', ''))){
           $(ewindow).css('min-height', minHeight + 'px');
         }

         var width= options.Width ? options.Width : $(window).outerWidth(false);
         var height= options.Height ? options.Height : $(window).outerHeight(false);


         var maxWidth= options.MaxWidth ? options.MaxWidth : 0;
         if(maxWidth!=0 && $(window).outerWidth(false)>Number(maxWidth.replace('px', '').replace('%', ''))){
           $(ewindow).css('max-width', maxWidth);
         }
         else{
          $(ewindow).css('max-width', $(window).outerWidth(false)>$(ewindow).outerWidth() ? $(ewindow).outerWidth() : $(window).outerWidth(false)-10);
         }
         var maxHeight= options.MaxHeight ? options.MaxHeight : 0;
         if(maxHeight!=0 && $(window).outerHeight(false)>Number(maxHeight.replace('px', '').replace('%', ''))){
           $(ewindow).css('max-height', maxHeight);
         }
         else{
           $(ewindow).css('height', $(window).outerHeight(false)>$(ewindow).outerHeight() ? $(ewindow).outerHeight() : $(window).outerHeight(false)-10);
         }
         var top= $(window).outerHeight(false)>$(ewindow).outerHeight() ? ($(window).outerHeight(false) - $(ewindow).outerHeight())/2 : 0;
         var left= $(window).outerWidth(false)>$(ewindow).outerWidth() ? ($(window).outerWidth(false) - $(ewindow).outerWidth())/2 : 0;

         $(ewindow).css('top', top + 'px');
         $(ewindow).css('left', left + 'px');
         $(content).css('max-height', $(ewindow).outerHeight(false)-$(eheader).outerHeight(false));
         if(options.FullScreen)
          $(content).css('min-height', $(ewindow).outerHeight(false)-$(eheader).outerHeight(false));
       });
     }
    },
    closeWindow: function(name){
      var w= null;
      if(name) w= $('#'+ name);
      else w=$('.e-window');
      $(w).prev().remove();
      $(w).remove();
      if($('.e-window').length==0){
        $('html').css('overflow-y', 'auto');
      }
    },
    showConfirmMessage: function (options) {
      if(!options) options={};
      options.OnConfirm= options.OnConfirm ? options.OnConfirm : function () { };
      options.OnCancel= options.OnCancel ? options.OnCancel : function () { };
      var overlay= $('<div class="e-overlay">').appendTo('body');
      var ewindow= $('<div id="e-window">').appendTo('body');
      var eheader= $('<div class="e-window-header e-bg-orange">').prependTo(ewindow);
      $(eheader).append('<div class="e-window-title">'+ options.Title +'</div>');
      var content= $('<div class="e-window-content e-center">').appendTo(ewindow);
      $(content).append('<p>'+ options.Message +'</>');
      $(ewindow).addClass('e-window');
      var top= $(window).outerHeight(false)>$(ewindow).outerHeight() ? ($(window).outerHeight(false) - $(ewindow).outerHeight())/2 : 0;
      var left= $(window).outerWidth(false)>$(ewindow).outerWidth() ? ($(window).outerWidth(false) - $(ewindow).outerWidth())/2 : 0;
      $(ewindow).css('top', top + 'px');
      $(ewindow).css('left', left + 'px');
      buttons= $('<div class="e-row e-form-buttons">').appendTo(content);
      confirm= $('<input type="button" class="e-button e-bg-green" value="Aceptar"/>').appendTo(buttons);
      cancel= $('<input type="button" class="e-button e-bg-red" value="Cancelar"/>').appendTo(buttons);
      $(confirm).click(function () {
        options.OnConfirm();
        $(overlay).remove();
        $(ewindow).remove();
      });
      $(cancel).click(function () {
        options.OnCancel();
        $(overlay).remove();
        $(ewindow).remove();
      });
    },
    showMessage: function(message, options){
      if(!options) options={};
      options.Type= options.Type ? options.Type : 'None';
      options.Time= options.Time ? options.Time : 5000;
      var messagesBox= null;
      if($('.e-messages-box').length!=0){
        messagesBox=$('.e-messages-box').first();
      }
      else{
        messagesBox= $('<div class="e-messages-box">').appendTo('body');
      }
      var emessage= $('<div class="e-message">').appendTo(messagesBox);
      $(emessage).html(message);
      switch (options.Type) {
        case 'Success': $(emessage).addClass('e-bg-green'); break;
        case 'Danger': $(emessage).addClass('e-bg-red'); break;
        case 'Warning': $(emessage).addClass('e-bg-yellow'); break;
        case 'None': $(emessage).addClass('e-bg-blue'); break;
      }
      $(emessage).on('click', function () {
        $(this).remove();
        if(messagesBox.html()==='') $(messagesBox).remove();
      });
      var timeout=null;
      timeout= setTimeout(function () {
        $(emessage).remove();
        if(messagesBox.html()==='') $(messagesBox).remove();
        clearTimeout(timeout);
      }, options.Time);
    },
    showSuccessMessage: function (message) {
      this.showMessage(message, {Type: 'Success'});
    },
    showDangerMessage: function (message) {
      this.showMessage(message, {Type: 'Danger'});
    },
    showWarningMessage: function (message) {
      this.showMessage(message, {Type: 'Warning'});
    },
    showWait: function(options){
      if(!options) options={};
      options.Message= options.Message ? options.Message : 'Espere...';
      options.Classes= options.Classes ? options.Classes : 'e-wait-default';
      var waitBox= null;
      waitBox= $('<div class="e-wait-box">').appendTo('body');
      var overlay= $('<div class="e-overlay">').insertBefore(waitBox);
      var emessage= $('<div class="e-wait-message">').appendTo(waitBox);
      $(waitBox).addClass(options.Classes);
      $(emessage).append('<i class="fa fa-clock-o"></i>');
      $(emessage).append('<span> ' + options.Message + '</span>');
      var top= ($(window).outerHeight(false) - $(waitBox).outerHeight())/2;
      var left= ($(window).outerWidth(false) - $(waitBox).outerWidth())/2;
      $(waitBox).css('top', top);
      $(waitBox).css('left', left);
    },
    closeWait: function(){
      $('.e-wait-box').prev().remove();
      $('.e-wait-box').remove();
    }
  });
  $.fn.menuBar=function (){
    var menu= $(this);
    var button= $('<div class="e-menu-bar-button"><i class="fa fa-bars"></i></div>').insertAfter(menu);
    button.on('click', function(){
      if(menu.hasClass('e-menu-bar-open'))
      {
        menu.removeClass('e-menu-bar-open');
        button.css('color', 'inherit');
      }else{
        menu.addClass('e-menu-bar-open');
        button.css('color', menu.css('color'));
      }
    });
    menu.on('click', '.e-item',function(){
      if(menu.hasClass('e-menu-bar-open'))
      {
        menu.removeClass('e-menu-bar-open');
      }
    });
  };
  $.fn.menuTab=function (){
    var menu= $(this);
    var active= menu.find('.e-menu-tabs .e-active');
    loadTab(active);
    menu.find('.e-menu-tabs .e-item').on('click', function(){
      var item= $(this);
      var index= item.attr('data-index');
      menu.find('.e-menu-tabs-content .e-active').removeClass('e-active');
      var content= menu.find(".e-menu-tabs-content .e-item[data-index='" + index +"']").addClass('e-active');
      $(content).addClass('e-active');
      menu.find('.e-menu-tabs .e-active').removeClass('e-active');
      item.addClass('e-active');
      loadTab(item);
    });
  };
  $.fn.menuSidebar=function (){
    console.log('entra');
    var menu= $(this);
    var active= menu.find('.e-active');
    loadSection(active, menu.next());
    menu.find('.e-item').on('click', function(){
      var item= $(this);
      if( item[0].hasAttribute('data-url') ){
        menu.find('.e-active').removeClass('e-active');
        item.addClass('e-active');
        loadSection(item, menu.next());
      }

    });
  };
  $.fn.table = function(options){
    var el= this;
    if(!table){
      table= new Table();
    }
    if(options){
      table.el=this;
      table.options= options;
      table.render();
    }
    return table;
  };
  $.fn.datePicker=function (){
    function validateDate(dateString){
      //METHOD from http://stackoverflow.com/a/6178341
      if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
          return false;
      var parts = dateString.split("/");
      var day = parseInt(parts[0], 10);
      var month = parseInt(parts[1], 10);
      var year = parseInt(parts[2], 10);
      if(year < 1000 || year > 3000 || month == 0 || month > 12)
          return false;
      var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
      if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
          monthLength[1] = 29;
      return day > 0 && day <= monthLength[month - 1];
    }

    function setDays(dpd, d, m, y){
      $(dpd).html('');
      var limit= 28;
      if(m==1 || m==3 || m==5 || m==7 || m==8 || m==10 || m==12 ){
        limit=31;
      }
      else{
        if(m==4 || m==6 || m==9 || m==11){
          limit=30;
        }
        else{
          if(y % 400 == 0 || (y % 100 != 0 && y % 4 == 0))
            limit = 29;
        }
      }
      for(var i=1; i<=limit; i++){
        var str= completeDigits(i);
        if(i==d)
          $(dpd).append('<option value="'+ str +'" selected>'+ str +'</option>');
        else
          $(dpd).append('<option value="'+ str +'">'+ str +'</option>');
      }
      $(target).val($(dpd).val() + '/' + $(dpm).val() + '/' + $(dpy).val());
    }
    var target= $(this);
    $(target).css('display', 'none');
    var actualDate= $(target).val();
    if(!actualDate || !validateDate(actualDate)){
      actualDate= getActualDate();
    }
    //$(this).css('display', 'none');
    var parts = actualDate.split("/");
    var d = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    var y = parseInt(parts[2], 10);
    var dp= $('<div>').insertAfter(target);
    var dpd= $('<select class="e-select e-date-picker"></select>').appendTo(dp);
    var dpm= $('<select class="e-select e-date-picker e-date-picker-month"></select>').appendTo(dp);
    for(var i=1; i<=12; i++){
      var str= completeDigits(i);
      if(i==m)
        $(dpm).append('<option value="'+ str +'" selected>'+ str +'</option>');
      else
        $(dpm).append('<option value="'+ str +'">'+ str +'</option>');
    }
    var dpy= $('<select class="e-select e-date-picker e-date-picker-year"></select>').appendTo(dp);
    for(var i=2000; i<=2027; i++){
      if(i==y)
        $(dpy).append('<option value="'+ i +'" selected>'+ i +'</option>');
      else
        $(dpy).append('<option value="'+ i +'">'+ i +'</option>');
    }
    setDays(dpd, d, m, y);
    $(dp).on('change', 'select', function(){
      setDays(dpd, $(dpd).val(), $(dpm).val(), $(dpy).val());
    })
  };
  $.fn.timePicker=function (){
    var target= $(this);
    $(target).css('display', 'none');
    var actualHour= $(target).val();
    if(!actualHour || !(/^([01]\d|2[0-3]):?([0-5]\d):?([0-5]\d)$/.test(actualHour))){
      actualHour= getActualHour();
    }
    var h= actualHour.substr(0, 2);
    var m= actualHour.substr(3, 2);
    var tp= $('<div>').insertAfter(target);
    var tph= $('<select class="e-select e-time-picker"></select>').appendTo(tp);
    for(var i=0; i<=23; i++){
      if(i<10)
        i= '0' + i;
      if(i==h)
        $(tph).append('<option value="'+ i +'" selected>'+ i +'</option>');
      else
        $(tph).append('<option value="'+ i +'">'+ i +'</option>');
    }
    $(tp).append('<span>:</span>');
    var tpm= $('<select class="e-select e-time-picker"></select>').appendTo(tp);
    for(var i=0; i<=59; i++){
      if(i<10)
        i= '0' + i;
      if(i==m)
        $(tpm).append('<option value="'+ i +'" selected>'+ i +'</option>');
      else
        $(tpm).append('<option value="'+ i +'">'+ i +'</option>');
    }
    $(target).val($(tph).val() + ':' + $(tpm).val());
    $(tp).on('change', 'select', function(){
      $(target).val($(tph).val() + ':' + $(tpm).val());
    })
  };
} (jQuery));

// Hello Evy!!
$(document).ready(function() {
  var evy= $.evy();
});
