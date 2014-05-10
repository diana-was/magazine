/*
 * This plugin Manage the magazine
 * Author: Diana De Vargas Soler
 * Author URI: 
 * Version: 1.0
 * images url in data-src to lazy loading
 */


(function($, window, document) {
    var $window     = $(window),
        $document   = $(document),
        $magazine   = null,
        totalPages  = 0,
        magRatio    = 2/3, //2/3, //4/3,
        timerFlipMs = 2005,
        firstLeafNo = false,
        lastLeafNo  = false,
        contentPage = false,
        $contentHolder = false,
        scrollEvents=["DOMMouseScroll","mousewheel"];
    
    /*
     *  This scrollElement method is from mousewheel plugin by Brandon Aaron (http://brandonaaron.net)
     */  
    function scrollElement(event){
        var orgEvent = event || window.event, args = [].slice.call( arguments, 1 ), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
        event = $.event.fix(orgEvent);
        event.type = "mousewheel";
       
        // Old school scrollwheel delta
        if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta/120; }
        if ( orgEvent.detail ) { delta = -orgEvent.detail/3; }
       
        // New school multidimensional scroll (touchpads) deltas
        deltaY = delta;
       
        // Gecko
        if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
           deltaY = 0;
           deltaX = -1*delta;
        }
       
        // Webkit
        if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY/120; }
        if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = -1*orgEvent.wheelDeltaX/120; }
       
        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);
       
        return ($.event.dispatch || $.event.handle).apply(this, args);
    }

    $.event.special.mousewheel = {
        setup   :function(){
                    if(this.addEventListener){
                        for(var d=scrollEvents.length;d;){
                            this.addEventListener(scrollEvents[--d],scrollElement,false);
                        }
                    }
                    else{
                        this.onmousewheel=scrollElement;
                    }
                },
        teardown:function(){
                    if(this.removeEventListener){
                        for(var d=scrollEvents.length;d;){
                            this.removeEventListener(scrollEvents[--d],scrollElement,false);
                        }
                    }
                    else{
                        this.onmousewheel=null;
                    }
                }
    };
    
    $.fn.extend({
        mousewheel:function(d){
                        return d?this.bind("mousewheel",d):this.trigger("mousewheel");
                    },
        unmousewheel:function(d){
                        return this.unbind("mousewheel",d);
                    }
    });
    
    /*
     * Scroll in the Element and stop the body element scrolling
     */  
    $.fn.scrollThisElement = function () {
        this
            .off('mousewheel.scrollThisElement DOMMouseScroll.scrollThisElement')
            .on('mousewheel.scrollThisElement DOMMouseScroll.scrollThisElement', function(event, delta, deltaX, deltaY) {
                var nativeEvent = (typeof delta === 'undefined');
                if (nativeEvent) {
                    var delta = event.originalEvent.wheelDelta || -event.originalEvent.detail;
                }
                else {
                    var scrollTop = $(this).scrollTop();
                    $(this).scrollTop(scrollTop-Math.round(delta * 20));
                }
                
                // Detail to hide content overflow
                if ($(this).data('page') === contentPage) {
                    var h = Math.round($contentHolder.height()*1/100 + 1);
                    if ($(this).scrollTop() > h) {
                        if ($(this).scrollTop() >= this.scrollHeight - $(this).innerHeight()) {
                            $(this).css('border-top-width',h+'px').css('border-bottom-width',h+'px'); // for firefox
                        } else {
                            $(this).css('border-top-width',h+'px').css('border-bottom-width',h+'px');
                        }
                    }
                    else {
                        $(this).css('border-top-width','0').css('border-bottom-width',h+'px');
                    }
                }

                // Prevent scrolling the body
                if (nativeEvent) {
                    if (delta < 0 && $(this).scrollTop() >= this.scrollHeight - $(this).innerHeight()) {
                        event.preventDefault();
                        return;
                    }
                }
                else {
                    event.preventDefault();
                }
                return true;
            });

        this
            .off('keydown.scrollThisElement')
            .on('keydown.scrollThisElement', function (e) {
                if ((e.which === 40) && $(this).scrollTop() >= this.scrollHeight - $(this).innerHeight()) {  // Down 
                    e.preventDefault();
                    return;
                }
                if (e.which === 106) {  // home 
                    alert('Hi there');
                    return true;
                }
                return true;
                });
    };

    $.fn.scrollParent = function () {
        this.off('mousewheel.scrollThisElement DOMMouseScroll.scrollThisElement');
        this.off('keydown.scrollThisElement');
    };
 
    /*
     * This is the main plugin : this generates the Magazine
     */
    $.fn.magazine = function(options) {
        var $this       = $(this),
            page        = 0,
            $lastLeaf   = null,
            $frontCover = false,
            $backCover  = false,
            $contentIndex= false,
            $contentPage = false,
            settings    = {
                container       : $('body'),         //container for the magazine
                load            : false,             //load the images and trigger a loadpage event to children
                unload          : false,             //unload the images and trigger a unloadpage event to children
                hardcover       : true,
                contentMarkup   : {
                    titleTag    : 'h2',
                    titleClass  : '',
                    wrapperTag  : 'div',
                    wrapperClass: '',
                    groupTag    : 'ul',
                    groupClass  : 'stacked',
                    itemTag     : 'li',
                    itemClass   : ''
                }
            };

        // Update the options
        if (options) {
            settings = $.extend(settings, options);
        }
        
        $this.each(function() {
            
            switch ($(this).data('type')) {
                case 'frontcover' :
                                $frontCover = $(this).detach();
                                break;
                case 'backcover' :
                                $backCover = $(this).detach();
                                break;
                case 'double' :
                                totalPages+=((totalPages%2) === 0)?2:3;
                                break;
                default       :
                                totalPages++;
                                break;
            }
        });
        
        function createMagazine() {
            settings.container.append('<section id="viewZone">'+
                                        '<div id="magazineDesk" class="desk">'+
                                            '<div class="magazine_help">Click on the top (right/left) corner to flip the page</div>'+
                                            '<div id="innerHolder">'+
                                                '<div id="magazineHolder">'+
                                                    '<div id="magazine" class="'+(settings.hardcover?'book':'soft')+'"></div>'+
                                                '</div>'+
                                            '</div>'+
                                        '</div>'+
                                    '</section>');
            $magazine = $('#magazine');
        }

        function createLeaf(coverClass) {
            var isPage = (typeof coverClass === 'undefined')?true:false;
            coverClass = (typeof coverClass === 'undefined')?'':coverClass;
            if ($magazine !== null)
            {
                var leaf    = $('#magazine .leaf').length + 1,
                    lindex  = leaf * 10,
                    pages   = (leaf-1) * 2 + 1,
                    index   = (totalPages * 10) - (leaf * 10),
                    html    = '<div class="leaf" data-leaf="'+ leaf +'" style="z-index:'+ index +'" data-leftindex="'+ lindex +'" data-rightindex="'+ index +'" data-rpageindex="'+ (index+1) +'">' +
                               '<div class="right_page_rotator" style="z-index:'+ (index+1) +'">' +
                                    '<div class="right_page_holder">' +
                                        '<div class="right_page" data-page="'+ (pages) +'">' +
                                            '<div class="right_page_gradient"></div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="left_page_rotator" style="z-index:inherit">' + 
                                    '<div class="left_page_holder">' +
                                        '<div class="left_page" data-page="'+ (pages+1) +'">' +
                                            '<div class="left_page_gradient"></div>' +
                                       '</div>' +
                                    '</div>' +
                                '</div>' +
                                 '<div class="shadow_holder">' +
                                    '<div class="rp_shadow_rotator">' +
                                        '<div class="rp_shadow_gradient"></div>' +
                                    '</div>' +
                                    '<div class="shadow_rotator">' +
                                        '<div class="shadow_gradient shadow_opacity"></div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="flip_corner" style="z-index:'+ (index+3) +'"></div>' +
                           '</div>',
                   htmlCover = '<div class="leaf hard_cover '+ coverClass +'" data-leaf="'+ leaf +'" style="z-index:'+ index +'" data-leftindex="'+ lindex +'" data-rightindex="'+ index +'">' +
                                '<div class="hard_cover_rotator">' +
                                    '<div class="right_cover_holder" style="z-index:inherit">' +
                                        '<div class="right_page" data-page="'+ (pages) +'">' +
                                            '<div class="right_page_gradient"></div>' +
                                        '</div>' +
                                        '<div class="flip_corner" style="z-index:"z-index:inherit"></div>' +
                                    '</div>' +
                                    '<div class="left_cover_holder" style="z-index:inherit">' +
                                        '<div class="left_page" data-page="'+ (pages+1) +'">' +
                                            '<div class="left_page_gradient"></div>' +
                                       '</div>' +
                                       '<div class="flip_corner" style="z-index:"z-index:inherit"></div>' +
                                    '</div>' +
                                '</div>'+
                       '</div>',
                    $leaf = isPage?$(html):$(htmlCover);
                $magazine.append($leaf);
                return $leaf;
            }
        }
 
        function attachPage($obj, $leaf, side, $rleaf) {
            var $p    = ($obj.length > 0)?$obj.detach():'',
                title = ($p.length > 0)?$p.data('title'):'',
                image = ($p.length > 0)?$p.data('image'):'',
                type  = ($p.length > 0)?$p.data('type'):'',
                $page;

            title = (typeof title === 'undefined' || title === false || title.length === 0 )?'':title;
            image = (typeof image === 'undefined' || image === false || image.length === 0 )?'':image;
            switch (side)
            {
                case 'l' :  $page = $leaf.find('.left_page');
                            $page.data('title',(title?title:'Page '+$page.data('page')))
                                .data('image',image)
                                .data('type',type);
                            if ($p.length > 0) {
                                $page.prepend($p);
                            }
                            page++;
                            break;
                case 'r' :  $page = $leaf.find('.right_page');
                            $page.data('title',(title?title:'Page '+$page.data('page')))
                                .data('image',image)
                                .data('type',type);
                            if ($p.length > 0) {
                                $page.prepend($p);
                            }
                            page++;
                            break;
                case 'b' :  $page = $leaf.find('.left_page');
                            $page.data('title',(title?title+' 1':'Page '+$page.data('page')))
                                .data('image',image)
                                .data('type',type);
                            if ($p.length > 0) {
                                $page.prepend($p);
                            }
                            page++;
                            $page = $rleaf.find('.right_page');
                            $page.data('title',(title?title+' 2':'Page '+$page.data('page')))
                                .data('image',image)
                                .data('type',type);
                            if ($p.length > 0) {
                                $page.prepend($p.clone());
                            }
                            page++;
                            break;
            }
        }
        
        function bindEvents () {
            /* Show the corner fliped */
            $magazine.find(".flip_corner").hover(function (e) {
                e.preventDefault();
                $(this).parent(".leaf").addClass("show_corner");
            },function (e) {
                e.preventDefault();
                $(this).parent(".leaf").removeClass("show_corner");
            });

            /* flip the page back or ford */
            $magazine.find(".flip_corner").click(function (e) {
                // If flip by mouse click and didn't finish turning page do nothing
                if (typeof(e.pageX) !== 'undefined' && $.manageMagazine.isFlipping()) { return; }
                
                // Start turning page
                var $this   = $(this),
                    $leaf   = $this.closest(".leaf"),
                    leafNo  = $leaf.data('leaf'),
                    right   = !$leaf.hasClass("flip_left");

                if (typeof(e.pageX) !== 'undefined') { $.manageMagazine.flipOn($this); }
                //$leaf.find('.right_page_rotator').css('z-index','initial');
                //$leaf.css('z-index',$leaf.data("rightindex"));
                $.manageMagazine.changeIndex($leaf,'f');
                
                if (right) {
                    $leaf.addClass("show_page flip_left");
                    if(typeof(e.pageX) !== 'undefined') { $.manageMagazine.loadPage($leaf.find('.left_page')); }
                    window.setTimeout($.manageMagazine.changeIndex,timerFlipMs,$leaf,'l');
                }
                else {
                    if(typeof(e.pageX) !== 'undefined') { $.manageMagazine.loadPage($leaf.find('.right_page')); }
                    $leaf.removeClass("on_left flip_left");
                    window.setTimeout($.manageMagazine.changeIndex,timerFlipMs,$leaf,'r','show_page');
                }
                if (typeof(e.pageX) !== 'undefined') {window.setTimeout($.manageMagazine.flipOff,timerFlipMs);}
            });
            
            /* bind the loadpage event on the page */
            if (settings.load)
            {
                $magazine.find('div[data-page]').on('magLoadPage.loadPageImages',function(e){
                    if ($(this).attr('loaded') !== 'yes')
                    {
                        $(this).find('img').each(function(){
                            var url = $(this).data('src');
                            if (typeof url !== 'undefined' && url !== false) {
                                $(this).attr('src',url);
                            }
                        });
                        $(this).attr('loaded','yes');
                    }
                });
            }
            
            /* bind the unloadpage event on the page */
            if (settings.unload)
            {
                $magazine.find('div[data-page]').on('magUnloadPage.unloadPageImages',function(e){
                    if ($(this).attr('loaded') === 'yes')
                    {
                        $(this).find('img').each(function(){
                               $(this).attr('src','');
                        });
                        $(this).attr('loaded','no');
                    }
                });
            }
            
            $magazine.find('.left_page').scrollThisElement();
            $magazine.find('.right_page').scrollThisElement();
        }
 
        function boundMagazine () {
            // Attache front cover and first blank leaf
            page = 0;
            var $contentWraper = $( '<'+settings.contentMarkup.wrapperTag+' id="magazineIndex" data-title="content" data-type="content" class="'+settings.contentMarkup.wrapperClass+'">'+
                                '<'+settings.contentMarkup.titleTag+' class="'+settings.contentMarkup.titleClass+'">Content</'+settings.contentMarkup.titleTag+'>'+
                                '<'+settings.contentMarkup.groupTag+' class="'+settings.contentMarkup.groupClass+'"></'+settings.contentMarkup.groupTag+'>'+
                                '</'+settings.contentMarkup.wrapperTag+'>');
            
            if (settings.hardcover) {
                $lastLeaf = createLeaf('front_cover');
                firstLeafNo = $lastLeaf.data('leaf');
                if ($frontCover) {
                    attachPage($frontCover.data('title','Cover'), $lastLeaf, 'r');
                }
                else {
                    attachPage($('<div data-title="Cover" data-type="frontcover"></div>'), $lastLeaf, 'r');
                }
                attachPage($('<div data-title="" data-type="frontflap"></div>'), $lastLeaf, 'l');

                // blank leaf
                $lastLeaf = createLeaf();
                attachPage($('<div data-title="" data-type="endpaper"></div>'), $lastLeaf, 'r');
                attachPage($('<div data-title="" data-type="endpaper"></div>'), $lastLeaf, 'l');

                // Content page
                $lastLeaf = createLeaf();
                attachPage($contentWraper, $lastLeaf, 'r');
                attachPage($('<div data-title="" data-type="endpaper"></div>'), $lastLeaf, 'l');
                $contentPage    = $lastLeaf.find('.right_page');
            }
            else {
                $lastLeaf = createLeaf();
                firstLeafNo = $lastLeaf.data('leaf');
                if ($frontCover) {
                    attachPage($frontCover.data('title','Cover'), $lastLeaf, 'r');
                }
                else {
                    attachPage($('<div data-title="Cover" data-type="frontcover"></div>'), $lastLeaf, 'r');
                }

                // Content page
                attachPage($contentWraper, $lastLeaf, 'l');
                $contentPage    = $lastLeaf.find('.left_page');
            }
            contentPage     = $contentPage.data('page');
            $contentHolder  = $contentPage.parent();
            $contentIndex   = $contentPage.find('#magazineIndex '+settings.contentMarkup.groupTag);
            
            // Attache pages to magazine
            $this.each(function() {
                var $this = $(this),
                    double = $this.data('type') === 'double';

                if (($this.data('type') !== 'double') && ($this.data('type') !== 'single')) {
                    return;
                }
                
                /* Create a leaf and the right page */
                if (double) {
                    if ((page%2) === 0) {
                        $lastLeaf = createLeaf();
                        attachPage('', $lastLeaf, 'r');
                    }
                    var $rightLeaf = createLeaf();
                    attachPage($this, $lastLeaf, 'b', $rightLeaf);
                    $lastLeaf = $rightLeaf;
                }
                else {
                    if ((page%2) === 0) {
                        $lastLeaf = createLeaf();
                        attachPage($this, $lastLeaf, 'r');
                    }
                    else
                    {
                        attachPage($this, $lastLeaf, 'l');
                    }
                }
            });

            // finish the book
            if (settings.hardcover) {
                if ((page%2) !== 0) {
                    attachPage($('<div data-title=""  data-type="endpaper"></div>'), $lastLeaf, 'l');
                }
                
                // last blank page
                $lastLeaf = createLeaf();
                attachPage($('<div data-title="" data-type="endpaper"></div>'), $lastLeaf, 'r');
                attachPage($('<div data-title="" data-type="endpaper"></div>'), $lastLeaf, 'l');
    
                // Back cover
                $lastLeaf = createLeaf('back_cover');
                attachPage($('<div data-title="backflap" data-type="backflap"></div>'), $lastLeaf, 'r');
                if ($backCover) {
                    $backCover.data('title','Back Cover');
                    attachPage($backCover, $lastLeaf, 'l');
                }
                else {
                    attachPage($('<div data-title="Back Cover" data-type="backcover"></div>'), $lastLeaf, 'l');
                }
            }
            else {
                // Back cover
                if ($backCover) {
                    $backCover.data('title','Back Cover');
                }
                else {
                    $backCover = $('<div data-title="Back Cover" data-type="backcover"></div>');
                }

                if ((page%2) === 0) {
                    $lastLeaf = createLeaf();
                    attachPage($backCover.clone(), $lastLeaf, 'r');
                }
                attachPage($backCover, $lastLeaf, 'l');

            }
            lastLeafNo = $lastLeaf.data('leaf');

            // no show last page shadow
            var lastShadow = (lastLeafNo > 1)?lastLeafNo - 1:1;
            $magazine.find(".leaf[data-leaf='"+lastShadow+"']").addClass('last_shadow');
        }
        
        function createContentPage () {
            // create an index
            var index = $.manageMagazine.getIndex();
            $.each(index, function(id, page) {
                var title = (page.title === 'Page '+page.pageNo)?'<span class="title"></span>':'<span class="title">'+ page.title +'</span>',
                    image = (page.image.length > 0)?'<img src="'+ page.image +'" class="img-rounded" alt="'+ page.title +'">':'';
                $contentIndex.append('<'+settings.contentMarkup.itemTag+' class="'+settings.contentMarkup.itemClass+'"><a href="#" class="magazine_link" data-page="'+ page.pageNo +'">' + image + title +'<span class="pagenumber">'+ page.pageNo +'</span></a></'+settings.contentMarkup.itemTag+'>');
            });
            $contentIndex.find('a.magazine_link').click(function(e){
                e.preventDefault();
                $.manageMagazine.goToPage($(this).data('page'));
            });
        }
        
        /* Work the magic */
        totalPages += settings.hardcover?10:4; //blank pages content and cover

        createMagazine();
        boundMagazine ();
        createContentPage ();
        
        // bind the corners with click function and load events
        bindEvents ();
        
        // load images in page 1
        $.manageMagazine.loadPage(1);

        // bind window resize
        $window.resize(function(){ $.manageMagazine.magazineResize(settings.container); })      //call our function on window resize
        .on('orientationchange', function(){ $.manageMagazine.magazineResize(settings.container); })
        .resize();  //force a resize just to be sure 

        // finish 
        settings.container.trigger('magazineCreated');
    };
  
    
    /*
     *  This method manage the actions in the magazin
     *  like go to page, load a page, flip a page
     *  
     */
     $.manageMagazine = function () {
    
        var flipping        = false,
            $flip           = false,
            goingTo         = false,
            magHldMrgOut    = 10,   // Vertical margin
            magHldPctOut    = true, // Margin percentage  
            magHldMrgIn     = 0,    // Vertical margin
            magHldPctIn     = true, // Margin percentage  
            settings        = {
                loadThreshold :  20,
                magHldMrgOut : '10%', // Extenal margin
                magHldMrgIn  : '0%'  // Internal margin
            },
        
        // model of private functions
        _loadPage = function($page,level) {
            var rPage='',
                lPage='',
                number,
                min,
                max;
            level    = (typeof(level) === 'undefined')?0:level*1;

            if ((typeof($page) === 'object') && ($page !== null))
            {
                if ($page.hasClass('right_page')) { rPage = $page; }
                if ($page.hasClass('left_page')) { lPage = $page; }
                number = $page.data('page')*1; // sure is a number
            }
            else
            {
                number = $page*1; // sure is a number
                if ((number < 1) || (number > totalPages)) {
                    return;
                }
                rPage = $magazine.find(".right_page[data-page='"+number+"']");
                lPage = $magazine.find(".left_page[data-page='"+number+"']");
            }
            
            // it is a right page
            if (rPage.length > 0) {
                rPage.trigger('magLoadPage');
                if (level === 0) {// load the other pages
                    min = ((number - 1 - settings.loadThreshold)<1)?1:(number - 1 - settings.loadThreshold);
                    max = ((number + settings.loadThreshold) > totalPages)?totalPages:(number + settings.loadThreshold);
                }
            }
            // it is a left page
            else if (lPage.length > 0) {
                lPage.trigger('magLoadPage');
                if (level === 0) {// load the other pages
                    min = ((number - settings.loadThreshold)<1)?1:(number - settings.loadThreshold);
                    max = ((number + 1 + settings.loadThreshold) > totalPages)?totalPages:(number + 1 + settings.loadThreshold);
                }
            }
            
            
            // load and unload other pages
            if (((rPage.length > 0) || (lPage.length > 0)) && (level === 0))
            {
                var i;
                for (i = 1;i < number; i++)
                {
                    if (i < min) {
                        _unloadPage(i,++level);
                    }
                    else {
                        _loadPage(i,++level);
                    }
                }
                for (i = (number+1);i <= totalPages; i++)
                {
                    if (i <= max) {
                        _loadPage(i,++level);
                    }
                    else {
                        _unloadPage(i,++level);
                    }
                }
            }
        },
        
        _unloadPage = function($page,level) {
            var rPage='',lPage='',number;
            level    = (typeof(level) === 'undefined')?0:level*1;

            if ((typeof($page) === 'object') && ($page !== null))
            {
                if ($page.hasClass('right_page')) { rPage = $page; }
                if ($page.hasClass('left_page')) { lPage = $page; }
                number = $page.data('page')*1; // sure is a number
            }
            else
            {
                number = $page*1; // sure is a number
                if ((number < 1) || (number > totalPages)) {
                    return;
                }
                rPage = $magazine.find(".right_page[data-page='"+number+"']");
                lPage = $magazine.find(".left_page[data-page='"+number+"']");
            }
            
            // it is a right page
            if (rPage.length > 0) {
                rPage.trigger('magUnloadPage');
                if (level === 0) { _unloadPage(number-1,level+1); }
            }
            // it is a left page
            else if (lPage.length > 0) {
                lPage.trigger('magUnloadPage');
                if (level === 0) { _unloadPage(number+1,level+1); }
            }
        },
        
        _goToPage = function (number,timerMs,level) {
            var $leaf,
                $next,
                $prev,
                id,
                nextPage;
            
            // clean-up parameters
            number *= 1;
            timerMs = (typeof(timerMs) === 'undefined')?10:timerMs*1;
            level   = (typeof(level) === 'undefined')?0:level*1;

            if ((level === 0) && goingTo) {
                return;
            }
            
            if ((number < 1) || (number > totalPages)) {
                return timerMs;
            }
            goingTo = true;
            
            var rPage = $magazine.find(".right_page[data-page='"+number+"']"),
                lPage = $magazine.find(".left_page[data-page='"+number+"']"),
                right = (rPage.length > 0),
                $page = right?rPage:lPage;

            if ($page.length > 0) {
                $leaf = $page.closest(".leaf");
                
                if (level === 0) {
                    _loadPage($page);
                }
                
                // Page is on the left of the magazine. Flip the pages back till here
                if ($leaf.hasClass("flip_left")) {
                    id      = $leaf.data('leaf')*1 + 1;
                    $next   = $magazine.find(".leaf[data-leaf='"+id+"']");
                    
                    //if the next page is fliped on top we need to flip it
                    if (($next.length > 0)  && $next.hasClass("flip_left")) {
                        nextPage= right?number + 2:number + 1;
                        timerMs = _goToPage(nextPage,timerMs,level+1);
                    }
                    
                    //if it is a right page we need to flip the page to see it
                    if (right) {
                        window.setTimeout($.manageMagazine.flipCorner,timerMs,$leaf);
                        timerMs += timerFlipMs+5;
                    }
                }
                // Page is on the right of the magazine. Flip the pages till here
                else {
                    id      = $leaf.data('leaf')*1 - 1;
                    $prev    = $magazine.find(".leaf[data-leaf='"+id+"']");
                    
                    // if the previous page is on top we need to flip it
                    if (($prev.length > 0) && !$prev.hasClass("flip_left")) {
                        nextPage= right?number - 1:number - 2;
                        timerMs = _goToPage(number - 1,timerMs,level+1);
                    }
                    //if it is a left page we need to flip the page to see it
                    if (!right) {
                        $leaf.addClass('show_page');
                        window.setTimeout($.manageMagazine.flipCorner,timerMs,$leaf);
                        timerMs += timerFlipMs+5;
                    }
                }
            }
            if (level === 0) {
                window.setTimeout($.manageMagazine.goingEnd,timerMs);
            }
            return timerMs;
        },

        _getIndex = function() {
            var index = [],
                i = 0,
                noIndexed = ['content','frontflap','backflap','endpaper'];
            if ($magazine !== null) {
                $magazine.find('div[data-page]').each(function(){
                    var $this = $(this);
                    if ((noIndexed.indexOf($this.data('type')) === -1) && ($this.data('page') <= totalPages)) {
                        index[i] = {
                            title : $this.data('title'),
                            pageNo : $this.data('page'),
                            image : $this.data('image')
                        };
                        i++;
                    }
                });
            }
            return index;
        };
        
        return {
            //main function to initiate the module
            init: function (options) {
                settings = $.extend(settings, options);
                magHldMrgOut = parseInt(settings.magHldMrgOut);
                magHldPctOut = settings.magHldMrgOut.indexOf('%') !== -1;
                magHldMrgIn  = parseInt(settings.magHldMrgIn);
                magHldPctIn  = settings.magHldMrgIn.indexOf('%') !== -1;
            },
            
            goingEnd : function() {
                goingTo = false;
            },

            isFlipping : function() {
                return     flipping;
            },
            
            flipOn : function($obj) {
                $flip = $obj.addClass('active');
                flipping = true;
            },
            
            flipOff : function() {
                $flip.removeClass('active');
                flipping = false;
            },
            
            loadPage : function(number,level) {
                _loadPage(number,level);
            },
            
            unloadPage : function(number,level) {
                _unloadPage(number,level);
            },
            
            flipCorner : function ($leaf){
                if ($leaf.hasClass("hard_cover")) {
                    $leaf.find(".right_cover_holder").children(".flip_corner").click();
                }
                else {
                    $leaf.children(".flip_corner").click();
                }
            },
            
            /**
             * $obj : html obj
             * side : r,l or f
             */
            changeIndex : function ($obj,side,myClass) {
                if (typeof myClass !== 'undefined') {
                    $.manageMagazine.removeMyClass($obj,myClass);
                }

                var index = (side === 'l')?$obj.data("leftindex"):$obj.data('rightindex');
                if (!$obj.hasClass("hard_cover")) {
                    $obj.children(".flip_corner").css('z-index',index+3);
                }
                $obj.css("z-index",index);

                if (side === 'l') {
                    $obj.addClass('on_left');
                }
                
                if ($obj.hasClass('hard_cover')) {
                    return;
                }

                // Change page 
                if (side === 'f') {
                    $obj.children('.right_page_rotator').css('z-index',index+1);
                    $obj.children('.left_page_rotator').css('z-index',index+2);
                }
                else if (side === 'l') {
                    $obj.children('.right_page_rotator').css('z-index','inherit');
                    $obj.children('.left_page_rotator').css('z-index','inherit');
                }
                else {
                    $obj.children('.right_page_rotator').css('z-index',index+1);
                    $obj.children('.left_page_rotator').css('z-index','inherit');
                }
            },
            
            removeMyClass : function ($obj,myClass,addClass) {
                $obj.removeClass(myClass);
                if (typeof addClass !== 'undefined') {
                    $obj.addClass(addClass);
                }
            },
            
            goToPage : function (number,time,level) {
                return _goToPage(number,time,level);
            },
            
            goToContentPage : function () {
                _goToPage(contentPage);
            },
            
            getIndex: function() {
                return _getIndex();
            },
            
            magazineResize: function($container) {
                var  h = $window.height() - (magHldPctOut?($window.height() * magHldMrgOut / 100):magHldMrgOut) - (magHldPctIn?($window.height() * magHldMrgIn / 100):magHldMrgIn),
                     w = ($container.width() > 0)?$container.width():$window.width(),
                     wx = Math.round(h/magRatio) * 2,
                     wt = ((wx < w)?Math.round(wx * 100 / w):100);
               $('#viewZone').css('width',wt+'%');

               // detail in the scrolling pages
               $magazine.find("[data-page='"+contentPage+"']").scrollTop(0).css('border-top-width','0').css('border-bottom-width',Math.round($contentHolder.height()*1/100 + 1)+'px');

               $document.trigger('magazineResizeFinish');
            }
        };
    }();
   
})(jQuery, window, document);


