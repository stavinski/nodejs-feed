/**
 * jqMetro
 * JQUERY PLUGIN FOR METRO UI CONTROLS
 *
 * Copyright (c) 2011 Mohammad Valipour (http://manorey.net/mohblog)
 * Licensed under the MIT License:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 */

// ================= PIVOT CONTROL
; (function ($) {
    var defaults = {
        animationDuration: 500,
        headerOpacity: 0.5,
        fixedHeaders: false,
        animationEasing: "easeOutExpo",
        headerSelector: "h2",
        itemSelector: ".ui-pivot-item",
        itemsContainerSelector: ".ui-pivot-items",
        controlInitializedEventName: "controlInitialized",
        selectedItemChangedEventName: "selectedItemChanged"
    };

    $.fn.metroPivot = function (settings) {
        if(this.length != 1){ return this.each(function(index, el){ $(el).metroPivot(settings); }); }

        $.extend(this, defaults, settings);
        $.extend(this,{
            animating : false,
            currentIndex: 0,
            
            getHeader: function (item) { return item.find(this.headerSelector).first(); },
            getItems: function () { return this.find(this.itemSelector); },
            getItemsContainer: function () { return this.find(this.itemsContainerSelector); },
            getHeadersContainer: function () { return this.find(".ui-pivot-headers"); },
            goToNext: function(){ this.changeItem(this.getHeadersContainer().children(".current").next()); },
            goToPrevious: function(){ this.changeItem(this.getHeadersContainer().children().last(), true); },
            goToItemByName:function(header){ this.changeItem(this.getHeadersContainer().children(":contains("+header+")").first()); },
            goToItemByIndex:function(index){ this.changeItem(this.getHeadersContainer().children().filter("[index='"+index+"']")); },

            initialize : function () {
                var pivot = this;
                var myWidth = this.outerWidth();

                var headers = $("<div class='ui-pivot-headers' />").prependTo(this);

                this.getItems().each(function (index, el) {
                    el = $(el).attr("data-scroll", "y");

                    // set height
                    el.height(itemsHeight - (el.outerHeight() - el.height()));

                    // set width
                    el.width(myWidth - (el.outerWidth() - el.width()));

                    var headerElement = pivot.getHeader(el);
                    if (headerElement.length == 0) return;

                    var headerItem = $("<span class='ui-pivot-header' />").html(headerElement.html()).fadeTo(0, pivot.headerOpacity);

                    if (index == 0) {
                        headerItem.addClass("current").fadeTo(0, 1);
                        el.addClass("current");
                    }
                    else { el.hide(); }

                    headerItem.attr("index", index).click(function() { pivot.changeItem($(this)); }).appendTo(headers);
                    headerElement.remove();
                });

                // set height: must be done after first .each() because headers are set there
                var itemsHeight = this.parent().height() - this.getItemsContainer().position().top;
                this.getItems().each(function (index, el) {
                    el = $(el);
                    el.height(itemsHeight - (el.outerHeight() - el.height()));
                });


                // enable swipe
                this.hammer().on("swiperight", function() { pivot.goToPrevious(); });
                this.hammer().on("swipeleft", function() { pivot.goToNext(); });

                this.data("controller", pivot);
                this.trigger(this.controlInitializedEventName);
            },
            setCurrentHeader: function(header, goLeft){
                var pivot = this;

                // make current header a normal one
                this.getHeadersContainer().children(".current").removeClass("current").fadeTo(0, this.headerOpacity);

                // make selected header to current
                header.addClass("current").fadeTo(0, 1);

                if(pivot.fixedHeaders == false)
                {
                    var container = pivot.getHeadersContainer();
                    if(goLeft){
                        container.css({marginLeft:-header.width()}).prepend(header).animate({marginLeft: 0}, pivot.animationDuration, pivot.animationEasing)
                    }
                    else{
                        container.animate({marginLeft: -header.position().left}, pivot.animationDuration, pivot.animationEasing, function(){
                            container.css({marginLeft: 0}).append(header.prevAll().hide().fadeIn("fast"));
                        })
                    }
                }
            },
            setCurrentItem: function(item, goLeft){
                var pivot = this;
                
                // hide current item immediately
                this.getItems().filter(".current").hide().removeClass("current");

                // after a little delay
                setTimeout(function () {
                    // move the item to far right and make it visible
                    item.css({ left: item.outerWidth() * (goLeft ? -1 : 1) }).show().addClass("current");

                    // animate it to left
                    item.animate( { left: 0 }, pivot.animationDuration, pivot.animationEasing, function() { pivot.onSelectedItemChanged();});

                }, 200);                
            },
            onSelectedItemChanged: function() {
                this.animating = false;
                this.trigger(this.selectedItemChangedEventName);
            },
            changeItem: function(header, goLeft){
                // ignore if already current
                if (header.is(".current")) return;

                // ignore if still animating
                if (this.animating) return;
                this.animating = true;

                // set current header
                this.setCurrentHeader(header, goLeft);

                var index = header.attr("index");
                // find and set current item
                var item = this.getItems().eq(index);
                this.setCurrentItem(item, goLeft);
            }
        });

        return this.initialize();
    };
})(jQuery);