/*
 * This plugin Manage the magazine
 * 
 * images url in data-src to lazy loading
 */


(function($, window, document) {
    var $window     = $(window),
        $document   = $(document),
        $magazine   = null,
        totalPages  = 0,
        magRatio    = 2/3, //2/3, //4/3,
        timerFlipMs = 2000,
        firstLeafNo = false,
        lastLeafNo  = false,
        contentPage = false;
   
    // element function
    $.fn.magazine = function(options) {
        var $this       = $(this),
            $imageHolder= null,
            page        = 0,
            $lastLeaf   = null,
            $frontCover = false,
            $backCover  = false,
            $contentPage= false,
            settings    = {
                container       : $('body'),         //container for the magazine
                load            : true,              //load the images and trigger a loadpage event to children
                unload          : false,              //unload the images and trigger a unloadpage event to children
                contentMarkup    : {
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
                                            '<div id="imageHolder">'+
                                                '<div id="magazineHolder">'+
                                                    '<div id="magazine"></div>'+
                                                '</div>'+
                                            '</div>'+
                                        '</div>'+
                                    '</section>');
            $magazine = $('#magazine');
            $imageHolder = $('#imageHolder');
        }

        function createLeaf() {
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
                                '<div class="left_page_rotator">' +
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
                                '<div class="flip_corner" style="z-index:'+ (index+2) +'"></div>' +
                           '</div>',
                    $leaf = $(html);
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
                            $page.data('title',(title?title:'Page '+$page.data('page')));
                            $page.data('image',image);
                            $page.data('type',type);
                            if ($p.length > 0) {
                                $page.prepend($p);
                            }
                            page++;
                            break;
                case 'r' :  $page = $leaf.find('.right_page');
                            $page.data('title',(title?title:'Page '+$page.data('page')));
                            $page.data('image',image);
                            $page.data('type',type);
                            if ($p.length > 0) {
                                $page.prepend($p);
                            }
                            page++;
                            break;
                case 'b' :  $page = $leaf.find('.left_page');
                            $page.data('title',(title?title+' 1':'Page '+$page.data('page')));
                            $page.data('image',image);
                            $page.data('type',type);
                            if ($p.length > 0) {
                                $page.prepend($p);
                            }
                            page++;
                            $page = $rleaf.find('.right_page');
                            $page.data('title',(title?title+' 2':'Page '+$page.data('page')));
                            $page.data('image',image);
                            $page.data('type',type);
                            if ($p.length > 0) {
                                $page.prepend($p.clone());
                            }
                            page++;
                            break;
            }
        }
        
        function followMouse (e, $page) {
//          $(document).off('mousemove.flip_page')
//          .on('mousemove.flip_page', function(e){
//              followMouse(e,$obj);
//          });
               $page.find('.right_page_holder').css('overflow','hidden');
                $page.find('.left_page_holder').show();
//                $page.find('.left_page_rotator')
//                    .css('transform' , 'translate('+e.pageX+','+e.pageY+')')
//                    .css('-ms-transform' , 'translate('+e.pageX+','+e.pageY+')')
//                    .css('webkit-transform' , 'translate('+e.pageX+','+e.pageY+')');
//                $page.find('.left_page')
//                    .css('transform' , 'translate('+e.pageX+','+e.pageY+')')
//                    .css('-ms-transform' , 'translate('+e.pageX+','+e.pageY+')')
//                    .css('webkit-transform' , 'translate('+e.pageX+','+e.pageY+')');
               $page.find('.left_page_rotator').animate({
                        'transform' : 'translate('+e.pageX+','+e.pageY+')',
                        '-ms-transform' : 'translate('+e.pageX+','+e.pageY+')',
                        'webkit-transform' : 'translate('+e.pageX+','+e.pageY+')'},1);
                $page.find('.left_page').animate({
                    'transform' : 'translate('+e.pageX+','+e.pageY+')',
                    '-ms-transform' : 'translate('+e.pageX+','+e.pageY+')',
                    'webkit-transform' : 'translate('+e.pageX+','+e.pageY+')'},1);

//                .rp_shadow_rotator {
//                   .flip(0, 0, 0deg, -0, 0); 
//                }
//                .rp_shadow_gradient {
//                   width: @shadowWidth; 
//                }
//                .shadow_opacity {
//                   opacity: 0;
//                }
//                .shadow_rotator {
//                    .flip((-1*@lpShadowWidth), 0, 0deg, 0, 0);
//                }
//                .right_page_rotator {
//                   .flip((-1 * @flipZoneWidth),0, 0deg, 80%, 13%);
//                }
//                .right_page_holder > div.right_page {
//                    .flip(@flipZoneWidth, 0, 0deg, 3%, 0);
//                }
//               
//                // shows page 2
//                .left_page_rotator {
//                   .flip((-1 * @flipZoneWidth),0, 0deg, 80%, 13%);
//                 }
//                .left_page_holder > div.left_page {
//                   .flip((@flipZoneWidth - @magInWidth + 0.7%), 0, 0deg, 0, 0);
//                }
//                .flip_corner {
//                   .flip(@flipLpRevShadowX, @flipLpRevShadowY, @flipDeg, 0, 0);
//                }
        }

        function bindFlip () {
            /* Show the corner fliped */
            $("#magazine .flip_corner").hover(function (e) {
                e.preventDefault();
                $(this).closest(".leaf").addClass("show_corner");
            },function (e) {
                e.preventDefault();
                $(this).closest(".leaf").removeClass("show_corner");
            });
            
            /* flip the page back or ford */
            $("#magazine .flip_corner").click(function (e) {
                if (typeof(e.pageX) !== 'undefined' && $.manageMagazine.isFlipping()) { return; }
                var $this = $(this),
                    $leaf = $this.closest(".leaf"),
                    leafNo = $leaf.data('leaf'),
                    right = !$leaf.hasClass("flip_left");

                if (typeof(e.pageX) !== 'undefined') { $.manageMagazine.flipOn($this); }
                $leaf.find('.right_page_rotator').css('z-index','initial');
                $leaf.css('z-index',$leaf.data("rightindex"));
                
                if (right) {
                    if (leafNo === firstLeafNo) { window.setTimeout($.manageMagazine.removeMyClass,timerFlipMs,$imageHolder,'finishBook','openBook'); }
                    if (leafNo === lastLeafNo) { $imageHolder.removeClass('openBook').addClass('finishBook'); }
                    if(typeof(e.pageX) !== 'undefined') { $.manageMagazine.loadPage($leaf.find('.left_page')); }
                    $leaf.addClass('show_page').addClass("flip_left");
                    window.setTimeout($.manageMagazine.changeIndex,timerFlipMs,$leaf,'l');
                }
                else {
                    if (leafNo === firstLeafNo) { $imageHolder.removeClass('openBook').removeClass('finishBook'); }
                    if (leafNo === lastLeafNo) { window.setTimeout($.manageMagazine.removeMyClass,timerFlipMs,$imageHolder,'finishBook','openBook'); }
                    if(typeof(e.pageX) !== 'undefined') { $.manageMagazine.loadPage($leaf.find('.right_page')); }
                    $leaf.removeClass('on_left').removeClass("flip_left");
                    window.setTimeout($.manageMagazine.removeMyClass,timerFlipMs,$leaf,'show_page');
                    window.setTimeout($.manageMagazine.changeIndex,timerFlipMs,$leaf,'r');
                }
                if (typeof(e.pageX) !== 'undefined') {window.setTimeout($.manageMagazine.flipOff,timerFlipMs);}
            });
            
            /* bind the loadpage event on the page*/
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
                        $(this).children().trigger('loadpage');
                    }
                });
            }
            
            /* bind the unloadpage event on the page*/
            if (settings.unload)
            {
                $magazine.find('div[data-page]').on('magUnloadPage.unloadPageImages',function(e){
                    if ($(this).attr('loaded') === 'yes')
                    {
                        $(this).find('img').each(function(){
                               $(this).attr('src','');
                        });
                        $(this).attr('loaded','no');
                        $(this).children().trigger('unloadpage');
                    }
                });
            }
        }
 
        function boundMagazine () {
            // Attache front cover and first blank leaf
            page = 0;
            $lastLeaf = createLeaf();
            firstLeafNo = $lastLeaf.data('leaf');
            if ($frontCover) {
                attachPage($frontCover.data('title','Cover'), $lastLeaf, 'r');
            }
            else {
                attachPage($('<div data-title="Cover" data-type="frontcover"></div>'), $lastLeaf, 'r');
            }
            attachPage($('<div data-title="" data-type="frontflap"></div>'), $lastLeaf, 'l');
            $lastLeaf.addClass('front_cover');
            
            // blank leaf
            $lastLeaf = createLeaf();
            attachPage($('<div data-title="" data-type="endpaper"></div>'), $lastLeaf, 'r');
            attachPage($('<div data-title="" data-type="endpaper"></div>'), $lastLeaf, 'l');

            // Content page
            $lastLeaf = createLeaf();
            attachPage($('<'+settings.contentMarkup.wrapperTag+' id="magazineIndex" data-title="content" data-type="content" class="'+settings.contentMarkup.wrapperClass+'">'+
                            '<'+settings.contentMarkup.titleTag+' class="'+settings.contentMarkup.titleClass+'">Content</'+settings.contentMarkup.titleTag+'>'+
                            '<'+settings.contentMarkup.groupTag+' class="'+settings.contentMarkup.groupClass+'"></'+settings.contentMarkup.groupTag+'>'+
                            '</'+settings.contentMarkup.wrapperTag+'>'), $lastLeaf, 'r');
            attachPage($('<div data-title="" data-type="endpaper"></div>'), $lastLeaf, 'l');
            $contentPage = $lastLeaf.find('#magazineIndex ul');
            contentPage = $lastLeaf.find('.right_page').data('page');
            
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

            // finish th book
            if ((page%2) !== 0) {
                attachPage($('<div data-title=""  data-type="endpaper"></div>'), $lastLeaf, 'l');
            }
            
            // last blank page
            $lastLeaf = createLeaf();
            attachPage($('<div data-title="" data-type="endpaper"></div>'), $lastLeaf, 'r');
            attachPage($('<div data-title="" data-type="endpaper"></div>'), $lastLeaf, 'l');

            // Back cover
            $lastLeaf = createLeaf();
            attachPage($('<div data-title="backflap" data-type="backflap"></div>'), $lastLeaf, 'r');
            if ($backCover) {
                $backCover.data('title','Back Cover');
                attachPage($backCover, $lastLeaf, 'l');
            }
            else {
                attachPage($('<div data-title="Back Cover" data-type="backcover"></div>'), $lastLeaf, 'l');
            }
            lastLeafNo = $lastLeaf.data('leaf');
            $lastLeaf.addClass('back_cover');

            // no show last page shadow
            var lastShadow = (lastLeafNo > 1)?lastLeafNo - 1:1;
            $("#magazine .leaf[data-leaf='"+lastShadow+"']").addClass('last_shadow');
        }
        
        function createContentPage () {
            // create an index
            var index = $.manageMagazine.getIndex();
            $.each(index, function(id, page) {
                var title = (page.title === 'Page '+page.pageNo)?'<span class="title"></span>':'<span class="title">'+ page.title +'</span>',
                    image = (page.image.length > 0)?'<img src="'+ page.image +'" class="img-rounded" alt="'+ page.title +'">':'';
                $contentPage.append('<'+settings.contentMarkup.itemTag+' class="'+settings.contentMarkup.itemClass+'"><a href="#" class="magazine_link" data-page="'+ page.pageNo +'">' + image + title +'<span class="pagenumber">'+ page.pageNo +'</span></a></'+settings.contentMarkup.itemTag+'>');
            });
            $contentPage.find('a.magazine_link').click(function(e){
                e.preventDefault();
                $.manageMagazine.goToPage($(this).data('page'));
            });
        }
        
        /* Work the magic */
        if (totalPages > 0) {
            totalPages += 10; //blank pages content and cover

            createMagazine();
            boundMagazine ();
            createContentPage ();
            
            // bind the corners with click function
            bindFlip ();
            
            // load images in page 1
            $.manageMagazine.loadPage(1);

            // bind window resize
            $window.resize(function(){ $.manageMagazine.getMagResize(settings.container); })      //call our function on window resize
            .on('orientationchange', function(){ $.manageMagazine.getMagResize(settings.container); })
            .resize();  //force a resize just to be sure 
        }
        else {
            $magazine = $('<div></div>');
        }
    };
    
    /* Convenience methods in jQuery namespace.  */
     $.manageMagazine = function () {
    
        var flipping        = false,
            $flip           = false,
            magHldMrgOut    = 10,   // Vertical margin
            magHldPctOut    = true, // Margin percentage  
            magHldMrgIn     = 0,    // Vertical margin
            magHldPctIn     = true, // Margin percentage  
            settings        = {
                loadThreshold :  2,
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
                rPage = $("#magazine .right_page[data-page='"+number+"']");
                lPage = $("#magazine .left_page[data-page='"+number+"']");
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
                rPage = $("#magazine .right_page[data-page='"+number+"']");
                lPage = $("#magazine .left_page[data-page='"+number+"']");
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
            var leaf,
                next,
                prev,
                id;
            
            number *= 1; // sure is a number
            timerMs = (typeof(timerMs) === 'undefined')?0:timerMs*1;
            level   = (typeof(level) === 'undefined')?0:level*1;

            if ((number < 1) || (number > totalPages)) {
                return timerMs;
            }
            
            var rPage = $("#magazine .right_page[data-page='"+number+"']"),
                lPage = $("#magazine .left_page[data-page='"+number+"']");
            
            // it is a right page
            if (rPage.length > 0) {
                leaf = rPage.closest(".leaf");
                
                if (level === 0) {
                    _loadPage(rPage);
                }
                
                // Flip the pages back till here
                if (leaf.hasClass("flip_left")) {
                    id     = leaf.data('leaf')*1 + 1;
                    next   = $("#magazine .leaf[data-leaf='"+id+"']");
                    if ((next.length > 0)  && next.hasClass("flip_left")) {
                        timerMs = _goToPage(number + 2,timerMs,level+1);
                    }
                    window.setTimeout($.manageMagazine.flipCorner,timerMs,leaf);
                    timerMs += timerFlipMs;
                }
                // Flip the pages till here
                else {
                    id      = leaf.data('leaf')*1 - 1;
                    prev    = $("#magazine .leaf[data-leaf='"+id+"']");
                    
                    if ((prev.length > 0) && !prev.hasClass("flip_left")) {
                        timerMs = _goToPage(number - 1,timerMs,level+1);
                    }
                }
            }
            // it is a left page
            else if (lPage.length > 0) {
                leaf = lPage.closest(".leaf");

                if (level === 0) { _loadPage(lPage); }
                
                // Flip the pages back till here
                if (leaf.hasClass("flip_left")) {
                    id      = leaf.data('leaf')*1 + 1;
                    next    = $("#magazine .leaf[data-leaf='"+id+"']");
                    
                    if ((next.length > 0) && next.hasClass("flip_left")) {
                        timerMs = _goToPage(number + 1,timerMs,level+1);
                    }
                }
                // Flip the pages till here
                else {
                    id      = leaf.data('leaf')*1 - 1;
                    prev    = $("#magazine .leaf[data-leaf='"+id+"']");

                    if ((prev.length > 0) && !prev.hasClass("flip_left")) {
                        timerMs = _goToPage(number - 2,timerMs,level+1);
                    }
                    window.setTimeout($.manageMagazine.flipCorner,timerMs,leaf);
                    leaf.addClass('show_page');
                    timerMs += timerFlipMs;
                }
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
            flipCorner : function ($page){
                $page.children(".flip_corner").click();
            },
            changeIndex : function ($obj,side) {
                if (side === 'l') {
                    $obj.css("z-index",$obj.data("leftindex"));
                    $obj.addClass('on_left');
                }
                else {
                    $obj.find('.right_page_rotator').css('z-index',$obj.data('rpageindex'));
                    $obj.css("z-index",$obj.data("rightindex"));
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
            
            getMagResize: function($container) {
                var  h = $window.height() - (magHldPctOut?($window.height() * magHldMrgOut / 100):magHldMrgOut) - (magHldPctIn?($window.height() * magHldMrgIn / 100):magHldMrgIn),
                     w = ($container.width() > 0)?$container.width():$window.width(),
                     wx = Math.round(h/magRatio) * 2,
                     wt = ((wx < w)?Math.round(wx * 100 / w):100);
               $('#viewZone').css('width',wt+'%');
               $document.trigger('magazineResize');
            }
        };
    }();
   
})(jQuery, window, document);


