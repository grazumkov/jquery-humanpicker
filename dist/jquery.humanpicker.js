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

// TODO: add gulp builder
// TODO: add documentation
// TODO: demo page
// TODO: add buty animation add/remove icons

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
  
  HumanPicker.VERSION  = '1.0.0'

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1Byb2dyYW0gRmlsZXMvbm9kZWpzL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJib3dlcl9jb21wb25lbnRzL25hbm8vbmFuby5qcyIsInNyYy9qcXVlcnkuaHVtYW5waWNrZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIjsgdmFyIF9fYnJvd3NlcmlmeV9zaGltX3JlcXVpcmVfXz1yZXF1aXJlOyhmdW5jdGlvbiBicm93c2VyaWZ5U2hpbShtb2R1bGUsIGV4cG9ydHMsIHJlcXVpcmUsIGRlZmluZSwgYnJvd3NlcmlmeV9zaGltX19kZWZpbmVfX21vZHVsZV9fZXhwb3J0X18pIHtcbi8qIE5hbm8gVGVtcGxhdGVzIC0gaHR0cHM6Ly9naXRodWIuY29tL3RyaXgvbmFubyAqL1xyXG5cclxuZnVuY3Rpb24gbmFubyh0ZW1wbGF0ZSwgZGF0YSkge1xyXG4gIHJldHVybiB0ZW1wbGF0ZS5yZXBsYWNlKC9cXHsoW1xcd1xcLl0qKVxcfS9nLCBmdW5jdGlvbihzdHIsIGtleSkge1xyXG4gICAgdmFyIGtleXMgPSBrZXkuc3BsaXQoXCIuXCIpLCB2ID0gZGF0YVtrZXlzLnNoaWZ0KCldO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBrZXlzLmxlbmd0aDsgaSA8IGw7IGkrKykgdiA9IHZba2V5c1tpXV07XHJcbiAgICByZXR1cm4gKHR5cGVvZiB2ICE9PSBcInVuZGVmaW5lZFwiICYmIHYgIT09IG51bGwpID8gdiA6IFwiXCI7XHJcbiAgfSk7XHJcbn1cclxuXG47IGJyb3dzZXJpZnlfc2hpbV9fZGVmaW5lX19tb2R1bGVfX2V4cG9ydF9fKHR5cGVvZiBuYW5vICE9IFwidW5kZWZpbmVkXCIgPyBuYW5vIDogd2luZG93Lm5hbm8pO1xuXG59KS5jYWxsKGdsb2JhbCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBmdW5jdGlvbiBkZWZpbmVFeHBvcnQoZXgpIHsgbW9kdWxlLmV4cG9ydHMgPSBleDsgfSk7XG4iLCIvKiBnbG9iYWwgalF1ZXJ5ICovXHJcblxyXG4vLyBUT0RPOiBhZGQgZ3VscCBidWlsZGVyXHJcbi8vIFRPRE86IGFkZCBkb2N1bWVudGF0aW9uXHJcbi8vIFRPRE86IGRlbW8gcGFnZVxyXG4vLyBUT0RPOiBhZGQgYnV0eSBhbmltYXRpb24gYWRkL3JlbW92ZSBpY29uc1xyXG5cclxuOyhmdW5jdGlvbigkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHsgXHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG4gIHZhciBIdW1hblBpY2tlcixcclxuICAgICAgbmFubyA9IHJlcXVpcmUoXCJuYW5vXCIpO1xyXG4gICAgICBcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBIVU1BTiBQSUNLRVIgQ0xBU1NcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICBIdW1hblBpY2tlciA9IGZ1bmN0aW9uKGVsZW1lbnQsIG9wdGlvbnMpIHsgXHJcbiAgICB0aGlzLm9wdGlvbnMgICA9ICQuZXh0ZW5kKHt9LCBIdW1hblBpY2tlci5ERUZBVUxUUywgb3B0aW9ucyk7XHJcblxyXG4gICAgLy8gZ2VuZXJhdGUgYWdlIGl0ZW1zIGZyb20gbG9jYWxlIHNldHRpbmdzXHJcbiAgICAvLyB1c2UgdmFsdWUgYXMgaW5kZXhcclxuICAgIHRoaXMua2lkQWdlSXRlbXMgPSBbXTtcclxuICAgIHZhciBrYWdlcyA9IEh1bWFuUGlja2VyLmkxOG5bdGhpcy5vcHRpb25zLmxhbmddW1wia2lkQWdlc1wiXSB8fCBbXTtcclxuICAgIHRoaXMua2lkQWdlSXRlbXMgPSAkLm1hcChrYWdlcywgZnVuY3Rpb24oYWdlLCBpKXtcclxuICAgICAgcmV0dXJuIHsgdGV4dDogYWdlLCB2YWx1ZTogaSB9O1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kZWxlbWVudCAgPSAkKGVsZW1lbnQpO1xyXG4gICAgdGhpcy4kYm9keUxpc3RDb250YWluZXIgPSB0aGlzLl9yZW5kZXJUcGwoSHVtYW5QaWNrZXIuVHBsLkJvZHlMaXN0Q29udGFpbmVyLCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtpZDogdGhpcy4kZWxlbWVudC5wcm9wKCdpZCcpKydfSHVtYW5QaWNrZXJMaXN0Q29udGFpbmVyJ30pO1xyXG4gICAgdGhpcy4kYWdlTGlzdFdyYXAgPSB0aGlzLl9yZW5kZXJUcGwoSHVtYW5QaWNrZXIuVHBsLkFnZUxpc3RXcmFwKTtcclxuICAgIHRoaXMuJGFnZUxpc3RXcmFwLmFwcGVuZFRvKHRoaXMuJGJvZHlMaXN0Q29udGFpbmVyKTtcclxuICAgIFxyXG4gICAgdGhpcy4kYm9keUxpc3RDb250YWluZXIuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSk7XHJcbiAgICBcclxuICAgIHRoaXMuX3JlbmRlcigpO1xyXG4gICAgdGhpcy5fYmluZEV2ZW50cygpO1xyXG4gIH07XHJcblxyXG4gIEh1bWFuUGlja2VyLnByb3RvdHlwZS5fZ2V0STE4biA9IGZ1bmN0aW9uIChrZXkpe1xyXG4gICAgcmV0dXJuIEh1bWFuUGlja2VyLmkxOG5bdGhpcy5vcHRpb25zLmxhbmddW2tleV07XHJcbiAgfTtcclxuICBcclxuICBIdW1hblBpY2tlci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKClcclxuICB7XHJcbiAgICB0aGlzLiRlbGVtZW50LmVtcHR5KCk7XHJcbiAgICB0aGlzLiRib2R5TGlzdENvbnRhaW5lci5lbXB0eSgpO1xyXG4gICAgdGhpcy4kYm9keUxpc3RDb250YWluZXIucmVtb3ZlKCk7XHJcbiAgfTtcclxuICBcclxuICBIdW1hblBpY2tlci5wcm90b3R5cGUuX3JlbmRlclRwbCA9IGZ1bmN0aW9uKHRlbXBsYXRlLCBkYXRhKXtcclxuICAgIHJldHVybiAkKG5hbm8odGVtcGxhdGUsIGRhdGEpKTtcclxuICB9O1xyXG4gIFxyXG4gIEh1bWFuUGlja2VyLnByb3RvdHlwZS5fcmVuZGVyID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICAkd3JhcCA9IHRoaXMuX3JlbmRlclRwbChIdW1hblBpY2tlci5UcGwuV3JhcCksXHJcbiAgICAgICAgb3B0cyA9IHRoaXMub3B0aW9ucyxcclxuICAgICAgICBpbml0VmFsID0gb3B0cy5pbml0aWFsVmFsdWUsXHJcbiAgICAgICAgb3B0S2lkQWdlcyA9IGluaXRWYWwua2lkc0FnZXMgJiYgaW5pdFZhbC5raWRzQWdlcyBpbnN0YW5jZW9mIEFycmF5P2luaXRWYWwua2lkc0FnZXM6W10sXHJcbiAgICAgICAgaTtcclxuICAgICAgICBcclxuICAgIHRoaXMuJGVsZW1lbnQuZW1wdHkoKTtcclxuICAgIFxyXG4gICAgLy9hZHVsdHNcclxuICAgIGZvcihpID0gMDsgaSA8IG9wdHMuYWR1bHRzQ291bnQ7IGkrKyl7XHJcbiAgICAgIHNlbGYuX3JlbmRlclRwbChIdW1hblBpY2tlci5UcGwuQWR1bHRJdGVtKVxyXG4gICAgICAgIC5hZGRDbGFzcyhpPGluaXRWYWwuYWR1bHRzP0h1bWFuUGlja2VyLkNMQVNTLmNsYXNzSXRlbVNlbGVjdGVkOicnKVxyXG4gICAgICAgIC5hcHBlbmRUbygkd3JhcCk7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICAvLyBhZHVsdHMsIGtpZHMgaW5wdXRcclxuICAgIHNlbGYuX3JlbmRlclRwbChIdW1hblBpY2tlci5UcGwuSGlkZGVuSW5wdXQsIHtyb2xlOiBcImFkdWx0c1wiLCBuYW1lOiBvcHRzLmFkdWx0c1BhcmFtTmFtZSwgdmFsdWU6IGluaXRWYWwuYWR1bHRzfSlcclxuICAgIC5hcHBlbmRUbygkd3JhcCk7XHJcbiAgICBcclxuICAgICBzZWxmLl9yZW5kZXJUcGwoSHVtYW5QaWNrZXIuVHBsLkhpZGRlbklucHV0LCB7cm9sZTogXCJraWRzXCIsIG5hbWU6IG9wdHMua2lkc1BhcmFtTmFtZSwgdmFsdWU6IGluaXRWYWwua2lkc30pXHJcbiAgICAuYXBwZW5kVG8oJHdyYXApO1xyXG4gICAgXHJcbiAgICAvL2tpZHNcclxuICAgIGZvcihpID0gMDsgaSA8IG9wdHMuYWR1bHRzQ291bnQ7IGkrKyl7ICAgICAgICBcclxuICAgICAgc2VsZi5fcmVuZGVyVHBsKEh1bWFuUGlja2VyLlRwbC5LaWRJdGVtLCB7YWdlOiBvcHRLaWRBZ2VzW2ldIHx8IDB9KVxyXG4gICAgICAgIC5hcHBlbmQoXHJcbiAgICAgICAgICBzZWxmLl9yZW5kZXJUcGwoSHVtYW5QaWNrZXIuVHBsLkhpZGRlbklucHV0LCB7cm9sZTogXCJraWQtYWdlXCIsIG5hbWU6IG9wdHMua2lkc0FnZXNQYXJhbU5hbWUsIHZhbHVlOiBvcHRLaWRBZ2VzW2ldIHx8IDB9KVxyXG4gICAgICAgICAgLnByb3AoXCJkaXNhYmxlZFwiLGk+PWluaXRWYWwua2lkcykpXHJcbiAgICAgICAgLmFkZENsYXNzKGk8aW5pdFZhbC5raWRzP0h1bWFuUGlja2VyLkNMQVNTLmNsYXNzSXRlbVNlbGVjdGVkOicnKVxyXG4gICAgICAgIC5hcHBlbmRUbygkd3JhcCk7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICAvLyBoaWRkZW4ga2lkIGFnZSBwaWNrZXJcclxuICAgIGlmKHNlbGYua2lkQWdlSXRlbXMubGVuZ3RoID4gMClcclxuICAgIHtcclxuICAgICAgc2VsZi5fcmVuZGVyS2lkQWdlTGlzdCgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzZWxmLiRlbGVtZW50LmFwcGVuZCgkd3JhcCk7XHJcblxyXG4gICAgc2VsZi5fdXBkYXRlVG9vbHRpcHMoKTtcclxuICB9O1xyXG4gIFxyXG4gIEh1bWFuUGlja2VyLnByb3RvdHlwZS5fcmVuZGVyS2lkQWdlTGlzdCA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgb3B0cyA9IHRoaXMub3B0aW9ucyxcclxuICAgICAgICBncm91cE1heEl0ZW1zID0gb3B0cy5raWRBZ2VJdGVtc0dyb3VwTWF4IHx8IDksXHJcbiAgICAgICAgZ3JvdXBzQ291bnQgPSBNYXRoLm1heCgoKHNlbGYua2lkQWdlSXRlbXMubGVuZ3RoIHx8IDEpIC8gZ3JvdXBNYXhJdGVtcykudG9GaXhlZCgpIC0gMCwgMSksXHJcbiAgICAgICAgbGlzdCwgaSxqLG1heDtcclxuICAgICAgICBcclxuICAgICAgdGhpcy4kYWdlTGlzdFdyYXAuZW1wdHkoKTtcclxuICAgICAgICBcclxuICAgICAgZm9yKGk9MDsgaTxncm91cHNDb3VudDsgaSsrKXtcclxuICAgICAgICBsaXN0ID0gc2VsZi5fcmVuZGVyVHBsKEh1bWFuUGlja2VyLlRwbC5BZ2VMaXN0KTtcclxuICAgICAgICBtYXggPSBNYXRoLm1pbigoaSpncm91cE1heEl0ZW1zKStncm91cE1heEl0ZW1zLCBzZWxmLmtpZEFnZUl0ZW1zLmxlbmd0aCk7XHJcbiAgICAgICAgZm9yKGo9aSpncm91cE1heEl0ZW1zOyBqPG1heDsgaisrKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHNlbGYuX3JlbmRlclRwbChIdW1hblBpY2tlci5UcGwuQWdlTGlzdEl0ZW0sIHNlbGYua2lkQWdlSXRlbXNbal0pXHJcbiAgICAgICAgICAgIC5hcHBlbmRUbyhsaXN0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGlzdC5hcHBlbmRUbyh0aGlzLiRhZ2VMaXN0V3JhcCk7XHJcbiAgICAgIH1cclxuICB9O1xyXG4gIFxyXG4gIEh1bWFuUGlja2VyLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uKHZhbHVlKXtcclxuICAgIGlmKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jyl7XHJcbiAgICAgIHRoaXMuX3NldFZhbHVlKHZhbHVlKTtcclxuICAgIH1cclxuICAgIGVsc2V7XHJcbiAgICAgIHJldHVybiB0aGlzLl9nZXRWYWx1ZSgpO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgXHJcbiAgSHVtYW5QaWNrZXIucHJvdG90eXBlLl9zZXRWYWx1ZSA9IGZ1bmN0aW9uKHZhbHVlKXtcclxuICAgIC8vIFRPRE86IFJlYWxpemVcclxuICB9XHJcblxyXG4gIEh1bWFuUGlja2VyLnByb3RvdHlwZS5fZ2V0VmFsdWUgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIG9ialJlcyA9IHt9LFxyXG4gICAgICAgIGlucHV0QWR1bHRzID0gdGhpcy4kZWxlbWVudC5maW5kKCdpbnB1dFtkYXRhLXJvbGU9XCJhZHVsdHNcIl0nKSxcclxuICAgICAgICBpbnB1dEtpZHMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ2lucHV0W2RhdGEtcm9sZT1cImtpZHNcIl0nKSxcclxuICAgICAgICBpbnB1dEtpZEFnZXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy4nK0h1bWFuUGlja2VyLkNMQVNTLmNsYXNzSXRlbVNlbGVjdGVkKycgaW5wdXRbZGF0YS1yb2xlPVwia2lkLWFnZVwiXScpO1xyXG4gICAgICAgIFxyXG4gICAgb2JqUmVzLmFkdWx0cyA9IGlucHV0QWR1bHRzLnZhbCgpO1xyXG4gICAgb2JqUmVzLmtpZHMgPSBpbnB1dEtpZHMudmFsKCk7XHJcblxyXG4gICAgb2JqUmVzLmtpZHNBZ2VzID0gb2JqUmVzLmtpZHNBZ2VzIHx8IFtdO1xyXG4gICAgaWYoaW5wdXRLaWRBZ2VzLmxlbmd0aCl7XHJcbiAgICAgIG9ialJlcy5raWRzQWdlcyA9ICQubWFwKGlucHV0S2lkQWdlcywgZnVuY3Rpb24oaXRlbSwgaW5kZXgpezsgXHJcbiAgICAgICAgcmV0dXJuIGl0ZW0udmFsdWUtMDtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gb2JqUmVzO1xyXG4gIH07XHJcblxyXG4gIEh1bWFuUGlja2VyLnByb3RvdHlwZS5fdXBkYXRlVG9vbHRpcHMgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgIGVsZW0gPSBzZWxmLiRlbGVtZW50O1xyXG5cclxuICAgIGVsZW0uZmluZChcIi5cIitIdW1hblBpY2tlci5DTEFTUy5jbGFzc0l0ZW0pLmVhY2goZnVuY3Rpb24oaSwgaXRlbSl7XHJcbiAgICAgICAgdmFyICRpdGVtID0gJChpdGVtKTtcclxuICAgICAgICB2YXIgdGl0bGVLZXkgPSAkaXRlbS5oYXNDbGFzcyhIdW1hblBpY2tlci5DTEFTUy5jbGFzc0l0ZW1TZWxlY3RlZCk/XCJ0b29sdGlwSXRlbVNlbGVjdGVkXCI6XCJ0b29sdGlwSXRlbVwiO1xyXG4gICAgICAgICQoJGl0ZW0pLmF0dHIoXCJ0aXRsZVwiLCBzZWxmLl9nZXRJMThuKHRpdGxlS2V5KSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBlbGVtLmZpbmQoJy5raWQtYWdlLWNhcHRpb24nKS5lYWNoKGZ1bmN0aW9uKGksIGl0ZW0pe1xyXG4gICAgICB2YXIgJGl0ZW0gPSAkKGl0ZW0pO1xyXG4gICAgICBpZigkaXRlbS5jbG9zZXN0KFwiLlwiK0h1bWFuUGlja2VyLkNMQVNTLmNsYXNzSXRlbSkuaGFzQ2xhc3MoSHVtYW5QaWNrZXIuQ0xBU1MuY2xhc3NJdGVtU2VsZWN0ZWQpKXtcclxuICAgICAgICAgICRpdGVtLmF0dHIoXCJ0aXRsZVwiLCBzZWxmLl9nZXRJMThuKFwidG9vbHRpcEVkaXRBZ2VcIikpO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2V7XHJcbiAgICAgICAgICAkaXRlbS5yZW1vdmVBdHRyKFwidGl0bGVcIik7XHJcbiAgICAgIH0gICAgICBcclxuICAgIH0pO1xyXG4gICAgICAgICAgICBcclxuICB9O1xyXG4gIFxyXG4gIC8vIFRPRE86IHJlcGxhY2UvcmVtb3ZlIGF0dHJpYnV0ZSBzZWxlY3RvcnNcclxuICBIdW1hblBpY2tlci5wcm90b3R5cGUuX2JpbmRFdmVudHMgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgIHVwZGF0ZUtpZHNDb3VudFZhbHVlID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAgIHNlbGYuJGVsZW1lbnQuZmluZCgnaW5wdXRbZGF0YS1yb2xlPVwia2lkc1wiXScpXHJcbiAgICAgICAgICAgIC52YWwoc2VsZi4kZWxlbWVudC5maW5kKCdbZGF0YS1yb2xlPVwia2lkLWl0ZW1cIl0uJytIdW1hblBpY2tlci5DTEFTUy5jbGFzc0l0ZW1TZWxlY3RlZCkubGVuZ3RoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIFxyXG4gICAgc2VsZi4kZWxlbWVudFxyXG4gICAgICAuZmluZChcIltkYXRhLXJvbGU9J2FkdWx0LWl0ZW0nXVwiKVxyXG4gICAgICAub24oXCJjbGlja1wiLGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIHZhciBpbnB1dCA9IHNlbGYuJGVsZW1lbnQuZmluZCgnaW5wdXRbZGF0YS1yb2xlPVwiYWR1bHRzXCJdJyk7XHJcbiAgICAgICAgJCh0aGlzKS50b2dnbGVDbGFzcyhIdW1hblBpY2tlci5DTEFTUy5jbGFzc0l0ZW1TZWxlY3RlZCk7XHJcbiAgICAgICAgaW5wdXQudmFsKHNlbGYuJGVsZW1lbnQuZmluZCgnW2RhdGEtcm9sZT1cImFkdWx0LWl0ZW1cIl0uJytIdW1hblBpY2tlci5DTEFTUy5jbGFzc0l0ZW1TZWxlY3RlZCkubGVuZ3RoKTtcclxuICAgICAgICBzZWxmLl91cGRhdGVUb29sdGlwcygpO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIHNlbGYuJGVsZW1lbnRcclxuICAgICAgLmZpbmQoXCJbZGF0YS1yb2xlPSdraWQtaXRlbSddXCIpXHJcbiAgICAgIC5vbihcImNsaWNrXCIsZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcclxuICAgICAgICAgICAgY3VyVmFsID0gJHRoaXMuZmluZCgnaW5wdXRbZGF0YS1yb2xlPVwia2lkLWFnZVwiXScpLnZhbCgpIHx8IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgc2VsZi5fa2lkQWdlUGlja2VyQ2xvc2UoKTtcclxuICAgICAgICBcclxuICAgICAgICBpZigkdGhpcy5oYXNDbGFzcyhIdW1hblBpY2tlci5DTEFTUy5jbGFzc0l0ZW1TZWxlY3RlZCkpe1xyXG4gICAgICAgICAgJHRoaXMucmVtb3ZlQ2xhc3MoIEh1bWFuUGlja2VyLkNMQVNTLmNsYXNzSXRlbVNlbGVjdGVkKTtcclxuICAgICAgICAgICR0aGlzLmZpbmQoJy5raWQtYWdlLWNhcHRpb24nKS50ZXh0KDApO1xyXG4gICAgICAgICAgJHRoaXMuZmluZCgnaW5wdXRbZGF0YS1yb2xlPVwia2lkLWFnZVwiXScpXHJcbiAgICAgICAgICAgIC5wcm9wKFwiZGlzYWJsZWRcIix0cnVlKVxyXG4gICAgICAgICAgICAudmFsKDApO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgIHVwZGF0ZUtpZHNDb3VudFZhbHVlKCk7XHJcbiAgICAgICAgICBzZWxmLl91cGRhdGVUb29sdGlwcygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgJHRoaXMuZmluZCgnLmtpZC1hZ2UtY2FwdGlvbicpLnRyaWdnZXIoXCJjbGlja1wiKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBzZWxmLiRlbGVtZW50XHJcbiAgICAgIC5maW5kKFwiLmtpZC1hZ2UtY2FwdGlvblwiKVxyXG4gICAgICAub24oXCJjbGlja1wiLGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXHJcbiAgICAgICAgICAgICAka2lkSXRlbSA9ICR0aGlzLmNsb3Nlc3QoXCJbZGF0YS1yb2xlPSdraWQtaXRlbSddXCIpLFxyXG4gICAgICAgICAgICAgY3VyVmFsID0gJGtpZEl0ZW0uZmluZCgnaW5wdXRbZGF0YS1yb2xlPVwia2lkLWFnZVwiXScpLnZhbCgpIHx8IDA7XHJcbiAgICAgICAgIHNlbGYuX2tpZEFnZVBpY2tlclNob3coJGtpZEl0ZW0sIGN1clZhbCwgZnVuY3Rpb24odmFsdWVJdGVtKXtcclxuICAgICAgICAgICAgJHRoaXMudGV4dCh2YWx1ZUl0ZW0udGV4dC5yZXBsYWNlKC8gL2csXCJcIikpO1xyXG4gICAgICAgICAgICAka2lkSXRlbS5hZGRDbGFzcyggSHVtYW5QaWNrZXIuQ0xBU1MuY2xhc3NJdGVtU2VsZWN0ZWQpO1xyXG4gICAgICAgICAgICAka2lkSXRlbS5maW5kKCdpbnB1dFtkYXRhLXJvbGU9XCJraWQtYWdlXCJdJylcclxuICAgICAgICAgICAgICAucHJvcChcImRpc2FibGVkXCIsZmFsc2UpXHJcbiAgICAgICAgICAgICAgLnZhbCh2YWx1ZUl0ZW0udmFsdWUpOyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB1cGRhdGVLaWRzQ291bnRWYWx1ZSgpO1xyXG4gICAgICAgICAgICBzZWxmLl91cGRhdGVUb29sdGlwcygpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgJChkb2N1bWVudClcclxuICAgICAgLm9mZihcImNsaWNrLmh1bWFucGlja2VyLmRvY3VtZW50XCIpXHJcbiAgICAgIC5vbihcImNsaWNrLmh1bWFucGlja2VyLmRvY3VtZW50XCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGlmKCQoZS50YXJnZXQpLmNsb3Nlc3QoJ1tkYXRhLXJvbGU9XCJraWQtYWdlLWxpc3RcIl0nKS5sZW5ndGggfHxcclxuICAgICAgICAgICAkKGUudGFyZ2V0KS5jbG9zZXN0KCdbZGF0YS1yb2xlPVwia2lkLWl0ZW1cIl0nKS5sZW5ndGgpe1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZWxmLl9raWRBZ2VQaWNrZXJDbG9zZSgpO1xyXG4gICAgICB9KTtcclxuICAgICAgXHJcbiAgICAkKHdpbmRvdylcclxuICAgICAgLm9mZihcInJlc2l6ZS5odW1hbnBpY2tlci53aW5kb3dcIilcclxuICAgICAgLm9uKFwicmVzaXplLmh1bWFucGlja2VyLndpbmRvd1wiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBzZWxmLl9raWRBZ2VQaWNrZXJDbG9zZSgpO1xyXG4gICAgICB9KTtcclxuICB9XHJcbiAgSHVtYW5QaWNrZXIucHJvdG90eXBlLl9raWRBZ2VQaWNrZXJDbG9zZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIga2lkQWdlTGlzdCA9IHRoaXMuJGFnZUxpc3RXcmFwO1xyXG4gICAga2lkQWdlTGlzdC5oaWRlKCk7XHJcbiAgfTtcclxuICBcclxuICBIdW1hblBpY2tlci5wcm90b3R5cGUuX2tpZEFnZVBpY2tlclNob3cgPSBmdW5jdGlvbihraWRJdGVtLCBjdXJWYWx1ZSwgY2FsbGJhY2spe1xyXG4gICAgdmFyIGFnZUNsaWNrRXZlbnQgPSBcImNsaWNrLmh1bWFucGlja2VyXCIsXHJcbiAgICAgICAga2lkQWdlTGlzdCA9IHRoaXMuJGFnZUxpc3RXcmFwO1xyXG4gICAgICAgIFxyXG4gICAga2lkQWdlTGlzdC5jc3MoXCJsZWZ0XCIsICQoa2lkSXRlbSkub2Zmc2V0KCkubGVmdCk7XHJcbiAgICBraWRBZ2VMaXN0LmNzcyhcInRvcFwiLCAkKGtpZEl0ZW0pLm9mZnNldCgpLnRvcCArICQoa2lkSXRlbSkub3V0ZXJIZWlnaHQoKSArIDIpO1xyXG4gICAgICAgIFxyXG4gICAga2lkQWdlTGlzdC5maW5kKCdbZGF0YS1yb2xlPVwia2lkLWFnZS1pdGVtXCJdJylcclxuICAgICAucmVtb3ZlQ2xhc3MoSHVtYW5QaWNrZXIuQ0xBU1MuY2xhc3NLaWRBZ2VTZWxlY3RlZCk7XHJcbiAgICAgXHJcbiAgICBraWRBZ2VMaXN0LmZpbmQoJ1tkYXRhLXJvbGU9XCJraWQtYWdlLWl0ZW1cIl1bZGF0YS12YWx1ZT1cIicrY3VyVmFsdWUrJ1wiXScpXHJcbiAgICAgLmFkZENsYXNzKEh1bWFuUGlja2VyLkNMQVNTLmNsYXNzS2lkQWdlU2VsZWN0ZWQpO1xyXG4gICAgICAgIFxyXG4gICAga2lkQWdlTGlzdC5maW5kKCdbZGF0YS1yb2xlPVwia2lkLWFnZS1pdGVtXCJdJylcclxuICAgICAgLm9mZihhZ2VDbGlja0V2ZW50KVxyXG4gICAgICAub24oYWdlQ2xpY2tFdmVudCwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAga2lkQWdlTGlzdC5maW5kKCdbZGF0YS1yb2xlPVwia2lkLWFnZS1pdGVtXCJdJylcclxuICAgICAgICAgIC5yZW1vdmVDbGFzcyhIdW1hblBpY2tlci5DTEFTUy5jbGFzc0tpZEFnZVNlbGVjdGVkKTtcclxuICAgICAgICAkKHRoaXMpLmFkZENsYXNzKEh1bWFuUGlja2VyLkNMQVNTLmNsYXNzS2lkQWdlU2VsZWN0ZWQpOyAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgY2FsbGJhY2suY2FsbChraWRJdGVtLCB7dGV4dDogJCh0aGlzKS50ZXh0KCksIHZhbHVlOiAkKHRoaXMpLmRhdGEoXCJ2YWx1ZVwiKX0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGtpZEFnZUxpc3QuaGlkZSgpO1xyXG4gICAgICB9KTtcclxuICAgICAgXHJcbiAgICBraWRBZ2VMaXN0LnNob3coKTtcclxuICB9O1xyXG4gIFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEhVTUFOIFBJQ0tFUiBDU1MgQ0xBU1NFU1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIEh1bWFuUGlja2VyLkNMQVNTID0ge1xyXG4gICAgY2xhc3NJdGVtOiBcImh1bWFuLXBpY2tlci1pdGVtXCIsXHJcbiAgICBjbGFzc0l0ZW1TZWxlY3RlZDogJ2h1bWFuLXBpY2tlci1pdGVtLXNlbGVjdGVkJyxcclxuICAgIGNsYXNzS2lkQWdlU2VsZWN0ZWQ6ICdraWQtYWdlLWl0ZW0tc2VsZWN0ZWQnXHJcbiAgfTtcclxuICBcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBIVU1BTiBQSUNLRVIgTE9DQUxFU1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIEh1bWFuUGlja2VyLmkxOG4gPSB7XHJcbiAgICAgIFwicnVcIjoge1xyXG4gICAgICAgIHRvb2x0aXBJdGVtOiBcItCU0L7QsdCw0LLQuNGC0YxcIixcclxuICAgICAgICB0b29sdGlwSXRlbVNlbGVjdGVkOiBcItCj0LTQsNC70LjRgtGMXCIsXHJcbiAgICAgICAgdG9vbHRpcEVkaXRBZ2U6IFwi0KDQtdC00LDQutGC0LjRgNC+0LLQsNGC0Ywg0LLQvtC30YDQsNGB0YJcIixcclxuICAgICAgICBraWRBZ2VzOiBbXCIwINC70LXRglwiLCBcIjEg0LPQvtC0XCIsIFwiMiDQs9C+0LTQsFwiLCBcIjMg0LPQvtC00LBcIiwgXCI0INCz0L7QtNCwXCIsIFwiNSDQu9C10YJcIiwgXCI2INC70LXRglwiLCBcIjcg0LvQtdGCXCIsIFwiOCDQu9C10YJcIiwgXCI5INC70LXRglwiLCBcIjEwINC70LXRglwiLCBcIjExINC70LXRglwiLCBcIjEyINC70LXRglwiLCBcIjEzINC70LXRglwiLCBcIjE0INC70LXRglwiLCBcIjE1INC70LXRglwiLCBcIjE2INC70LXRglwiLCBcIjE3INC70LXRglwiXVxyXG4gICAgICB9LFxyXG4gICAgICBcImVuXCI6IHtcclxuICAgICAgICB0b29sdGlwSXRlbTogXCJBZGRcIixcclxuICAgICAgICB0b29sdGlwSXRlbVNlbGVjdGVkOiBcIlJlbW92ZVwiLFxyXG4gICAgICAgIHRvb2x0aXBFZGl0QWdlOiBcIkVkaXQgYWdlXCIsXHJcbiAgICAgICAga2lkQWdlczogW1wiMCB5ZWFyc1wiLCBcIjEgeWVhclwiLCBcIjIgeWVhcnNcIiwgXCIzIHllYXJzXCIsIFwiNCB5ZWFyc1wiLCBcIjUgeWVhcnNcIiwgXCI2IHllYXJzXCIsIFwiNyB5ZWFyc1wiLCBcIjggeWVhcnNcIiwgXCI5IHllYXJzXCIsIFwiMTAgeWVhcnNcIiwgXCIxMSB5ZWFyc1wiLCBcIjEyIHllYXJzXCIsIFwiMTMgeWVhcnNcIiwgXCIxNCB5ZWFyc1wiLCBcIjE1IHllYXJzXCIsIFwiMTYgeWVhcnNcIiwgXCIxNyB5ZWFyc1wiXVxyXG4gICAgICB9XHJcbiAgfTtcclxuICBcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBIVU1BTiBQSUNLRVIgVEVNUExBVEVTXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgSHVtYW5QaWNrZXIuVHBsID0ge1xyXG4gICAgLy8gVE9ETzogdXNlIGxpbmsgJ2EnIGxpa2UgYWN0aW9uc1xyXG4gICAgV3JhcDogJzx1bCBjbGFzcz1cImh1bWFuLXBpY2tlclwiPjwvdWw+JyxcclxuICAgIEFkdWx0SXRlbTogJzxsaSBjbGFzcz1cIicrSHVtYW5QaWNrZXIuQ0xBU1MuY2xhc3NJdGVtKycgaHVtYW4tcGlja2VyLWl0ZW0tYWR1bHRcIiBkYXRhLXJvbGU9XCJhZHVsdC1pdGVtXCI+PC9saT4nLFxyXG4gICAgS2lkSXRlbTogJzxsaSBjbGFzcz1cIicrSHVtYW5QaWNrZXIuQ0xBU1MuY2xhc3NJdGVtKycgaHVtYW4tcGlja2VyLWl0ZW0ta2lkXCIgZGF0YS1yb2xlPVwia2lkLWl0ZW1cIj48ZGl2IGNsYXNzPVwia2lkLWFnZS1jYXB0aW9uXCI+e2FnZX08L2Rpdj48L2xpPicsXHJcbiAgICBCb2R5TGlzdENvbnRhaW5lcjogJzxkaXYgaWQ9e2lkfT48L2Rpdj4nLFxyXG4gICAgQWdlTGlzdFdyYXA6ICc8ZGl2IHN0eWxlPVwiZGlzcGxheTogbm9uZTtcIiBjbGFzcz1cImh1bWFuLXBpY2tlcl9raWQtYWdlLWxpc3Qtd3JhcFwiIGRhdGEtcm9sZT1cImtpZC1hZ2UtbGlzdFwiPjwvZGl2PicsXHJcbiAgICBBZ2VMaXN0OiAnPHVsIGNsYXNzPVwia2lkLWFnZS1saXN0XCI+PC91bD4nLFxyXG4gICAgQWdlTGlzdEl0ZW06ICc8bGkgY2xhc3M9XCJraWQtYWdlLWl0ZW1cIiBkYXRhLXJvbGU9XCJraWQtYWdlLWl0ZW1cIiBkYXRhLXZhbHVlPVwie3ZhbHVlfVwiPnt0ZXh0fTwvbGk+JyxcclxuICAgIEhpZGRlbklucHV0OiAnPGlucHV0IGRhdGEtcm9sZT1cIntyb2xlfVwiIG5hbWU9XCJ7bmFtZX1cIiB0eXBlPVwiaGlkZGVuXCIgdmFsdWU9XCJ7dmFsdWV9XCI+JyxcclxuICB9O1xyXG4gIFxyXG4gIEh1bWFuUGlja2VyLlZFUlNJT04gID0gJzEuMC4wJ1xyXG5cclxuICBIdW1hblBpY2tlci5ERUZBVUxUUyA9IHtcclxuICAgIGFkdWx0c0NvdW50OiA0LCAvLyBtYXhBZHVsdHMgZm9yIHNlbGVjdFxyXG4gICAga2lkc0NvdW50OiAzLCAvLyBtYXgga2lkcyBmb3Igc2VsZWN0XHJcbiAgICBpbml0aWFsVmFsdWU6IHtcclxuICAgICAgYWR1bHRzOiAyLCAvLyBhZHVsdHMgc2VsZWN0ZWRcclxuICAgICAga2lkczogMCwgLy8ga2lkcyBzZWxlY3RlZFxyXG4gICAgICBraWRzQWdlczogW10gLy8gYXJyYXkgYWdlcyBvZiBraWRzIGJhc2VkIG9uIGtpZHMgc2VsZWN0ZWQgY291bnQsIGRlZmF1bHQgYWdlIGZvciBraWQgMFxyXG4gICAgfSxcclxuICAgIGxhbmc6IFwiZW5cIixcclxuICAgIGFkdWx0c1BhcmFtTmFtZTogXCJhZHVsdHNcIiwgLy8gaGlkZGVuIGlucHV0IHBhcmFtZXRlciBuYW1lXHJcbiAgICBraWRzUGFyYW1OYW1lOiBcImtpZHNcIiwgLy8gaGlkZGVuIGlucHV0IHBhcmFtZXRlciBuYW1lXHJcbiAgICBraWRzQWdlc1BhcmFtTmFtZTogXCJraWRzQWdlc1tdXCIsIC8vIGhpZGRlbiBpbnB1dCBwYXJhbWV0ZXIgbmFtZVxyXG4gICAga2lkQWdlSXRlbXNHcm91cE1heDogOVxyXG4gIH07XHJcbiAgXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gSU5JVCBIVU1BTiBQSUNLRVIgSlFVRVJZIFBMVUdJTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PVxyXG4gIGZ1bmN0aW9uIGh1bWFuUGlja2VyUGx1Z2luKG9wdGlvbikge1xyXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxyXG4gICAgICB2YXIgZGF0YSAgICA9ICR0aGlzLmRhdGEoJ3h0Lkh1bWFuUGlja2VyJylcclxuICAgICAgdmFyIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvblxyXG5cclxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCd4dC5IdW1hblBpY2tlcicsIChkYXRhID0gbmV3IEh1bWFuUGlja2VyKHRoaXMsIG9wdGlvbnMpKSlcclxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXSgpXHJcbiAgICB9KVxyXG4gIH1cclxuICBcclxuICAkLmZuLkh1bWFuUGlja2VyICAgICAgICAgICAgID0gaHVtYW5QaWNrZXJQbHVnaW5cclxuICAkLmZuLkh1bWFuUGlja2VyLkNvbnN0cnVjdG9yID0gSHVtYW5QaWNrZXJcclxuICBcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBIVU1BTiBQSUNLRVIgREFUQS1BUElcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJCh3aW5kb3cpLm9uKCdsb2FkJywgZnVuY3Rpb24gKCkge1xyXG4gICAgJCgnW2RhdGEtY29udHJvbD1cImh1bWFucGlja2VyXCJdJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkZWxlbWVudCA9ICQodGhpcylcclxuICAgICAgdmFyIGRhdGEgPSAkZWxlbWVudC5kYXRhKClcclxuICAgICAgaHVtYW5QaWNrZXJQbHVnaW4uY2FsbCgkZWxlbWVudCwgZGF0YSlcclxuICAgIH0pXHJcbiAgfSlcclxuICBcclxufSkoIGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCApOyJdfQ==
