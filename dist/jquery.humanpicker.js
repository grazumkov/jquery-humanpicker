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
/* global require */

// TODO: documentation
// TODO: demo page
// TODO: animation add/remove icons

;(function($, window, document, undefined) { 
  'use strict';
  var HumanPicker,
      nano = require("nano");
      
  // ===========================
  // HUMAN PICKER CLASS
  // ===========================
  HumanPicker = function(element, options) { 
    this.options   = $.extend({}, HumanPicker.DEFAULTS, options);

    // generate age items from locale settings
    // use value as index
    this.kidAgeItems = [];
    var kages = HumanPicker.i18n[this.options.lang]["kidAges"] || [];
    this.kidAgeItems = $.map(kages, function(age, i){
      return { text: age, value: i };
    });

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
    }
    
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
    }
    
    // hidden kid age picker
    if(self.kidAgeItems.length > 0)
    {
      self._renderKidAgeList();
    }
    
    self.$element.append($wrap);

    self._updateTooltips();
  };
  
  HumanPicker.prototype._renderKidAgeList = function(){
    var self = this,
        opts = this.options,
        groupMaxItems = opts.kidAgeItemsGroupMax || 9,
        groupsCount = Math.max(((self.kidAgeItems.length || 1) / groupMaxItems).toFixed() - 0, 1),
        list, i,j,max;
        
      this.$ageListWrap.empty();
        
      for(i=0; i<groupsCount; i++){
        list = self._renderTpl(HumanPicker.Tpl.AgeList);
        max = Math.min((i*groupMaxItems)+groupMaxItems, self.kidAgeItems.length);
        for(j=i*groupMaxItems; j<max; j++)
        {
          self._renderTpl(HumanPicker.Tpl.AgeListItem, self.kidAgeItems[j])
            .appendTo(list);
        }
        list.appendTo(this.$ageListWrap);
      }
  };
  
  HumanPicker.prototype.value = function(value){
    if(value && typeof value === 'object'){
      this._setValue(value);
    }
    else{
      return this._getValue();
    }
  };
  
  HumanPicker.prototype._setValue = function(value){
    // TODO: Realize
  };

  HumanPicker.prototype._getValue = function(){
    var objRes = {},
        inputAdults = this.$element.find('input[data-role="adults"]'),
        inputKids = this.$element.find('input[data-role="kids"]'),
        inputKidAges = this.$element.find('.'+HumanPicker.CLASS.classItemSelected+' input[data-role="kid-age"]');
        
    objRes.adults = inputAdults.val();
    objRes.kids = inputKids.val();

    objRes.kidsAges = objRes.kidsAges || [];
    if(inputKidAges.length){
      objRes.kidsAges = $.map(inputKidAges, function(item){
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
  
  // TODO: replace/remove attribute selectors
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
        var $this = $(this);
        
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
            e.preventDefault();
            return;
        }
        self._kidAgePickerClose();
      });
      
    $(window)
      .off("resize.humanpicker.window")
      .on("resize.humanpicker.window", function(e){
        self._kidAgePickerClose();
      });
  };
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
        kidAges: ["0 лет", "1 год", "2 года", "3 года", "4 года", "5 лет", "6 лет", "7 лет", "8 лет", "9 лет", "10 лет", "11 лет", "12 лет", "13 лет", "14 лет", "15 лет", "16 лет", "17 лет"]
      },
      "en": {
        tooltipItem: "Add",
        tooltipItemSelected: "Remove",
        tooltipEditAge: "Edit age",
        kidAges: ["0 years", "1 year", "2 years", "3 years", "4 years", "5 years", "6 years", "7 years", "8 years", "9 years", "10 years", "11 years", "12 years", "13 years", "14 years", "15 years", "16 years", "17 years"]
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
  
  HumanPicker.VERSION  = '1.0.0';

  HumanPicker.DEFAULTS = {
    adultsCount: 4, // maxAdults for select
    kidsCount: 3, // max kids for select
    initialValue: {
      adults: 2, // adults selected
      kids: 0, // kids selected
      kidsAges: [] // array ages of kids based on kids selected count, default age for kid 0
    },
    lang: "en",
    adultsParamName: "adults", // hidden input parameter name
    kidsParamName: "kids", // hidden input parameter name
    kidsAgesParamName: "kidsAges[]", // hidden input parameter name
    kidAgeItemsGroupMax: 9
  };
  
  // =====================
  // INIT HUMAN PICKER JQUERY PLUGIN
  // =====================
  function humanPickerPlugin(option) {
    return this.each(function() {
      var $this   = $(this);
      var data    = $this.data('xt.HumanPicker');
      var options = typeof option === 'object' && option;

      if (!data){ $this.data('xt.HumanPicker', (data = new HumanPicker(this, options))); }
      if (typeof option === 'string') { data[option](); }
    });
  }
  
  $.fn.HumanPicker             = humanPickerPlugin;
  $.fn.HumanPicker.Constructor = HumanPicker;
  
  // =====================
  // HUMAN PICKER DATA-API
  // =====================

  $(window).on('load', function () {
    $('[data-control="humanpicker"]').each(function () {
      var $element = $(this);
      var data = $element.data();
      humanPickerPlugin.call($element, data);
    });
  });
  
})( jQuery, window, document );
},{"nano":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJib3dlcl9jb21wb25lbnRzL25hbm8vbmFuby5qcyIsInNyYy9qcXVlcnkuaHVtYW5waWNrZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCI7IHZhciBfX2Jyb3dzZXJpZnlfc2hpbV9yZXF1aXJlX189cmVxdWlyZTsoZnVuY3Rpb24gYnJvd3NlcmlmeVNoaW0obW9kdWxlLCBleHBvcnRzLCByZXF1aXJlLCBkZWZpbmUsIGJyb3dzZXJpZnlfc2hpbV9fZGVmaW5lX19tb2R1bGVfX2V4cG9ydF9fKSB7XG4vKiBOYW5vIFRlbXBsYXRlcyAtIGh0dHBzOi8vZ2l0aHViLmNvbS90cml4L25hbm8gKi9cclxuXHJcbmZ1bmN0aW9uIG5hbm8odGVtcGxhdGUsIGRhdGEpIHtcclxuICByZXR1cm4gdGVtcGxhdGUucmVwbGFjZSgvXFx7KFtcXHdcXC5dKilcXH0vZywgZnVuY3Rpb24oc3RyLCBrZXkpIHtcclxuICAgIHZhciBrZXlzID0ga2V5LnNwbGl0KFwiLlwiKSwgdiA9IGRhdGFba2V5cy5zaGlmdCgpXTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0ga2V5cy5sZW5ndGg7IGkgPCBsOyBpKyspIHYgPSB2W2tleXNbaV1dO1xyXG4gICAgcmV0dXJuICh0eXBlb2YgdiAhPT0gXCJ1bmRlZmluZWRcIiAmJiB2ICE9PSBudWxsKSA/IHYgOiBcIlwiO1xyXG4gIH0pO1xyXG59XHJcblxuOyBicm93c2VyaWZ5X3NoaW1fX2RlZmluZV9fbW9kdWxlX19leHBvcnRfXyh0eXBlb2YgbmFubyAhPSBcInVuZGVmaW5lZFwiID8gbmFubyA6IHdpbmRvdy5uYW5vKTtcblxufSkuY2FsbChnbG9iYWwsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgZnVuY3Rpb24gZGVmaW5lRXhwb3J0KGV4KSB7IG1vZHVsZS5leHBvcnRzID0gZXg7IH0pO1xuIiwiLyogZ2xvYmFsIGpRdWVyeSAqL1xyXG4vKiBnbG9iYWwgcmVxdWlyZSAqL1xyXG5cclxuLy8gVE9ETzogZG9jdW1lbnRhdGlvblxyXG4vLyBUT0RPOiBkZW1vIHBhZ2VcclxuLy8gVE9ETzogYW5pbWF0aW9uIGFkZC9yZW1vdmUgaWNvbnNcclxuXHJcbjsoZnVuY3Rpb24oJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7IFxyXG4gICd1c2Ugc3RyaWN0JztcclxuICB2YXIgSHVtYW5QaWNrZXIsXHJcbiAgICAgIG5hbm8gPSByZXF1aXJlKFwibmFub1wiKTtcclxuICAgICAgXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gSFVNQU4gUElDS0VSIENMQVNTXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgSHVtYW5QaWNrZXIgPSBmdW5jdGlvbihlbGVtZW50LCBvcHRpb25zKSB7IFxyXG4gICAgdGhpcy5vcHRpb25zICAgPSAkLmV4dGVuZCh7fSwgSHVtYW5QaWNrZXIuREVGQVVMVFMsIG9wdGlvbnMpO1xyXG5cclxuICAgIC8vIGdlbmVyYXRlIGFnZSBpdGVtcyBmcm9tIGxvY2FsZSBzZXR0aW5nc1xyXG4gICAgLy8gdXNlIHZhbHVlIGFzIGluZGV4XHJcbiAgICB0aGlzLmtpZEFnZUl0ZW1zID0gW107XHJcbiAgICB2YXIga2FnZXMgPSBIdW1hblBpY2tlci5pMThuW3RoaXMub3B0aW9ucy5sYW5nXVtcImtpZEFnZXNcIl0gfHwgW107XHJcbiAgICB0aGlzLmtpZEFnZUl0ZW1zID0gJC5tYXAoa2FnZXMsIGZ1bmN0aW9uKGFnZSwgaSl7XHJcbiAgICAgIHJldHVybiB7IHRleHQ6IGFnZSwgdmFsdWU6IGkgfTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQgID0gJChlbGVtZW50KTtcclxuICAgIHRoaXMuJGJvZHlMaXN0Q29udGFpbmVyID0gdGhpcy5fcmVuZGVyVHBsKEh1bWFuUGlja2VyLlRwbC5Cb2R5TGlzdENvbnRhaW5lciwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7aWQ6IHRoaXMuJGVsZW1lbnQucHJvcCgnaWQnKSsnX0h1bWFuUGlja2VyTGlzdENvbnRhaW5lcid9KTtcclxuICAgIHRoaXMuJGFnZUxpc3RXcmFwID0gdGhpcy5fcmVuZGVyVHBsKEh1bWFuUGlja2VyLlRwbC5BZ2VMaXN0V3JhcCk7XHJcbiAgICB0aGlzLiRhZ2VMaXN0V3JhcC5hcHBlbmRUbyh0aGlzLiRib2R5TGlzdENvbnRhaW5lcik7XHJcbiAgICBcclxuICAgIHRoaXMuJGJvZHlMaXN0Q29udGFpbmVyLmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpO1xyXG4gICAgXHJcbiAgICB0aGlzLl9yZW5kZXIoKTtcclxuICAgIHRoaXMuX2JpbmRFdmVudHMoKTtcclxuICB9O1xyXG5cclxuICBIdW1hblBpY2tlci5wcm90b3R5cGUuX2dldEkxOG4gPSBmdW5jdGlvbiAoa2V5KXtcclxuICAgIHJldHVybiBIdW1hblBpY2tlci5pMThuW3RoaXMub3B0aW9ucy5sYW5nXVtrZXldO1xyXG4gIH07XHJcbiAgXHJcbiAgSHVtYW5QaWNrZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpXHJcbiAge1xyXG4gICAgdGhpcy4kZWxlbWVudC5lbXB0eSgpO1xyXG4gICAgdGhpcy4kYm9keUxpc3RDb250YWluZXIuZW1wdHkoKTtcclxuICAgIHRoaXMuJGJvZHlMaXN0Q29udGFpbmVyLnJlbW92ZSgpO1xyXG4gIH07XHJcbiAgXHJcbiAgSHVtYW5QaWNrZXIucHJvdG90eXBlLl9yZW5kZXJUcGwgPSBmdW5jdGlvbih0ZW1wbGF0ZSwgZGF0YSl7XHJcbiAgICByZXR1cm4gJChuYW5vKHRlbXBsYXRlLCBkYXRhKSk7XHJcbiAgfTtcclxuICBcclxuICBIdW1hblBpY2tlci5wcm90b3R5cGUuX3JlbmRlciA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgJHdyYXAgPSB0aGlzLl9yZW5kZXJUcGwoSHVtYW5QaWNrZXIuVHBsLldyYXApLFxyXG4gICAgICAgIG9wdHMgPSB0aGlzLm9wdGlvbnMsXHJcbiAgICAgICAgaW5pdFZhbCA9IG9wdHMuaW5pdGlhbFZhbHVlLFxyXG4gICAgICAgIG9wdEtpZEFnZXMgPSBpbml0VmFsLmtpZHNBZ2VzICYmIGluaXRWYWwua2lkc0FnZXMgaW5zdGFuY2VvZiBBcnJheT9pbml0VmFsLmtpZHNBZ2VzOltdLFxyXG4gICAgICAgIGk7XHJcbiAgICAgICAgXHJcbiAgICB0aGlzLiRlbGVtZW50LmVtcHR5KCk7XHJcbiAgICBcclxuICAgIC8vYWR1bHRzXHJcbiAgICBmb3IoaSA9IDA7IGkgPCBvcHRzLmFkdWx0c0NvdW50OyBpKyspe1xyXG4gICAgICBzZWxmLl9yZW5kZXJUcGwoSHVtYW5QaWNrZXIuVHBsLkFkdWx0SXRlbSlcclxuICAgICAgICAuYWRkQ2xhc3MoaTxpbml0VmFsLmFkdWx0cz9IdW1hblBpY2tlci5DTEFTUy5jbGFzc0l0ZW1TZWxlY3RlZDonJylcclxuICAgICAgICAuYXBwZW5kVG8oJHdyYXApO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBhZHVsdHMsIGtpZHMgaW5wdXRcclxuICAgIHNlbGYuX3JlbmRlclRwbChIdW1hblBpY2tlci5UcGwuSGlkZGVuSW5wdXQsIHtyb2xlOiBcImFkdWx0c1wiLCBuYW1lOiBvcHRzLmFkdWx0c1BhcmFtTmFtZSwgdmFsdWU6IGluaXRWYWwuYWR1bHRzfSlcclxuICAgIC5hcHBlbmRUbygkd3JhcCk7XHJcbiAgICBcclxuICAgICBzZWxmLl9yZW5kZXJUcGwoSHVtYW5QaWNrZXIuVHBsLkhpZGRlbklucHV0LCB7cm9sZTogXCJraWRzXCIsIG5hbWU6IG9wdHMua2lkc1BhcmFtTmFtZSwgdmFsdWU6IGluaXRWYWwua2lkc30pXHJcbiAgICAuYXBwZW5kVG8oJHdyYXApO1xyXG4gICAgXHJcbiAgICAvL2tpZHNcclxuICAgIGZvcihpID0gMDsgaSA8IG9wdHMuYWR1bHRzQ291bnQ7IGkrKyl7ICAgICAgICBcclxuICAgICAgc2VsZi5fcmVuZGVyVHBsKEh1bWFuUGlja2VyLlRwbC5LaWRJdGVtLCB7YWdlOiBvcHRLaWRBZ2VzW2ldIHx8IDB9KVxyXG4gICAgICAgIC5hcHBlbmQoXHJcbiAgICAgICAgICBzZWxmLl9yZW5kZXJUcGwoSHVtYW5QaWNrZXIuVHBsLkhpZGRlbklucHV0LCB7cm9sZTogXCJraWQtYWdlXCIsIG5hbWU6IG9wdHMua2lkc0FnZXNQYXJhbU5hbWUsIHZhbHVlOiBvcHRLaWRBZ2VzW2ldIHx8IDB9KVxyXG4gICAgICAgICAgLnByb3AoXCJkaXNhYmxlZFwiLGk+PWluaXRWYWwua2lkcykpXHJcbiAgICAgICAgLmFkZENsYXNzKGk8aW5pdFZhbC5raWRzP0h1bWFuUGlja2VyLkNMQVNTLmNsYXNzSXRlbVNlbGVjdGVkOicnKVxyXG4gICAgICAgIC5hcHBlbmRUbygkd3JhcCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIGhpZGRlbiBraWQgYWdlIHBpY2tlclxyXG4gICAgaWYoc2VsZi5raWRBZ2VJdGVtcy5sZW5ndGggPiAwKVxyXG4gICAge1xyXG4gICAgICBzZWxmLl9yZW5kZXJLaWRBZ2VMaXN0KCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHNlbGYuJGVsZW1lbnQuYXBwZW5kKCR3cmFwKTtcclxuXHJcbiAgICBzZWxmLl91cGRhdGVUb29sdGlwcygpO1xyXG4gIH07XHJcbiAgXHJcbiAgSHVtYW5QaWNrZXIucHJvdG90eXBlLl9yZW5kZXJLaWRBZ2VMaXN0ID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICBvcHRzID0gdGhpcy5vcHRpb25zLFxyXG4gICAgICAgIGdyb3VwTWF4SXRlbXMgPSBvcHRzLmtpZEFnZUl0ZW1zR3JvdXBNYXggfHwgOSxcclxuICAgICAgICBncm91cHNDb3VudCA9IE1hdGgubWF4KCgoc2VsZi5raWRBZ2VJdGVtcy5sZW5ndGggfHwgMSkgLyBncm91cE1heEl0ZW1zKS50b0ZpeGVkKCkgLSAwLCAxKSxcclxuICAgICAgICBsaXN0LCBpLGosbWF4O1xyXG4gICAgICAgIFxyXG4gICAgICB0aGlzLiRhZ2VMaXN0V3JhcC5lbXB0eSgpO1xyXG4gICAgICAgIFxyXG4gICAgICBmb3IoaT0wOyBpPGdyb3Vwc0NvdW50OyBpKyspe1xyXG4gICAgICAgIGxpc3QgPSBzZWxmLl9yZW5kZXJUcGwoSHVtYW5QaWNrZXIuVHBsLkFnZUxpc3QpO1xyXG4gICAgICAgIG1heCA9IE1hdGgubWluKChpKmdyb3VwTWF4SXRlbXMpK2dyb3VwTWF4SXRlbXMsIHNlbGYua2lkQWdlSXRlbXMubGVuZ3RoKTtcclxuICAgICAgICBmb3Ioaj1pKmdyb3VwTWF4SXRlbXM7IGo8bWF4OyBqKyspXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgc2VsZi5fcmVuZGVyVHBsKEh1bWFuUGlja2VyLlRwbC5BZ2VMaXN0SXRlbSwgc2VsZi5raWRBZ2VJdGVtc1tqXSlcclxuICAgICAgICAgICAgLmFwcGVuZFRvKGxpc3QpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsaXN0LmFwcGVuZFRvKHRoaXMuJGFnZUxpc3RXcmFwKTtcclxuICAgICAgfVxyXG4gIH07XHJcbiAgXHJcbiAgSHVtYW5QaWNrZXIucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24odmFsdWUpe1xyXG4gICAgaWYodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jyl7XHJcbiAgICAgIHRoaXMuX3NldFZhbHVlKHZhbHVlKTtcclxuICAgIH1cclxuICAgIGVsc2V7XHJcbiAgICAgIHJldHVybiB0aGlzLl9nZXRWYWx1ZSgpO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgXHJcbiAgSHVtYW5QaWNrZXIucHJvdG90eXBlLl9zZXRWYWx1ZSA9IGZ1bmN0aW9uKHZhbHVlKXtcclxuICAgIC8vIFRPRE86IFJlYWxpemVcclxuICB9O1xyXG5cclxuICBIdW1hblBpY2tlci5wcm90b3R5cGUuX2dldFZhbHVlID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBvYmpSZXMgPSB7fSxcclxuICAgICAgICBpbnB1dEFkdWx0cyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnaW5wdXRbZGF0YS1yb2xlPVwiYWR1bHRzXCJdJyksXHJcbiAgICAgICAgaW5wdXRLaWRzID0gdGhpcy4kZWxlbWVudC5maW5kKCdpbnB1dFtkYXRhLXJvbGU9XCJraWRzXCJdJyksXHJcbiAgICAgICAgaW5wdXRLaWRBZ2VzID0gdGhpcy4kZWxlbWVudC5maW5kKCcuJytIdW1hblBpY2tlci5DTEFTUy5jbGFzc0l0ZW1TZWxlY3RlZCsnIGlucHV0W2RhdGEtcm9sZT1cImtpZC1hZ2VcIl0nKTtcclxuICAgICAgICBcclxuICAgIG9ialJlcy5hZHVsdHMgPSBpbnB1dEFkdWx0cy52YWwoKTtcclxuICAgIG9ialJlcy5raWRzID0gaW5wdXRLaWRzLnZhbCgpO1xyXG5cclxuICAgIG9ialJlcy5raWRzQWdlcyA9IG9ialJlcy5raWRzQWdlcyB8fCBbXTtcclxuICAgIGlmKGlucHV0S2lkQWdlcy5sZW5ndGgpe1xyXG4gICAgICBvYmpSZXMua2lkc0FnZXMgPSAkLm1hcChpbnB1dEtpZEFnZXMsIGZ1bmN0aW9uKGl0ZW0pe1xyXG4gICAgICAgIHJldHVybiBpdGVtLnZhbHVlLTA7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG9ialJlcztcclxuICB9O1xyXG5cclxuICBIdW1hblBpY2tlci5wcm90b3R5cGUuX3VwZGF0ZVRvb2x0aXBzID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICBlbGVtID0gc2VsZi4kZWxlbWVudDtcclxuXHJcbiAgICBlbGVtLmZpbmQoXCIuXCIrSHVtYW5QaWNrZXIuQ0xBU1MuY2xhc3NJdGVtKS5lYWNoKGZ1bmN0aW9uKGksIGl0ZW0pe1xyXG4gICAgICAgIHZhciAkaXRlbSA9ICQoaXRlbSk7XHJcbiAgICAgICAgdmFyIHRpdGxlS2V5ID0gJGl0ZW0uaGFzQ2xhc3MoSHVtYW5QaWNrZXIuQ0xBU1MuY2xhc3NJdGVtU2VsZWN0ZWQpP1widG9vbHRpcEl0ZW1TZWxlY3RlZFwiOlwidG9vbHRpcEl0ZW1cIjtcclxuICAgICAgICAkKCRpdGVtKS5hdHRyKFwidGl0bGVcIiwgc2VsZi5fZ2V0STE4bih0aXRsZUtleSkpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZWxlbS5maW5kKCcua2lkLWFnZS1jYXB0aW9uJykuZWFjaChmdW5jdGlvbihpLCBpdGVtKXtcclxuICAgICAgdmFyICRpdGVtID0gJChpdGVtKTtcclxuICAgICAgaWYoJGl0ZW0uY2xvc2VzdChcIi5cIitIdW1hblBpY2tlci5DTEFTUy5jbGFzc0l0ZW0pLmhhc0NsYXNzKEh1bWFuUGlja2VyLkNMQVNTLmNsYXNzSXRlbVNlbGVjdGVkKSl7XHJcbiAgICAgICAgICAkaXRlbS5hdHRyKFwidGl0bGVcIiwgc2VsZi5fZ2V0STE4bihcInRvb2x0aXBFZGl0QWdlXCIpKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNle1xyXG4gICAgICAgICAgJGl0ZW0ucmVtb3ZlQXR0cihcInRpdGxlXCIpO1xyXG4gICAgICB9ICAgICAgXHJcbiAgICB9KTtcclxuICAgICAgICAgICAgXHJcbiAgfTtcclxuICBcclxuICAvLyBUT0RPOiByZXBsYWNlL3JlbW92ZSBhdHRyaWJ1dGUgc2VsZWN0b3JzXHJcbiAgSHVtYW5QaWNrZXIucHJvdG90eXBlLl9iaW5kRXZlbnRzID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICB1cGRhdGVLaWRzQ291bnRWYWx1ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICBzZWxmLiRlbGVtZW50LmZpbmQoJ2lucHV0W2RhdGEtcm9sZT1cImtpZHNcIl0nKVxyXG4gICAgICAgICAgICAudmFsKHNlbGYuJGVsZW1lbnQuZmluZCgnW2RhdGEtcm9sZT1cImtpZC1pdGVtXCJdLicrSHVtYW5QaWNrZXIuQ0xBU1MuY2xhc3NJdGVtU2VsZWN0ZWQpLmxlbmd0aCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBcclxuICAgIHNlbGYuJGVsZW1lbnRcclxuICAgICAgLmZpbmQoXCJbZGF0YS1yb2xlPSdhZHVsdC1pdGVtJ11cIilcclxuICAgICAgLm9uKFwiY2xpY2tcIixmdW5jdGlvbihlKXtcclxuICAgICAgICB2YXIgaW5wdXQgPSBzZWxmLiRlbGVtZW50LmZpbmQoJ2lucHV0W2RhdGEtcm9sZT1cImFkdWx0c1wiXScpO1xyXG4gICAgICAgICQodGhpcykudG9nZ2xlQ2xhc3MoSHVtYW5QaWNrZXIuQ0xBU1MuY2xhc3NJdGVtU2VsZWN0ZWQpO1xyXG4gICAgICAgIGlucHV0LnZhbChzZWxmLiRlbGVtZW50LmZpbmQoJ1tkYXRhLXJvbGU9XCJhZHVsdC1pdGVtXCJdLicrSHVtYW5QaWNrZXIuQ0xBU1MuY2xhc3NJdGVtU2VsZWN0ZWQpLmxlbmd0aCk7XHJcbiAgICAgICAgc2VsZi5fdXBkYXRlVG9vbHRpcHMoKTtcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICBzZWxmLiRlbGVtZW50XHJcbiAgICAgIC5maW5kKFwiW2RhdGEtcm9sZT0na2lkLWl0ZW0nXVwiKVxyXG4gICAgICAub24oXCJjbGlja1wiLGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgc2VsZi5fa2lkQWdlUGlja2VyQ2xvc2UoKTtcclxuICAgICAgICBcclxuICAgICAgICBpZigkdGhpcy5oYXNDbGFzcyhIdW1hblBpY2tlci5DTEFTUy5jbGFzc0l0ZW1TZWxlY3RlZCkpe1xyXG4gICAgICAgICAgJHRoaXMucmVtb3ZlQ2xhc3MoIEh1bWFuUGlja2VyLkNMQVNTLmNsYXNzSXRlbVNlbGVjdGVkKTtcclxuICAgICAgICAgICR0aGlzLmZpbmQoJy5raWQtYWdlLWNhcHRpb24nKS50ZXh0KDApO1xyXG4gICAgICAgICAgJHRoaXMuZmluZCgnaW5wdXRbZGF0YS1yb2xlPVwia2lkLWFnZVwiXScpXHJcbiAgICAgICAgICAgIC5wcm9wKFwiZGlzYWJsZWRcIix0cnVlKVxyXG4gICAgICAgICAgICAudmFsKDApO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgIHVwZGF0ZUtpZHNDb3VudFZhbHVlKCk7XHJcbiAgICAgICAgICBzZWxmLl91cGRhdGVUb29sdGlwcygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgJHRoaXMuZmluZCgnLmtpZC1hZ2UtY2FwdGlvbicpLnRyaWdnZXIoXCJjbGlja1wiKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBzZWxmLiRlbGVtZW50XHJcbiAgICAgIC5maW5kKFwiLmtpZC1hZ2UtY2FwdGlvblwiKVxyXG4gICAgICAub24oXCJjbGlja1wiLGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXHJcbiAgICAgICAgICAgICAka2lkSXRlbSA9ICR0aGlzLmNsb3Nlc3QoXCJbZGF0YS1yb2xlPSdraWQtaXRlbSddXCIpLFxyXG4gICAgICAgICAgICAgY3VyVmFsID0gJGtpZEl0ZW0uZmluZCgnaW5wdXRbZGF0YS1yb2xlPVwia2lkLWFnZVwiXScpLnZhbCgpIHx8IDA7XHJcbiAgICAgICAgIHNlbGYuX2tpZEFnZVBpY2tlclNob3coJGtpZEl0ZW0sIGN1clZhbCwgZnVuY3Rpb24odmFsdWVJdGVtKXtcclxuICAgICAgICAgICAgJHRoaXMudGV4dCh2YWx1ZUl0ZW0udGV4dC5yZXBsYWNlKC8gL2csXCJcIikpO1xyXG4gICAgICAgICAgICAka2lkSXRlbS5hZGRDbGFzcyggSHVtYW5QaWNrZXIuQ0xBU1MuY2xhc3NJdGVtU2VsZWN0ZWQpO1xyXG4gICAgICAgICAgICAka2lkSXRlbS5maW5kKCdpbnB1dFtkYXRhLXJvbGU9XCJraWQtYWdlXCJdJylcclxuICAgICAgICAgICAgICAucHJvcChcImRpc2FibGVkXCIsZmFsc2UpXHJcbiAgICAgICAgICAgICAgLnZhbCh2YWx1ZUl0ZW0udmFsdWUpOyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB1cGRhdGVLaWRzQ291bnRWYWx1ZSgpO1xyXG4gICAgICAgICAgICBzZWxmLl91cGRhdGVUb29sdGlwcygpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgJChkb2N1bWVudClcclxuICAgICAgLm9mZihcImNsaWNrLmh1bWFucGlja2VyLmRvY3VtZW50XCIpXHJcbiAgICAgIC5vbihcImNsaWNrLmh1bWFucGlja2VyLmRvY3VtZW50XCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGlmKCQoZS50YXJnZXQpLmNsb3Nlc3QoJ1tkYXRhLXJvbGU9XCJraWQtYWdlLWxpc3RcIl0nKS5sZW5ndGggfHxcclxuICAgICAgICAgICAkKGUudGFyZ2V0KS5jbG9zZXN0KCdbZGF0YS1yb2xlPVwia2lkLWl0ZW1cIl0nKS5sZW5ndGgpe1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2VsZi5fa2lkQWdlUGlja2VyQ2xvc2UoKTtcclxuICAgICAgfSk7XHJcbiAgICAgIFxyXG4gICAgJCh3aW5kb3cpXHJcbiAgICAgIC5vZmYoXCJyZXNpemUuaHVtYW5waWNrZXIud2luZG93XCIpXHJcbiAgICAgIC5vbihcInJlc2l6ZS5odW1hbnBpY2tlci53aW5kb3dcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgc2VsZi5fa2lkQWdlUGlja2VyQ2xvc2UoKTtcclxuICAgICAgfSk7XHJcbiAgfTtcclxuICBIdW1hblBpY2tlci5wcm90b3R5cGUuX2tpZEFnZVBpY2tlckNsb3NlID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBraWRBZ2VMaXN0ID0gdGhpcy4kYWdlTGlzdFdyYXA7XHJcbiAgICBraWRBZ2VMaXN0LmhpZGUoKTtcclxuICB9O1xyXG4gIFxyXG4gIEh1bWFuUGlja2VyLnByb3RvdHlwZS5fa2lkQWdlUGlja2VyU2hvdyA9IGZ1bmN0aW9uKGtpZEl0ZW0sIGN1clZhbHVlLCBjYWxsYmFjayl7XHJcbiAgICB2YXIgYWdlQ2xpY2tFdmVudCA9IFwiY2xpY2suaHVtYW5waWNrZXJcIixcclxuICAgICAgICBraWRBZ2VMaXN0ID0gdGhpcy4kYWdlTGlzdFdyYXA7XHJcbiAgICAgICAgXHJcbiAgICBraWRBZ2VMaXN0LmNzcyhcImxlZnRcIiwgJChraWRJdGVtKS5vZmZzZXQoKS5sZWZ0KTtcclxuICAgIGtpZEFnZUxpc3QuY3NzKFwidG9wXCIsICQoa2lkSXRlbSkub2Zmc2V0KCkudG9wICsgJChraWRJdGVtKS5vdXRlckhlaWdodCgpICsgMik7XHJcbiAgICAgICAgXHJcbiAgICBraWRBZ2VMaXN0LmZpbmQoJ1tkYXRhLXJvbGU9XCJraWQtYWdlLWl0ZW1cIl0nKVxyXG4gICAgIC5yZW1vdmVDbGFzcyhIdW1hblBpY2tlci5DTEFTUy5jbGFzc0tpZEFnZVNlbGVjdGVkKTtcclxuICAgICBcclxuICAgIGtpZEFnZUxpc3QuZmluZCgnW2RhdGEtcm9sZT1cImtpZC1hZ2UtaXRlbVwiXVtkYXRhLXZhbHVlPVwiJytjdXJWYWx1ZSsnXCJdJylcclxuICAgICAuYWRkQ2xhc3MoSHVtYW5QaWNrZXIuQ0xBU1MuY2xhc3NLaWRBZ2VTZWxlY3RlZCk7XHJcbiAgICAgICAgXHJcbiAgICBraWRBZ2VMaXN0LmZpbmQoJ1tkYXRhLXJvbGU9XCJraWQtYWdlLWl0ZW1cIl0nKVxyXG4gICAgICAub2ZmKGFnZUNsaWNrRXZlbnQpXHJcbiAgICAgIC5vbihhZ2VDbGlja0V2ZW50LCBmdW5jdGlvbihlKXtcclxuICAgICAgICBraWRBZ2VMaXN0LmZpbmQoJ1tkYXRhLXJvbGU9XCJraWQtYWdlLWl0ZW1cIl0nKVxyXG4gICAgICAgICAgLnJlbW92ZUNsYXNzKEh1bWFuUGlja2VyLkNMQVNTLmNsYXNzS2lkQWdlU2VsZWN0ZWQpO1xyXG4gICAgICAgICQodGhpcykuYWRkQ2xhc3MoSHVtYW5QaWNrZXIuQ0xBU1MuY2xhc3NLaWRBZ2VTZWxlY3RlZCk7ICBcclxuICAgICAgICBcclxuICAgICAgICBjYWxsYmFjay5jYWxsKGtpZEl0ZW0sIHt0ZXh0OiAkKHRoaXMpLnRleHQoKSwgdmFsdWU6ICQodGhpcykuZGF0YShcInZhbHVlXCIpfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAga2lkQWdlTGlzdC5oaWRlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBcclxuICAgIGtpZEFnZUxpc3Quc2hvdygpO1xyXG4gIH07XHJcbiAgXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gSFVNQU4gUElDS0VSIENTUyBDTEFTU0VTXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgSHVtYW5QaWNrZXIuQ0xBU1MgPSB7XHJcbiAgICBjbGFzc0l0ZW06IFwiaHVtYW4tcGlja2VyLWl0ZW1cIixcclxuICAgIGNsYXNzSXRlbVNlbGVjdGVkOiAnaHVtYW4tcGlja2VyLWl0ZW0tc2VsZWN0ZWQnLFxyXG4gICAgY2xhc3NLaWRBZ2VTZWxlY3RlZDogJ2tpZC1hZ2UtaXRlbS1zZWxlY3RlZCdcclxuICB9O1xyXG4gIFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEhVTUFOIFBJQ0tFUiBMT0NBTEVTXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgSHVtYW5QaWNrZXIuaTE4biA9IHtcclxuICAgICAgXCJydVwiOiB7XHJcbiAgICAgICAgdG9vbHRpcEl0ZW06IFwi0JTQvtCx0LDQstC40YLRjFwiLFxyXG4gICAgICAgIHRvb2x0aXBJdGVtU2VsZWN0ZWQ6IFwi0KPQtNCw0LvQuNGC0YxcIixcclxuICAgICAgICB0b29sdGlwRWRpdEFnZTogXCLQoNC10LTQsNC60YLQuNGA0L7QstCw0YLRjCDQstC+0LfRgNCw0YHRglwiLFxyXG4gICAgICAgIGtpZEFnZXM6IFtcIjAg0LvQtdGCXCIsIFwiMSDQs9C+0LRcIiwgXCIyINCz0L7QtNCwXCIsIFwiMyDQs9C+0LTQsFwiLCBcIjQg0LPQvtC00LBcIiwgXCI1INC70LXRglwiLCBcIjYg0LvQtdGCXCIsIFwiNyDQu9C10YJcIiwgXCI4INC70LXRglwiLCBcIjkg0LvQtdGCXCIsIFwiMTAg0LvQtdGCXCIsIFwiMTEg0LvQtdGCXCIsIFwiMTIg0LvQtdGCXCIsIFwiMTMg0LvQtdGCXCIsIFwiMTQg0LvQtdGCXCIsIFwiMTUg0LvQtdGCXCIsIFwiMTYg0LvQtdGCXCIsIFwiMTcg0LvQtdGCXCJdXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiZW5cIjoge1xyXG4gICAgICAgIHRvb2x0aXBJdGVtOiBcIkFkZFwiLFxyXG4gICAgICAgIHRvb2x0aXBJdGVtU2VsZWN0ZWQ6IFwiUmVtb3ZlXCIsXHJcbiAgICAgICAgdG9vbHRpcEVkaXRBZ2U6IFwiRWRpdCBhZ2VcIixcclxuICAgICAgICBraWRBZ2VzOiBbXCIwIHllYXJzXCIsIFwiMSB5ZWFyXCIsIFwiMiB5ZWFyc1wiLCBcIjMgeWVhcnNcIiwgXCI0IHllYXJzXCIsIFwiNSB5ZWFyc1wiLCBcIjYgeWVhcnNcIiwgXCI3IHllYXJzXCIsIFwiOCB5ZWFyc1wiLCBcIjkgeWVhcnNcIiwgXCIxMCB5ZWFyc1wiLCBcIjExIHllYXJzXCIsIFwiMTIgeWVhcnNcIiwgXCIxMyB5ZWFyc1wiLCBcIjE0IHllYXJzXCIsIFwiMTUgeWVhcnNcIiwgXCIxNiB5ZWFyc1wiLCBcIjE3IHllYXJzXCJdXHJcbiAgICAgIH1cclxuICB9O1xyXG4gIFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEhVTUFOIFBJQ0tFUiBURU1QTEFURVNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICBIdW1hblBpY2tlci5UcGwgPSB7XHJcbiAgICAvLyBUT0RPOiB1c2UgbGluayAnYScgbGlrZSBhY3Rpb25zXHJcbiAgICBXcmFwOiAnPHVsIGNsYXNzPVwiaHVtYW4tcGlja2VyXCI+PC91bD4nLFxyXG4gICAgQWR1bHRJdGVtOiAnPGxpIGNsYXNzPVwiJytIdW1hblBpY2tlci5DTEFTUy5jbGFzc0l0ZW0rJyBodW1hbi1waWNrZXItaXRlbS1hZHVsdFwiIGRhdGEtcm9sZT1cImFkdWx0LWl0ZW1cIj48L2xpPicsXHJcbiAgICBLaWRJdGVtOiAnPGxpIGNsYXNzPVwiJytIdW1hblBpY2tlci5DTEFTUy5jbGFzc0l0ZW0rJyBodW1hbi1waWNrZXItaXRlbS1raWRcIiBkYXRhLXJvbGU9XCJraWQtaXRlbVwiPjxkaXYgY2xhc3M9XCJraWQtYWdlLWNhcHRpb25cIj57YWdlfTwvZGl2PjwvbGk+JyxcclxuICAgIEJvZHlMaXN0Q29udGFpbmVyOiAnPGRpdiBpZD17aWR9PjwvZGl2PicsXHJcbiAgICBBZ2VMaXN0V3JhcDogJzxkaXYgc3R5bGU9XCJkaXNwbGF5OiBub25lO1wiIGNsYXNzPVwiaHVtYW4tcGlja2VyX2tpZC1hZ2UtbGlzdC13cmFwXCIgZGF0YS1yb2xlPVwia2lkLWFnZS1saXN0XCI+PC9kaXY+JyxcclxuICAgIEFnZUxpc3Q6ICc8dWwgY2xhc3M9XCJraWQtYWdlLWxpc3RcIj48L3VsPicsXHJcbiAgICBBZ2VMaXN0SXRlbTogJzxsaSBjbGFzcz1cImtpZC1hZ2UtaXRlbVwiIGRhdGEtcm9sZT1cImtpZC1hZ2UtaXRlbVwiIGRhdGEtdmFsdWU9XCJ7dmFsdWV9XCI+e3RleHR9PC9saT4nLFxyXG4gICAgSGlkZGVuSW5wdXQ6ICc8aW5wdXQgZGF0YS1yb2xlPVwie3JvbGV9XCIgbmFtZT1cIntuYW1lfVwiIHR5cGU9XCJoaWRkZW5cIiB2YWx1ZT1cInt2YWx1ZX1cIj4nLFxyXG4gIH07XHJcbiAgXHJcbiAgSHVtYW5QaWNrZXIuVkVSU0lPTiAgPSAnMS4wLjAnO1xyXG5cclxuICBIdW1hblBpY2tlci5ERUZBVUxUUyA9IHtcclxuICAgIGFkdWx0c0NvdW50OiA0LCAvLyBtYXhBZHVsdHMgZm9yIHNlbGVjdFxyXG4gICAga2lkc0NvdW50OiAzLCAvLyBtYXgga2lkcyBmb3Igc2VsZWN0XHJcbiAgICBpbml0aWFsVmFsdWU6IHtcclxuICAgICAgYWR1bHRzOiAyLCAvLyBhZHVsdHMgc2VsZWN0ZWRcclxuICAgICAga2lkczogMCwgLy8ga2lkcyBzZWxlY3RlZFxyXG4gICAgICBraWRzQWdlczogW10gLy8gYXJyYXkgYWdlcyBvZiBraWRzIGJhc2VkIG9uIGtpZHMgc2VsZWN0ZWQgY291bnQsIGRlZmF1bHQgYWdlIGZvciBraWQgMFxyXG4gICAgfSxcclxuICAgIGxhbmc6IFwiZW5cIixcclxuICAgIGFkdWx0c1BhcmFtTmFtZTogXCJhZHVsdHNcIiwgLy8gaGlkZGVuIGlucHV0IHBhcmFtZXRlciBuYW1lXHJcbiAgICBraWRzUGFyYW1OYW1lOiBcImtpZHNcIiwgLy8gaGlkZGVuIGlucHV0IHBhcmFtZXRlciBuYW1lXHJcbiAgICBraWRzQWdlc1BhcmFtTmFtZTogXCJraWRzQWdlc1tdXCIsIC8vIGhpZGRlbiBpbnB1dCBwYXJhbWV0ZXIgbmFtZVxyXG4gICAga2lkQWdlSXRlbXNHcm91cE1heDogOVxyXG4gIH07XHJcbiAgXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gSU5JVCBIVU1BTiBQSUNLRVIgSlFVRVJZIFBMVUdJTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PVxyXG4gIGZ1bmN0aW9uIGh1bWFuUGlja2VyUGx1Z2luKG9wdGlvbikge1xyXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgdmFyICR0aGlzICAgPSAkKHRoaXMpO1xyXG4gICAgICB2YXIgZGF0YSAgICA9ICR0aGlzLmRhdGEoJ3h0Lkh1bWFuUGlja2VyJyk7XHJcbiAgICAgIHZhciBvcHRpb25zID0gdHlwZW9mIG9wdGlvbiA9PT0gJ29iamVjdCcgJiYgb3B0aW9uO1xyXG5cclxuICAgICAgaWYgKCFkYXRhKXsgJHRoaXMuZGF0YSgneHQuSHVtYW5QaWNrZXInLCAoZGF0YSA9IG5ldyBIdW1hblBpY2tlcih0aGlzLCBvcHRpb25zKSkpOyB9XHJcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09PSAnc3RyaW5nJykgeyBkYXRhW29wdGlvbl0oKTsgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIFxyXG4gICQuZm4uSHVtYW5QaWNrZXIgICAgICAgICAgICAgPSBodW1hblBpY2tlclBsdWdpbjtcclxuICAkLmZuLkh1bWFuUGlja2VyLkNvbnN0cnVjdG9yID0gSHVtYW5QaWNrZXI7XHJcbiAgXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gSFVNQU4gUElDS0VSIERBVEEtQVBJXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICQod2luZG93KS5vbignbG9hZCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICQoJ1tkYXRhLWNvbnRyb2w9XCJodW1hbnBpY2tlclwiXScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJGVsZW1lbnQgPSAkKHRoaXMpO1xyXG4gICAgICB2YXIgZGF0YSA9ICRlbGVtZW50LmRhdGEoKTtcclxuICAgICAgaHVtYW5QaWNrZXJQbHVnaW4uY2FsbCgkZWxlbWVudCwgZGF0YSk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuICBcclxufSkoIGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCApOyJdfQ==
