(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
; var __browserify_shim_require__=require;(function browserifyShim(module, exports, require, define, browserify_shim__define__module__export__) {
/* Nano Templates - https://github.com/trix/nano */

function nano(template, data) {
  return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
    var keys = key.split("."), v = data[keys.shift()];
    for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
    return (typeof v !== "undefined" && v !== null) ? v : "";
  });
}

; browserify_shim__define__module__export__(typeof nano != "undefined" ? nano : window.nano);

}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){
/* global jQuery */

;(function($, window, document, undefined) { 
  'use strict';
  var HumanPicker,
      nano = require("nano");
  
  // ===========================
  // HUMAN PICKER CLASS
  // ===========================
  HumanPicker = function (element, options) { 
    this.options   = $.extend({}, HumanPicker.DEFAULTS, options);
    
    this.$element  = $(element);
    this.$bodyListContainer = this._renderTpl(HumanPicker.Tpl.BodyListContainer, 
                                  {id: this.$element.prop('id')+'_HumanPickerListContainer'});
    this.$ageListWrap = this._renderTpl(HumanPicker.Tpl.AgeListWrap);
    this.$ageListWrap.appendTo(this.$bodyListContainer);
    
    this.$bodyListContainer.appendTo(document.body);
    
    this._render();
    this._bindEvents();
  };

  HumanPicker.prototype._getI18n = function (key){
    return HumanPicker.i18n[this.options.lang][key];
  };
  
  HumanPicker.prototype.destroy = function()
  {
    this.$element.empty();
    this.$bodyListContainer.empty();
    this.$bodyListContainer.remove();
  };
  
  HumanPicker.prototype._renderTpl = function(template, data){
    return $(nano(template, data));
  };
  
  HumanPicker.prototype._render = function(){
    var self = this,
        $wrap = this._renderTpl(HumanPicker.Tpl.Wrap),
        opts = this.options,
        initVal = opts.initialValue,
        optKidAges = initVal.kidsAges && initVal.kidsAges instanceof Array?initVal.kidsAges:[],
        i;
        
    this.$element.empty();
    
    //adults
    for(i = 0; i < opts.adultsCount; i++){
      self._renderTpl(HumanPicker.Tpl.AdultItem)
        .addClass(i<initVal.adults?HumanPicker.CLASS.classItemSelected:'')
        .appendTo($wrap);
    };
    
    // adults, kids input
    self._renderTpl(HumanPicker.Tpl.HiddenInput, {role: "adults", name: opts.adultsParamName, value: initVal.adults})
    .appendTo($wrap);
    
     self._renderTpl(HumanPicker.Tpl.HiddenInput, {role: "kids", name: opts.kidsParamName, value: initVal.kids})
    .appendTo($wrap);
    
    //kids
    for(i = 0; i < opts.adultsCount; i++){        
      self._renderTpl(HumanPicker.Tpl.KidItem, {age: optKidAges[i] || 0})
        .append(
          self._renderTpl(HumanPicker.Tpl.HiddenInput, {role: "kid-age", name: opts.kidsAgesParamName, value: optKidAges[i] || 0})
          .prop("disabled",i>=initVal.kids))
        .addClass(i<initVal.kids?HumanPicker.CLASS.classItemSelected:'')
        .appendTo($wrap);
    };
    
    // hidden kid age picker
    if(opts.kidAgeItems.length > 0)
    {
      self._renderKidAgeList();
    }
    
    self.$element.append($wrap);

    self._updateTooltips();
  };
  
  HumanPicker.prototype._renderKidAgeList = function(){
    var self = this,
        opts = this.options,
        groupMaxItems = opts.kidAgeItemsGroupMax || 1,
        groupsCount = Math.max(((opts.kidAgeItems.length || 1) / groupMaxItems).toFixed() - 0, 1),
        list, i,j,max;
        
      this.$ageListWrap.empty();
        
      for(i=0; i<groupsCount; i++){
        list = self._renderTpl(HumanPicker.Tpl.AgeList);
        max = Math.min((i*groupMaxItems)+groupMaxItems, opts.kidAgeItems.length);
        for(j=i*groupMaxItems; j<max; j++)
        {
          self._renderTpl(HumanPicker.Tpl.AgeListItem, opts.kidAgeItems[j])
            .appendTo(list);
        }
        list.appendTo(this.$ageListWrap);
      }
  };
  
  HumanPicker.prototype.value = function(value){
    if(value && typeof value == 'object'){
      this._setValue(value);
    }
    else{
      return this._getValue();
    }
  };
  
  HumanPicker.prototype._setValue = function(value){
    // TODO: Realize     
  }
  
  HumanPicker.prototype._getValue = function(){
    var objRes = {},
        inputAdults = this.$element.find('input[data-role="adults"]'),
        inputKids = this.$element.find('input[data-role="kids"]'),
        inputKidAges = this.$element.find('.'+HumanPicker.CLASS.classItemSelected+' input[data-role="kid-age"]');      
        
    objRes.adults = inputAdults.val();
    objRes.kids = inputKids.val();
    
    objRes.kidsAges = objRes.kidsAges || [];
    if(inputKidAges.length){       
      objRes.kidsAges = $.map(inputKidAges, function(item, index){; 
        return item.value-0;
      });
    }
    return objRes;
  };

  HumanPicker.prototype._updateTooltips = function(){
    var self = this,
        elem = self.$element;

    elem.find("."+HumanPicker.CLASS.classItem).each(function(i, item){
        var $item = $(item);
        var titleKey = $item.hasClass(HumanPicker.CLASS.classItemSelected)?"tooltipItemSelected":"tooltipItem";
        $($item).attr("title", self._getI18n(titleKey));
    });

    elem.find('.kid-age-caption').each(function(i, item){
      var $item = $(item);
      if($item.closest("."+HumanPicker.CLASS.classItem).hasClass(HumanPicker.CLASS.classItemSelected)){
          $item.attr("title", self._getI18n("tooltipEditAge"));
      }
      else{
          $item.removeAttr("title");
      }      
    });
            
  };
  
  HumanPicker.prototype._bindEvents = function(){
    var self = this,
        updateKidsCountValue = function(){
          self.$element.find('input[data-role="kids"]')
            .val(self.$element.find('[data-role="kid-item"].'+HumanPicker.CLASS.classItemSelected).length);
        };
        
    self.$element
      .find("[data-role='adult-item']")
      .on("click",function(e){
        var input = self.$element.find('input[data-role="adults"]');
        $(this).toggleClass(HumanPicker.CLASS.classItemSelected);
        input.val(self.$element.find('[data-role="adult-item"].'+HumanPicker.CLASS.classItemSelected).length);
        self._updateTooltips();
    });
    
    self.$element
      .find("[data-role='kid-item']")
      .on("click",function(e){
        var $this = $(this),
            curVal = $this.find('input[data-role="kid-age"]').val() || 0;
        
        self._kidAgePickerClose();
        
        if($this.hasClass(HumanPicker.CLASS.classItemSelected)){
          $this.removeClass( HumanPicker.CLASS.classItemSelected);
          $this.find('.kid-age-caption').text(0);
          $this.find('input[data-role="kid-age"]')
            .prop("disabled",true)
            .val(0);
            
          updateKidsCountValue();
          self._updateTooltips();
        }
        else{
          $this.find('.kid-age-caption').trigger("click");
        }
    });

    self.$element
      .find(".kid-age-caption")
      .on("click",function(e){
        e.stopPropagation();
         var $this = $(this),
             $kidItem = $this.closest("[data-role='kid-item']"),
             curVal = $kidItem.find('input[data-role="kid-age"]').val() || 0;
         self._kidAgePickerShow($kidItem, curVal, function(valueItem){
            $this.text(valueItem.text.replace(/ /g,""));
            $kidItem.addClass( HumanPicker.CLASS.classItemSelected);
            $kidItem.find('input[data-role="kid-age"]')
              .prop("disabled",false)
              .val(valueItem.value);            
            updateKidsCountValue();
            self._updateTooltips();
          });
    });
    
    $(document)
      .off("click.humanpicker.document")
      .on("click.humanpicker.document", function(e){
        if($(e.target).closest('[data-role="kid-age-list"]').length ||
           $(e.target).closest('[data-role="kid-item"]').length){
            e.preventDefault()
            return;
        }
        self._kidAgePickerClose();
      });
      
    $(window)
      .off("resize.humanpicker.window")
      .on("resize.humanpicker.window", function(e){
        self._kidAgePickerClose();
      });
  }
  HumanPicker.prototype._kidAgePickerClose = function(){
    var kidAgeList = this.$ageListWrap;
    kidAgeList.hide();
  };
  
  HumanPicker.prototype._kidAgePickerShow = function(kidItem, curValue, callback){
    var ageClickEvent = "click.humanpicker",
        kidAgeList = this.$ageListWrap;
        
    kidAgeList.css("left", $(kidItem).offset().left);
    kidAgeList.css("top", $(kidItem).offset().top + $(kidItem).outerHeight() + 2);
        
    kidAgeList.find('[data-role="kid-age-item"]')
     .removeClass(HumanPicker.CLASS.classKidAgeSelected);
     
    kidAgeList.find('[data-role="kid-age-item"][data-value="'+curValue+'"]')
     .addClass(HumanPicker.CLASS.classKidAgeSelected);
        
    kidAgeList.find('[data-role="kid-age-item"]')
      .off(ageClickEvent)
      .on(ageClickEvent, function(e){
        kidAgeList.find('[data-role="kid-age-item"]')
          .removeClass(HumanPicker.CLASS.classKidAgeSelected);
        $(this).addClass(HumanPicker.CLASS.classKidAgeSelected);  
        
        callback.call(kidItem, {text: $(this).text(), value: $(this).data("value")});
        
        kidAgeList.hide();
      });
      
    kidAgeList.show();
  };
  
  // ===========================
  // HUMAN PICKER CSS CLASSES
  // ===========================
  HumanPicker.CLASS = {
    classItem: "human-picker-item",
    classItemSelected: 'human-picker-item-selected',
    classKidAgeSelected: 'kid-age-item-selected'
  };
  
  // ===========================
  // HUMAN PICKER LOCALES
  // ===========================
  HumanPicker.i18n = {
      "ru": {
        tooltipItem: "Добавить",
        tooltipItemSelected: "Удалить",
        tooltipEditAge: "Редактировать возраст",
      },
      "en": {
        tooltipItem: "Add",
        tooltipItemSelected: "Remove",
        tooltipEditAge: "Edit age"
      }
  };
  
  // ===========================
  // HUMAN PICKER TEMPLATES
  // ===========================
  HumanPicker.Tpl = {
    // TODO: use link 'a' like actions
    Wrap: '<ul class="human-picker"></ul>',
    AdultItem: '<li class="'+HumanPicker.CLASS.classItem+' human-picker-item-adult" data-role="adult-item"></li>',
    KidItem: '<li class="'+HumanPicker.CLASS.classItem+' human-picker-item-kid" data-role="kid-item"><div class="kid-age-caption">{age}</div></li>',
    BodyListContainer: '<div id={id}></div>',
    AgeListWrap: '<div style="display: none;" class="human-picker_kid-age-list-wrap" data-role="kid-age-list"></div>',
    AgeList: '<ul class="kid-age-list"></ul>',
    AgeListItem: '<li class="kid-age-item" data-role="kid-age-item" data-value="{value}">{text}</li>',
    HiddenInput: '<input data-role="{role}" name="{name}" type="hidden" value="{value}">',
  };
  
  HumanPicker.VERSION  = '1.0.0'
  
  // TODO: kidAgeItems translate?????
  HumanPicker.DEFAULTS = {
    adultsCount: 4, // maxAdults for select
    kidsCount: 3, // max kids for select
    initialValue: {
      adults: 2, // adults selected
      kids: 0, // kids selected
      kidsAges: [] // array ages of kids based on kids selected count, default age for kid 0
    },
    lang: "ru",
    adultsParamName: "adults",
    kidsParamName: "kids",
    kidsAgesParamName: "kidsAges[]",
    kidAgeItems:[
      {text: "0 лет", value: 0},
      {text: "1 год", value: 1},
      {text: "2 года", value: 2},
      {text: "3 года", value: 3},
      {text: "4 года", value: 4},
      {text: "5 лет", value: 5},
      {text: "6 лет", value: 6},
      {text: "7 лет", value: 7},
      {text: "8 лет", value: 8},
      {text: "9 лет", value: 9},
      {text: "10 лет", value: 10},
      {text: "11 лет", value: 11},
      {text: "12 лет", value: 12},
      {text: "13 лет", value: 13},
      {text: "14 лет", value: 14},
      {text: "15 лет", value: 15},
      {text: "16 лет", value: 16},
      {text: "17 лет", value: 17}
    ],
    kidAgeItemsGroupMax: 9
  };
  
  // =====================
  // INIT HUMAN PICKER JQUERY PLUGIN
  // =====================
  function humanPickerPlugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('xt.HumanPicker')
      var options = typeof option == 'object' && option

      if (!data) $this.data('xt.HumanPicker', (data = new HumanPicker(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }
  
  $.fn.HumanPicker             = humanPickerPlugin
  $.fn.HumanPicker.Constructor = HumanPicker
  
  // =====================
  // HUMAN PICKER DATA-API
  // =====================

  $(window).on('load', function () {
    $('[data-control="humanpicker"]').each(function () {
      var $element = $(this)
      var data = $element.data()
      humanPickerPlugin.call($element, data)
    })
  })
  
})( jQuery, window, document );
},{"nano":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1Byb2dyYW0gRmlsZXMvbm9kZWpzL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJib3dlcl9jb21wb25lbnRzL25hbm8vbmFuby5qcyIsInNyYy9qcXVlcnkuaHVtYW5waWNrZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCI7IHZhciBfX2Jyb3dzZXJpZnlfc2hpbV9yZXF1aXJlX189cmVxdWlyZTsoZnVuY3Rpb24gYnJvd3NlcmlmeVNoaW0obW9kdWxlLCBleHBvcnRzLCByZXF1aXJlLCBkZWZpbmUsIGJyb3dzZXJpZnlfc2hpbV9fZGVmaW5lX19tb2R1bGVfX2V4cG9ydF9fKSB7XG4vKiBOYW5vIFRlbXBsYXRlcyAtIGh0dHBzOi8vZ2l0aHViLmNvbS90cml4L25hbm8gKi9cclxuXHJcbmZ1bmN0aW9uIG5hbm8odGVtcGxhdGUsIGRhdGEpIHtcclxuICByZXR1cm4gdGVtcGxhdGUucmVwbGFjZSgvXFx7KFtcXHdcXC5dKilcXH0vZywgZnVuY3Rpb24oc3RyLCBrZXkpIHtcclxuICAgIHZhciBrZXlzID0ga2V5LnNwbGl0KFwiLlwiKSwgdiA9IGRhdGFba2V5cy5zaGlmdCgpXTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0ga2V5cy5sZW5ndGg7IGkgPCBsOyBpKyspIHYgPSB2W2tleXNbaV1dO1xyXG4gICAgcmV0dXJuICh0eXBlb2YgdiAhPT0gXCJ1bmRlZmluZWRcIiAmJiB2ICE9PSBudWxsKSA/IHYgOiBcIlwiO1xyXG4gIH0pO1xyXG59XHJcblxuOyBicm93c2VyaWZ5X3NoaW1fX2RlZmluZV9fbW9kdWxlX19leHBvcnRfXyh0eXBlb2YgbmFubyAhPSBcInVuZGVmaW5lZFwiID8gbmFubyA6IHdpbmRvdy5uYW5vKTtcblxufSkuY2FsbChnbG9iYWwsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgZnVuY3Rpb24gZGVmaW5lRXhwb3J0KGV4KSB7IG1vZHVsZS5leHBvcnRzID0gZXg7IH0pO1xuIiwiLyogZ2xvYmFsIGpRdWVyeSAqL1xyXG5cclxuOyhmdW5jdGlvbigkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHsgXHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG4gIHZhciBIdW1hblBpY2tlcixcclxuICAgICAgbmFubyA9IHJlcXVpcmUoXCJuYW5vXCIpO1xyXG4gIFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEhVTUFOIFBJQ0tFUiBDTEFTU1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIEh1bWFuUGlja2VyID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHsgXHJcbiAgICB0aGlzLm9wdGlvbnMgICA9ICQuZXh0ZW5kKHt9LCBIdW1hblBpY2tlci5ERUZBVUxUUywgb3B0aW9ucyk7XHJcbiAgICBcclxuICAgIHRoaXMuJGVsZW1lbnQgID0gJChlbGVtZW50KTtcclxuICAgIHRoaXMuJGJvZHlMaXN0Q29udGFpbmVyID0gdGhpcy5fcmVuZGVyVHBsKEh1bWFuUGlja2VyLlRwbC5Cb2R5TGlzdENvbnRhaW5lciwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7aWQ6IHRoaXMuJGVsZW1lbnQucHJvcCgnaWQnKSsnX0h1bWFuUGlja2VyTGlzdENvbnRhaW5lcid9KTtcclxuICAgIHRoaXMuJGFnZUxpc3RXcmFwID0gdGhpcy5fcmVuZGVyVHBsKEh1bWFuUGlja2VyLlRwbC5BZ2VMaXN0V3JhcCk7XHJcbiAgICB0aGlzLiRhZ2VMaXN0V3JhcC5hcHBlbmRUbyh0aGlzLiRib2R5TGlzdENvbnRhaW5lcik7XHJcbiAgICBcclxuICAgIHRoaXMuJGJvZHlMaXN0Q29udGFpbmVyLmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpO1xyXG4gICAgXHJcbiAgICB0aGlzLl9yZW5kZXIoKTtcclxuICAgIHRoaXMuX2JpbmRFdmVudHMoKTtcclxuICB9O1xyXG5cclxuICBIdW1hblBpY2tlci5wcm90b3R5cGUuX2dldEkxOG4gPSBmdW5jdGlvbiAoa2V5KXtcclxuICAgIHJldHVybiBIdW1hblBpY2tlci5pMThuW3RoaXMub3B0aW9ucy5sYW5nXVtrZXldO1xyXG4gIH07XHJcbiAgXHJcbiAgSHVtYW5QaWNrZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpXHJcbiAge1xyXG4gICAgdGhpcy4kZWxlbWVudC5lbXB0eSgpO1xyXG4gICAgdGhpcy4kYm9keUxpc3RDb250YWluZXIuZW1wdHkoKTtcclxuICAgIHRoaXMuJGJvZHlMaXN0Q29udGFpbmVyLnJlbW92ZSgpO1xyXG4gIH07XHJcbiAgXHJcbiAgSHVtYW5QaWNrZXIucHJvdG90eXBlLl9yZW5kZXJUcGwgPSBmdW5jdGlvbih0ZW1wbGF0ZSwgZGF0YSl7XHJcbiAgICByZXR1cm4gJChuYW5vKHRlbXBsYXRlLCBkYXRhKSk7XHJcbiAgfTtcclxuICBcclxuICBIdW1hblBpY2tlci5wcm90b3R5cGUuX3JlbmRlciA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgJHdyYXAgPSB0aGlzLl9yZW5kZXJUcGwoSHVtYW5QaWNrZXIuVHBsLldyYXApLFxyXG4gICAgICAgIG9wdHMgPSB0aGlzLm9wdGlvbnMsXHJcbiAgICAgICAgaW5pdFZhbCA9IG9wdHMuaW5pdGlhbFZhbHVlLFxyXG4gICAgICAgIG9wdEtpZEFnZXMgPSBpbml0VmFsLmtpZHNBZ2VzICYmIGluaXRWYWwua2lkc0FnZXMgaW5zdGFuY2VvZiBBcnJheT9pbml0VmFsLmtpZHNBZ2VzOltdLFxyXG4gICAgICAgIGk7XHJcbiAgICAgICAgXHJcbiAgICB0aGlzLiRlbGVtZW50LmVtcHR5KCk7XHJcbiAgICBcclxuICAgIC8vYWR1bHRzXHJcbiAgICBmb3IoaSA9IDA7IGkgPCBvcHRzLmFkdWx0c0NvdW50OyBpKyspe1xyXG4gICAgICBzZWxmLl9yZW5kZXJUcGwoSHVtYW5QaWNrZXIuVHBsLkFkdWx0SXRlbSlcclxuICAgICAgICAuYWRkQ2xhc3MoaTxpbml0VmFsLmFkdWx0cz9IdW1hblBpY2tlci5DTEFTUy5jbGFzc0l0ZW1TZWxlY3RlZDonJylcclxuICAgICAgICAuYXBwZW5kVG8oJHdyYXApO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgLy8gYWR1bHRzLCBraWRzIGlucHV0XHJcbiAgICBzZWxmLl9yZW5kZXJUcGwoSHVtYW5QaWNrZXIuVHBsLkhpZGRlbklucHV0LCB7cm9sZTogXCJhZHVsdHNcIiwgbmFtZTogb3B0cy5hZHVsdHNQYXJhbU5hbWUsIHZhbHVlOiBpbml0VmFsLmFkdWx0c30pXHJcbiAgICAuYXBwZW5kVG8oJHdyYXApO1xyXG4gICAgXHJcbiAgICAgc2VsZi5fcmVuZGVyVHBsKEh1bWFuUGlja2VyLlRwbC5IaWRkZW5JbnB1dCwge3JvbGU6IFwia2lkc1wiLCBuYW1lOiBvcHRzLmtpZHNQYXJhbU5hbWUsIHZhbHVlOiBpbml0VmFsLmtpZHN9KVxyXG4gICAgLmFwcGVuZFRvKCR3cmFwKTtcclxuICAgIFxyXG4gICAgLy9raWRzXHJcbiAgICBmb3IoaSA9IDA7IGkgPCBvcHRzLmFkdWx0c0NvdW50OyBpKyspeyAgICAgICAgXHJcbiAgICAgIHNlbGYuX3JlbmRlclRwbChIdW1hblBpY2tlci5UcGwuS2lkSXRlbSwge2FnZTogb3B0S2lkQWdlc1tpXSB8fCAwfSlcclxuICAgICAgICAuYXBwZW5kKFxyXG4gICAgICAgICAgc2VsZi5fcmVuZGVyVHBsKEh1bWFuUGlja2VyLlRwbC5IaWRkZW5JbnB1dCwge3JvbGU6IFwia2lkLWFnZVwiLCBuYW1lOiBvcHRzLmtpZHNBZ2VzUGFyYW1OYW1lLCB2YWx1ZTogb3B0S2lkQWdlc1tpXSB8fCAwfSlcclxuICAgICAgICAgIC5wcm9wKFwiZGlzYWJsZWRcIixpPj1pbml0VmFsLmtpZHMpKVxyXG4gICAgICAgIC5hZGRDbGFzcyhpPGluaXRWYWwua2lkcz9IdW1hblBpY2tlci5DTEFTUy5jbGFzc0l0ZW1TZWxlY3RlZDonJylcclxuICAgICAgICAuYXBwZW5kVG8oJHdyYXApO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgLy8gaGlkZGVuIGtpZCBhZ2UgcGlja2VyXHJcbiAgICBpZihvcHRzLmtpZEFnZUl0ZW1zLmxlbmd0aCA+IDApXHJcbiAgICB7XHJcbiAgICAgIHNlbGYuX3JlbmRlcktpZEFnZUxpc3QoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc2VsZi4kZWxlbWVudC5hcHBlbmQoJHdyYXApO1xyXG5cclxuICAgIHNlbGYuX3VwZGF0ZVRvb2x0aXBzKCk7XHJcbiAgfTtcclxuICBcclxuICBIdW1hblBpY2tlci5wcm90b3R5cGUuX3JlbmRlcktpZEFnZUxpc3QgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgIG9wdHMgPSB0aGlzLm9wdGlvbnMsXHJcbiAgICAgICAgZ3JvdXBNYXhJdGVtcyA9IG9wdHMua2lkQWdlSXRlbXNHcm91cE1heCB8fCAxLFxyXG4gICAgICAgIGdyb3Vwc0NvdW50ID0gTWF0aC5tYXgoKChvcHRzLmtpZEFnZUl0ZW1zLmxlbmd0aCB8fCAxKSAvIGdyb3VwTWF4SXRlbXMpLnRvRml4ZWQoKSAtIDAsIDEpLFxyXG4gICAgICAgIGxpc3QsIGksaixtYXg7XHJcbiAgICAgICAgXHJcbiAgICAgIHRoaXMuJGFnZUxpc3RXcmFwLmVtcHR5KCk7XHJcbiAgICAgICAgXHJcbiAgICAgIGZvcihpPTA7IGk8Z3JvdXBzQ291bnQ7IGkrKyl7XHJcbiAgICAgICAgbGlzdCA9IHNlbGYuX3JlbmRlclRwbChIdW1hblBpY2tlci5UcGwuQWdlTGlzdCk7XHJcbiAgICAgICAgbWF4ID0gTWF0aC5taW4oKGkqZ3JvdXBNYXhJdGVtcykrZ3JvdXBNYXhJdGVtcywgb3B0cy5raWRBZ2VJdGVtcy5sZW5ndGgpO1xyXG4gICAgICAgIGZvcihqPWkqZ3JvdXBNYXhJdGVtczsgajxtYXg7IGorKylcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzZWxmLl9yZW5kZXJUcGwoSHVtYW5QaWNrZXIuVHBsLkFnZUxpc3RJdGVtLCBvcHRzLmtpZEFnZUl0ZW1zW2pdKVxyXG4gICAgICAgICAgICAuYXBwZW5kVG8obGlzdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxpc3QuYXBwZW5kVG8odGhpcy4kYWdlTGlzdFdyYXApO1xyXG4gICAgICB9XHJcbiAgfTtcclxuICBcclxuICBIdW1hblBpY2tlci5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbih2YWx1ZSl7XHJcbiAgICBpZih2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcpe1xyXG4gICAgICB0aGlzLl9zZXRWYWx1ZSh2YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBlbHNle1xyXG4gICAgICByZXR1cm4gdGhpcy5fZ2V0VmFsdWUoKTtcclxuICAgIH1cclxuICB9O1xyXG4gIFxyXG4gIEh1bWFuUGlja2VyLnByb3RvdHlwZS5fc2V0VmFsdWUgPSBmdW5jdGlvbih2YWx1ZSl7XHJcbiAgICAvLyBUT0RPOiBSZWFsaXplICAgICBcclxuICB9XHJcbiAgXHJcbiAgSHVtYW5QaWNrZXIucHJvdG90eXBlLl9nZXRWYWx1ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgb2JqUmVzID0ge30sXHJcbiAgICAgICAgaW5wdXRBZHVsdHMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ2lucHV0W2RhdGEtcm9sZT1cImFkdWx0c1wiXScpLFxyXG4gICAgICAgIGlucHV0S2lkcyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnaW5wdXRbZGF0YS1yb2xlPVwia2lkc1wiXScpLFxyXG4gICAgICAgIGlucHV0S2lkQWdlcyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLicrSHVtYW5QaWNrZXIuQ0xBU1MuY2xhc3NJdGVtU2VsZWN0ZWQrJyBpbnB1dFtkYXRhLXJvbGU9XCJraWQtYWdlXCJdJyk7ICAgICAgXHJcbiAgICAgICAgXHJcbiAgICBvYmpSZXMuYWR1bHRzID0gaW5wdXRBZHVsdHMudmFsKCk7XHJcbiAgICBvYmpSZXMua2lkcyA9IGlucHV0S2lkcy52YWwoKTtcclxuICAgIFxyXG4gICAgb2JqUmVzLmtpZHNBZ2VzID0gb2JqUmVzLmtpZHNBZ2VzIHx8IFtdO1xyXG4gICAgaWYoaW5wdXRLaWRBZ2VzLmxlbmd0aCl7ICAgICAgIFxyXG4gICAgICBvYmpSZXMua2lkc0FnZXMgPSAkLm1hcChpbnB1dEtpZEFnZXMsIGZ1bmN0aW9uKGl0ZW0sIGluZGV4KXs7IFxyXG4gICAgICAgIHJldHVybiBpdGVtLnZhbHVlLTA7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG9ialJlcztcclxuICB9O1xyXG5cclxuICBIdW1hblBpY2tlci5wcm90b3R5cGUuX3VwZGF0ZVRvb2x0aXBzID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICBlbGVtID0gc2VsZi4kZWxlbWVudDtcclxuXHJcbiAgICBlbGVtLmZpbmQoXCIuXCIrSHVtYW5QaWNrZXIuQ0xBU1MuY2xhc3NJdGVtKS5lYWNoKGZ1bmN0aW9uKGksIGl0ZW0pe1xyXG4gICAgICAgIHZhciAkaXRlbSA9ICQoaXRlbSk7XHJcbiAgICAgICAgdmFyIHRpdGxlS2V5ID0gJGl0ZW0uaGFzQ2xhc3MoSHVtYW5QaWNrZXIuQ0xBU1MuY2xhc3NJdGVtU2VsZWN0ZWQpP1widG9vbHRpcEl0ZW1TZWxlY3RlZFwiOlwidG9vbHRpcEl0ZW1cIjtcclxuICAgICAgICAkKCRpdGVtKS5hdHRyKFwidGl0bGVcIiwgc2VsZi5fZ2V0STE4bih0aXRsZUtleSkpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZWxlbS5maW5kKCcua2lkLWFnZS1jYXB0aW9uJykuZWFjaChmdW5jdGlvbihpLCBpdGVtKXtcclxuICAgICAgdmFyICRpdGVtID0gJChpdGVtKTtcclxuICAgICAgaWYoJGl0ZW0uY2xvc2VzdChcIi5cIitIdW1hblBpY2tlci5DTEFTUy5jbGFzc0l0ZW0pLmhhc0NsYXNzKEh1bWFuUGlja2VyLkNMQVNTLmNsYXNzSXRlbVNlbGVjdGVkKSl7XHJcbiAgICAgICAgICAkaXRlbS5hdHRyKFwidGl0bGVcIiwgc2VsZi5fZ2V0STE4bihcInRvb2x0aXBFZGl0QWdlXCIpKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNle1xyXG4gICAgICAgICAgJGl0ZW0ucmVtb3ZlQXR0cihcInRpdGxlXCIpO1xyXG4gICAgICB9ICAgICAgXHJcbiAgICB9KTtcclxuICAgICAgICAgICAgXHJcbiAgfTtcclxuICBcclxuICBIdW1hblBpY2tlci5wcm90b3R5cGUuX2JpbmRFdmVudHMgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgIHVwZGF0ZUtpZHNDb3VudFZhbHVlID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAgIHNlbGYuJGVsZW1lbnQuZmluZCgnaW5wdXRbZGF0YS1yb2xlPVwia2lkc1wiXScpXHJcbiAgICAgICAgICAgIC52YWwoc2VsZi4kZWxlbWVudC5maW5kKCdbZGF0YS1yb2xlPVwia2lkLWl0ZW1cIl0uJytIdW1hblBpY2tlci5DTEFTUy5jbGFzc0l0ZW1TZWxlY3RlZCkubGVuZ3RoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIFxyXG4gICAgc2VsZi4kZWxlbWVudFxyXG4gICAgICAuZmluZChcIltkYXRhLXJvbGU9J2FkdWx0LWl0ZW0nXVwiKVxyXG4gICAgICAub24oXCJjbGlja1wiLGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIHZhciBpbnB1dCA9IHNlbGYuJGVsZW1lbnQuZmluZCgnaW5wdXRbZGF0YS1yb2xlPVwiYWR1bHRzXCJdJyk7XHJcbiAgICAgICAgJCh0aGlzKS50b2dnbGVDbGFzcyhIdW1hblBpY2tlci5DTEFTUy5jbGFzc0l0ZW1TZWxlY3RlZCk7XHJcbiAgICAgICAgaW5wdXQudmFsKHNlbGYuJGVsZW1lbnQuZmluZCgnW2RhdGEtcm9sZT1cImFkdWx0LWl0ZW1cIl0uJytIdW1hblBpY2tlci5DTEFTUy5jbGFzc0l0ZW1TZWxlY3RlZCkubGVuZ3RoKTtcclxuICAgICAgICBzZWxmLl91cGRhdGVUb29sdGlwcygpO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIHNlbGYuJGVsZW1lbnRcclxuICAgICAgLmZpbmQoXCJbZGF0YS1yb2xlPSdraWQtaXRlbSddXCIpXHJcbiAgICAgIC5vbihcImNsaWNrXCIsZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcclxuICAgICAgICAgICAgY3VyVmFsID0gJHRoaXMuZmluZCgnaW5wdXRbZGF0YS1yb2xlPVwia2lkLWFnZVwiXScpLnZhbCgpIHx8IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgc2VsZi5fa2lkQWdlUGlja2VyQ2xvc2UoKTtcclxuICAgICAgICBcclxuICAgICAgICBpZigkdGhpcy5oYXNDbGFzcyhIdW1hblBpY2tlci5DTEFTUy5jbGFzc0l0ZW1TZWxlY3RlZCkpe1xyXG4gICAgICAgICAgJHRoaXMucmVtb3ZlQ2xhc3MoIEh1bWFuUGlja2VyLkNMQVNTLmNsYXNzSXRlbVNlbGVjdGVkKTtcclxuICAgICAgICAgICR0aGlzLmZpbmQoJy5raWQtYWdlLWNhcHRpb24nKS50ZXh0KDApO1xyXG4gICAgICAgICAgJHRoaXMuZmluZCgnaW5wdXRbZGF0YS1yb2xlPVwia2lkLWFnZVwiXScpXHJcbiAgICAgICAgICAgIC5wcm9wKFwiZGlzYWJsZWRcIix0cnVlKVxyXG4gICAgICAgICAgICAudmFsKDApO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgIHVwZGF0ZUtpZHNDb3VudFZhbHVlKCk7XHJcbiAgICAgICAgICBzZWxmLl91cGRhdGVUb29sdGlwcygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgJHRoaXMuZmluZCgnLmtpZC1hZ2UtY2FwdGlvbicpLnRyaWdnZXIoXCJjbGlja1wiKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBzZWxmLiRlbGVtZW50XHJcbiAgICAgIC5maW5kKFwiLmtpZC1hZ2UtY2FwdGlvblwiKVxyXG4gICAgICAub24oXCJjbGlja1wiLGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXHJcbiAgICAgICAgICAgICAka2lkSXRlbSA9ICR0aGlzLmNsb3Nlc3QoXCJbZGF0YS1yb2xlPSdraWQtaXRlbSddXCIpLFxyXG4gICAgICAgICAgICAgY3VyVmFsID0gJGtpZEl0ZW0uZmluZCgnaW5wdXRbZGF0YS1yb2xlPVwia2lkLWFnZVwiXScpLnZhbCgpIHx8IDA7XHJcbiAgICAgICAgIHNlbGYuX2tpZEFnZVBpY2tlclNob3coJGtpZEl0ZW0sIGN1clZhbCwgZnVuY3Rpb24odmFsdWVJdGVtKXtcclxuICAgICAgICAgICAgJHRoaXMudGV4dCh2YWx1ZUl0ZW0udGV4dC5yZXBsYWNlKC8gL2csXCJcIikpO1xyXG4gICAgICAgICAgICAka2lkSXRlbS5hZGRDbGFzcyggSHVtYW5QaWNrZXIuQ0xBU1MuY2xhc3NJdGVtU2VsZWN0ZWQpO1xyXG4gICAgICAgICAgICAka2lkSXRlbS5maW5kKCdpbnB1dFtkYXRhLXJvbGU9XCJraWQtYWdlXCJdJylcclxuICAgICAgICAgICAgICAucHJvcChcImRpc2FibGVkXCIsZmFsc2UpXHJcbiAgICAgICAgICAgICAgLnZhbCh2YWx1ZUl0ZW0udmFsdWUpOyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB1cGRhdGVLaWRzQ291bnRWYWx1ZSgpO1xyXG4gICAgICAgICAgICBzZWxmLl91cGRhdGVUb29sdGlwcygpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgJChkb2N1bWVudClcclxuICAgICAgLm9mZihcImNsaWNrLmh1bWFucGlja2VyLmRvY3VtZW50XCIpXHJcbiAgICAgIC5vbihcImNsaWNrLmh1bWFucGlja2VyLmRvY3VtZW50XCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGlmKCQoZS50YXJnZXQpLmNsb3Nlc3QoJ1tkYXRhLXJvbGU9XCJraWQtYWdlLWxpc3RcIl0nKS5sZW5ndGggfHxcclxuICAgICAgICAgICAkKGUudGFyZ2V0KS5jbG9zZXN0KCdbZGF0YS1yb2xlPVwia2lkLWl0ZW1cIl0nKS5sZW5ndGgpe1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZWxmLl9raWRBZ2VQaWNrZXJDbG9zZSgpO1xyXG4gICAgICB9KTtcclxuICAgICAgXHJcbiAgICAkKHdpbmRvdylcclxuICAgICAgLm9mZihcInJlc2l6ZS5odW1hbnBpY2tlci53aW5kb3dcIilcclxuICAgICAgLm9uKFwicmVzaXplLmh1bWFucGlja2VyLndpbmRvd1wiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBzZWxmLl9raWRBZ2VQaWNrZXJDbG9zZSgpO1xyXG4gICAgICB9KTtcclxuICB9XHJcbiAgSHVtYW5QaWNrZXIucHJvdG90eXBlLl9raWRBZ2VQaWNrZXJDbG9zZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIga2lkQWdlTGlzdCA9IHRoaXMuJGFnZUxpc3RXcmFwO1xyXG4gICAga2lkQWdlTGlzdC5oaWRlKCk7XHJcbiAgfTtcclxuICBcclxuICBIdW1hblBpY2tlci5wcm90b3R5cGUuX2tpZEFnZVBpY2tlclNob3cgPSBmdW5jdGlvbihraWRJdGVtLCBjdXJWYWx1ZSwgY2FsbGJhY2spe1xyXG4gICAgdmFyIGFnZUNsaWNrRXZlbnQgPSBcImNsaWNrLmh1bWFucGlja2VyXCIsXHJcbiAgICAgICAga2lkQWdlTGlzdCA9IHRoaXMuJGFnZUxpc3RXcmFwO1xyXG4gICAgICAgIFxyXG4gICAga2lkQWdlTGlzdC5jc3MoXCJsZWZ0XCIsICQoa2lkSXRlbSkub2Zmc2V0KCkubGVmdCk7XHJcbiAgICBraWRBZ2VMaXN0LmNzcyhcInRvcFwiLCAkKGtpZEl0ZW0pLm9mZnNldCgpLnRvcCArICQoa2lkSXRlbSkub3V0ZXJIZWlnaHQoKSArIDIpO1xyXG4gICAgICAgIFxyXG4gICAga2lkQWdlTGlzdC5maW5kKCdbZGF0YS1yb2xlPVwia2lkLWFnZS1pdGVtXCJdJylcclxuICAgICAucmVtb3ZlQ2xhc3MoSHVtYW5QaWNrZXIuQ0xBU1MuY2xhc3NLaWRBZ2VTZWxlY3RlZCk7XHJcbiAgICAgXHJcbiAgICBraWRBZ2VMaXN0LmZpbmQoJ1tkYXRhLXJvbGU9XCJraWQtYWdlLWl0ZW1cIl1bZGF0YS12YWx1ZT1cIicrY3VyVmFsdWUrJ1wiXScpXHJcbiAgICAgLmFkZENsYXNzKEh1bWFuUGlja2VyLkNMQVNTLmNsYXNzS2lkQWdlU2VsZWN0ZWQpO1xyXG4gICAgICAgIFxyXG4gICAga2lkQWdlTGlzdC5maW5kKCdbZGF0YS1yb2xlPVwia2lkLWFnZS1pdGVtXCJdJylcclxuICAgICAgLm9mZihhZ2VDbGlja0V2ZW50KVxyXG4gICAgICAub24oYWdlQ2xpY2tFdmVudCwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAga2lkQWdlTGlzdC5maW5kKCdbZGF0YS1yb2xlPVwia2lkLWFnZS1pdGVtXCJdJylcclxuICAgICAgICAgIC5yZW1vdmVDbGFzcyhIdW1hblBpY2tlci5DTEFTUy5jbGFzc0tpZEFnZVNlbGVjdGVkKTtcclxuICAgICAgICAkKHRoaXMpLmFkZENsYXNzKEh1bWFuUGlja2VyLkNMQVNTLmNsYXNzS2lkQWdlU2VsZWN0ZWQpOyAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgY2FsbGJhY2suY2FsbChraWRJdGVtLCB7dGV4dDogJCh0aGlzKS50ZXh0KCksIHZhbHVlOiAkKHRoaXMpLmRhdGEoXCJ2YWx1ZVwiKX0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGtpZEFnZUxpc3QuaGlkZSgpO1xyXG4gICAgICB9KTtcclxuICAgICAgXHJcbiAgICBraWRBZ2VMaXN0LnNob3coKTtcclxuICB9O1xyXG4gIFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEhVTUFOIFBJQ0tFUiBDU1MgQ0xBU1NFU1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIEh1bWFuUGlja2VyLkNMQVNTID0ge1xyXG4gICAgY2xhc3NJdGVtOiBcImh1bWFuLXBpY2tlci1pdGVtXCIsXHJcbiAgICBjbGFzc0l0ZW1TZWxlY3RlZDogJ2h1bWFuLXBpY2tlci1pdGVtLXNlbGVjdGVkJyxcclxuICAgIGNsYXNzS2lkQWdlU2VsZWN0ZWQ6ICdraWQtYWdlLWl0ZW0tc2VsZWN0ZWQnXHJcbiAgfTtcclxuICBcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBIVU1BTiBQSUNLRVIgTE9DQUxFU1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIEh1bWFuUGlja2VyLmkxOG4gPSB7XHJcbiAgICAgIFwicnVcIjoge1xyXG4gICAgICAgIHRvb2x0aXBJdGVtOiBcItCU0L7QsdCw0LLQuNGC0YxcIixcclxuICAgICAgICB0b29sdGlwSXRlbVNlbGVjdGVkOiBcItCj0LTQsNC70LjRgtGMXCIsXHJcbiAgICAgICAgdG9vbHRpcEVkaXRBZ2U6IFwi0KDQtdC00LDQutGC0LjRgNC+0LLQsNGC0Ywg0LLQvtC30YDQsNGB0YJcIixcclxuICAgICAgfSxcclxuICAgICAgXCJlblwiOiB7XHJcbiAgICAgICAgdG9vbHRpcEl0ZW06IFwiQWRkXCIsXHJcbiAgICAgICAgdG9vbHRpcEl0ZW1TZWxlY3RlZDogXCJSZW1vdmVcIixcclxuICAgICAgICB0b29sdGlwRWRpdEFnZTogXCJFZGl0IGFnZVwiXHJcbiAgICAgIH1cclxuICB9O1xyXG4gIFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEhVTUFOIFBJQ0tFUiBURU1QTEFURVNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICBIdW1hblBpY2tlci5UcGwgPSB7XHJcbiAgICAvLyBUT0RPOiB1c2UgbGluayAnYScgbGlrZSBhY3Rpb25zXHJcbiAgICBXcmFwOiAnPHVsIGNsYXNzPVwiaHVtYW4tcGlja2VyXCI+PC91bD4nLFxyXG4gICAgQWR1bHRJdGVtOiAnPGxpIGNsYXNzPVwiJytIdW1hblBpY2tlci5DTEFTUy5jbGFzc0l0ZW0rJyBodW1hbi1waWNrZXItaXRlbS1hZHVsdFwiIGRhdGEtcm9sZT1cImFkdWx0LWl0ZW1cIj48L2xpPicsXHJcbiAgICBLaWRJdGVtOiAnPGxpIGNsYXNzPVwiJytIdW1hblBpY2tlci5DTEFTUy5jbGFzc0l0ZW0rJyBodW1hbi1waWNrZXItaXRlbS1raWRcIiBkYXRhLXJvbGU9XCJraWQtaXRlbVwiPjxkaXYgY2xhc3M9XCJraWQtYWdlLWNhcHRpb25cIj57YWdlfTwvZGl2PjwvbGk+JyxcclxuICAgIEJvZHlMaXN0Q29udGFpbmVyOiAnPGRpdiBpZD17aWR9PjwvZGl2PicsXHJcbiAgICBBZ2VMaXN0V3JhcDogJzxkaXYgc3R5bGU9XCJkaXNwbGF5OiBub25lO1wiIGNsYXNzPVwiaHVtYW4tcGlja2VyX2tpZC1hZ2UtbGlzdC13cmFwXCIgZGF0YS1yb2xlPVwia2lkLWFnZS1saXN0XCI+PC9kaXY+JyxcclxuICAgIEFnZUxpc3Q6ICc8dWwgY2xhc3M9XCJraWQtYWdlLWxpc3RcIj48L3VsPicsXHJcbiAgICBBZ2VMaXN0SXRlbTogJzxsaSBjbGFzcz1cImtpZC1hZ2UtaXRlbVwiIGRhdGEtcm9sZT1cImtpZC1hZ2UtaXRlbVwiIGRhdGEtdmFsdWU9XCJ7dmFsdWV9XCI+e3RleHR9PC9saT4nLFxyXG4gICAgSGlkZGVuSW5wdXQ6ICc8aW5wdXQgZGF0YS1yb2xlPVwie3JvbGV9XCIgbmFtZT1cIntuYW1lfVwiIHR5cGU9XCJoaWRkZW5cIiB2YWx1ZT1cInt2YWx1ZX1cIj4nLFxyXG4gIH07XHJcbiAgXHJcbiAgSHVtYW5QaWNrZXIuVkVSU0lPTiAgPSAnMS4wLjAnXHJcbiAgXHJcbiAgLy8gVE9ETzoga2lkQWdlSXRlbXMgdHJhbnNsYXRlPz8/Pz9cclxuICBIdW1hblBpY2tlci5ERUZBVUxUUyA9IHtcclxuICAgIGFkdWx0c0NvdW50OiA0LCAvLyBtYXhBZHVsdHMgZm9yIHNlbGVjdFxyXG4gICAga2lkc0NvdW50OiAzLCAvLyBtYXgga2lkcyBmb3Igc2VsZWN0XHJcbiAgICBpbml0aWFsVmFsdWU6IHtcclxuICAgICAgYWR1bHRzOiAyLCAvLyBhZHVsdHMgc2VsZWN0ZWRcclxuICAgICAga2lkczogMCwgLy8ga2lkcyBzZWxlY3RlZFxyXG4gICAgICBraWRzQWdlczogW10gLy8gYXJyYXkgYWdlcyBvZiBraWRzIGJhc2VkIG9uIGtpZHMgc2VsZWN0ZWQgY291bnQsIGRlZmF1bHQgYWdlIGZvciBraWQgMFxyXG4gICAgfSxcclxuICAgIGxhbmc6IFwicnVcIixcclxuICAgIGFkdWx0c1BhcmFtTmFtZTogXCJhZHVsdHNcIixcclxuICAgIGtpZHNQYXJhbU5hbWU6IFwia2lkc1wiLFxyXG4gICAga2lkc0FnZXNQYXJhbU5hbWU6IFwia2lkc0FnZXNbXVwiLFxyXG4gICAga2lkQWdlSXRlbXM6W1xyXG4gICAgICB7dGV4dDogXCIwINC70LXRglwiLCB2YWx1ZTogMH0sXHJcbiAgICAgIHt0ZXh0OiBcIjEg0LPQvtC0XCIsIHZhbHVlOiAxfSxcclxuICAgICAge3RleHQ6IFwiMiDQs9C+0LTQsFwiLCB2YWx1ZTogMn0sXHJcbiAgICAgIHt0ZXh0OiBcIjMg0LPQvtC00LBcIiwgdmFsdWU6IDN9LFxyXG4gICAgICB7dGV4dDogXCI0INCz0L7QtNCwXCIsIHZhbHVlOiA0fSxcclxuICAgICAge3RleHQ6IFwiNSDQu9C10YJcIiwgdmFsdWU6IDV9LFxyXG4gICAgICB7dGV4dDogXCI2INC70LXRglwiLCB2YWx1ZTogNn0sXHJcbiAgICAgIHt0ZXh0OiBcIjcg0LvQtdGCXCIsIHZhbHVlOiA3fSxcclxuICAgICAge3RleHQ6IFwiOCDQu9C10YJcIiwgdmFsdWU6IDh9LFxyXG4gICAgICB7dGV4dDogXCI5INC70LXRglwiLCB2YWx1ZTogOX0sXHJcbiAgICAgIHt0ZXh0OiBcIjEwINC70LXRglwiLCB2YWx1ZTogMTB9LFxyXG4gICAgICB7dGV4dDogXCIxMSDQu9C10YJcIiwgdmFsdWU6IDExfSxcclxuICAgICAge3RleHQ6IFwiMTIg0LvQtdGCXCIsIHZhbHVlOiAxMn0sXHJcbiAgICAgIHt0ZXh0OiBcIjEzINC70LXRglwiLCB2YWx1ZTogMTN9LFxyXG4gICAgICB7dGV4dDogXCIxNCDQu9C10YJcIiwgdmFsdWU6IDE0fSxcclxuICAgICAge3RleHQ6IFwiMTUg0LvQtdGCXCIsIHZhbHVlOiAxNX0sXHJcbiAgICAgIHt0ZXh0OiBcIjE2INC70LXRglwiLCB2YWx1ZTogMTZ9LFxyXG4gICAgICB7dGV4dDogXCIxNyDQu9C10YJcIiwgdmFsdWU6IDE3fVxyXG4gICAgXSxcclxuICAgIGtpZEFnZUl0ZW1zR3JvdXBNYXg6IDlcclxuICB9O1xyXG4gIFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIElOSVQgSFVNQU4gUElDS0VSIEpRVUVSWSBQTFVHSU5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT1cclxuICBmdW5jdGlvbiBodW1hblBpY2tlclBsdWdpbihvcHRpb24pIHtcclxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcclxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCd4dC5IdW1hblBpY2tlcicpXHJcbiAgICAgIHZhciBvcHRpb25zID0gdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb25cclxuXHJcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgneHQuSHVtYW5QaWNrZXInLCAoZGF0YSA9IG5ldyBIdW1hblBpY2tlcih0aGlzLCBvcHRpb25zKSkpXHJcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0oKVxyXG4gICAgfSlcclxuICB9XHJcbiAgXHJcbiAgJC5mbi5IdW1hblBpY2tlciAgICAgICAgICAgICA9IGh1bWFuUGlja2VyUGx1Z2luXHJcbiAgJC5mbi5IdW1hblBpY2tlci5Db25zdHJ1Y3RvciA9IEh1bWFuUGlja2VyXHJcbiAgXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gSFVNQU4gUElDS0VSIERBVEEtQVBJXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICQod2luZG93KS5vbignbG9hZCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICQoJ1tkYXRhLWNvbnRyb2w9XCJodW1hbnBpY2tlclwiXScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJGVsZW1lbnQgPSAkKHRoaXMpXHJcbiAgICAgIHZhciBkYXRhID0gJGVsZW1lbnQuZGF0YSgpXHJcbiAgICAgIGh1bWFuUGlja2VyUGx1Z2luLmNhbGwoJGVsZW1lbnQsIGRhdGEpXHJcbiAgICB9KVxyXG4gIH0pXHJcbiAgXHJcbn0pKCBqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQgKTsiXX0=
