/* global jQuery */
/* global require */

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