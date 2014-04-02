         $(document).on('magazineResize',function(e){
            var $side = $('#magazineSidebar'),
                $mag = $('#magazineBody');
            
            if ($side.offset().left !== $mag.offset().left) {
                $side.css('height','1px').css('height',$('#leftColumn').height());  
            }
            else {
                $side.css('height','100%');
            }
        });

         showMenu = function() {
             $me = this;
             $me.$menu   = $('#topMenu');
             $me.next    = 1;
             $me.last    = $('#topMenu').find('li').length;
             
             $me.firstNext = function () {
                 $me.next    = 1;
             }
              
             $me.lastNext = function () {
                 $me.next    = $me.last;
             }
             
             $me.click = function () {
                 if ($me.$menu.hasClass('active')) {
                     $me.firstNext();
                     $me.hideNext();
                 }
                 else {
                     $me.lastNext();
                     $me.showNext(); 
                 }
                 return;
             },
              
             $me.showNext = function () {
                 $obj = ($me.next > 0)?$me.$menu.find('li:nth-child('+$me.next+')'):null;
                 if ($me.next >= $me.last) {
                     $me.$menu.addClass('active');
                 }
                 if ($obj !== null && $obj.length > 0) {
                     $me.next--;
                     $obj.show('slide',{},200,$me.showNext);
                 }
                 return;
             },
                 
             $me.hideNext = function () {
                 $obj = ($me.next > 0)?$me.$menu.find('li:nth-child('+$me.next+')'):null;
                 if ($obj !== null && $obj.length > 0) {
                     $me.next++;
                     $obj.hide('blind',{},200,$me.hideNext);
                 }
                 if ($me.next > $me.last) {
                     $me.$menu.removeClass('active');
                 }
                 return;
             }
         }
         
         $('#menu').on('click',function(e){ 
             $.manageMagazine.goToPage(5);
             //var my = new showMenu();
             //my.click();
         });
         
         $('#topMenuIndex').on('click',function(e){
             $.manageMagazine.goToPage(5);
         });
        


        //$('#menu').on('click',function(e){ $('#topMenu').addClass('active').siblings().removeClass('active'); });
        //$('#topMenuIndex').on('click',function(e){ $('#index').addClass('active').siblings().removeClass('active'); });

        showMenu = function() {
            $me = this;
            $me.$index  = $('#index');
            $me.$menu   = $('#topMenu');
            $me.next    = 1;
            $me.last    = $('#topMenu').siblings().find('li').length;
            
            $me.firstNext = function () {
                $me.next    = 1;
            }
             
            $me.lastNext = function () {
                $me.next    = $me.last;
            }
             
            $me.showNext = function () {
                    $obj = ($me.next > 0)?$me.$index.find('li:nth-child('+$me.next+')'):null;
                    console.log($obj);
                    console.log($me.next);
                    if ($obj !== null && $obj.length > 0) {
                        $me.next--;
                        $obj.show('blind',{},200,$me.showNext);
                    }
                    return;
                },
                
            $me.hideNext = function () {
                    $obj = ($me.next > 0)?$me.$index.find('li:nth-child('+$me.next+')'):null;
                    console.log($obj);
                    console.log($me.next);
                    if ($obj !== null && $obj.length > 0) {
                        $me.next++;
                        $obj.hide('blind',{},200,$me.hideNext);
                    }
                    if ($me.next > $me.last) {
                        $me.$menu.siblings().hide();
                        $me.$menu.show();
                        $me.$menu.find('li').show('slide',{},1000,function(){});
                    }
                    return;
                }
        }
        
        $('#menu').on('click',function(e){ 
            var my = new showMenu();
            my.firstNext();
            my.hideNext();
/*             $('#index li').hide('slide',{},500,function(){
                $menu.siblings().hide();
                $menu.show('slide',{},1000,function(){});
            });
 */        });
        
        $('#topMenuIndex').on('click',function(e){
            //var my = new showMenu();
            //my.lastNext();
            //my.$index.siblings().hide('slide',{},500,function(){
                //my.$index.show();
                //my.showNext();
            //});
            $.manageMagazine.goToPage(5);
        });
