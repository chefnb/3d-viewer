


//*************
//  CLASS: Switch2way

//  2-way switch UI element
//  Author: Nick Braun, 2011

function Switch2way(canvas,handle_id,updateFunc){
 
  //  equation of motion vars for spring action

      var x0;          // base position
      var x;            // dynamic position      
      var velx=0;
      var mass=2.0;       // mass 
      var k =1.0;           // spring constant 
      var damp=0.8;       // damping 
      var s;              // bounding box dimension (hard wall constraint)
      var grabX ;   // initial grab mousedown coords
  
      var xLeft
      var xRight

      var frameInterval=20;   // animation framerate period

      var isLooping=false;  
      var isGripped=false;

           
       var handle = canvas.getElementById(handle_id);
       
       s=parseFloat(handle.getAttribute('width'));
       xLeft=parseFloat(handle.getAttribute('x'));   // set posn + dimensions 
       xRight=parseFloat(handle.getAttribute('x'))+s;   // set posn + dimensions 
      
       x0=xRight;
       x=x0

       canvas.documentElement.appendChild(handle);   
      
        
      
      function loop(){      // animation loop
        if (!isLooping) return;
       
        // iterate the equation of motion 

       
        velx = damp * (velx - k* (x-x0)/mass);  x+= velx;

        updateCanvas();

        // when released handle's kinetic energy has dissipated, stop animating

        if (velx*velx<1e-2) isLooping=false;  

        setTimeout(loop, frameInterval);

       }


      function updateCanvas(){  // update handle's drawing position with current x

        handle.setAttributeNS(null, 'x', ''+x);
              
       }


      this.grip = function(evt){   
       
        isGripped=true;
        isLooping=false;
        grabX=evt.clientX;
       
      }


      this.drag = function(evt){    // joystick dragged
      
        if (!isGripped) return;

   // observe bounding box constraint

      //   dX=(evt.clientX-grabX);
       //  x=Math.min(Math.max(x0+dX,xLeft-0.5*s),xRight+0.5*s);        

       x=  (x=x0+evt.clientX-grabX) < xLeft- s/2 ? xLeft-s/2: x > xRight +s/2 ? xRight+s/2 :x
	    
        
         updateCanvas();          
      
      };


      this.released = function()  // joystick released
      {
         if (!isGripped) return
         isGripped=false;
         isLooping=true;
       
        x0 =  Math.abs(x-xRight)<Math.abs(x-xLeft) ? xRight : xLeft
       
         updateFunc(x0==xRight)

         loop(); 
      };


      this.toggle = function(state){
        x0 = state=='left'? xLeft:xRight
        handle.setAttributeNS(null, 'x', ''+x0);
        updateFunc(x0==xRight)
        }
  
}



  

//*************
//  CLASS: SLIDER

//  vertical slider UI element
//  Author: Nick Braun


function Slider(canvas,frame_id,handle_id,updateFunc){

      var isGripped=false
 
      var grabY   // mousedown coordinate
      var monitor // text reading 0-100
      var y       // the slider's dynamic coordinate
   
     var handle=canvas.getElementById(handle_id);

     // set dimensions 

       var sliderFrame= canvas.getElementById(frame_id)

     //  y0 is the center of the slider, s is the range about the center

      var   s=0.5*parseFloat(sliderFrame.getAttribute('height'));
      var   y0=parseFloat(sliderFrame.getAttribute('y'))+s-0.5*parseFloat(handle.getAttribute('height'));
         
         y=y0
       
         handle.setAttribute("y",y0);
   
         canvas.documentElement.appendChild(handle);   
      


         this.grip = function(evt) {  

            isGripped=true;
            grabY=evt.clientY-y;
      }


      this.drag= function(evt){
       
            if (!isGripped) return;
    
       // observe bounding box constraint
   
         
           y=  (y=evt.clientY-grabY) < y0-s ? y0-s: y > y0 +s ? y0+s :y
	

           handle.setAttribute("y",y);

           updateFunc(50*(1-(y-y0)/s))
       //  monitor.textContent=Math.round(50*(1-(y-y0)/s));
      }


      this.released=function(){
         isGripped=false;
      }

       this.setValue=function(val){

          y=y0+s*(1-val/50)
      
          handle.setAttribute("y",y);
          updateFunc(50*(1-(y-y0)/s))
       }

}

 


//*************
//  CLASS: HWHEEL 

// horizontal wheel UI element
// Author: Nick Braun

//  NB wheel drag dx triggers updateFunc(dx);

 function HWheel(canvas,id,updateFunc){

   
      var spokes = [];
      var nspokes=40;               // number of spokes
      var xpos,ypos,height,radius;  // wheel dimensions
         
      var isGripped=false;
 
      var grabX;   // mousedown coordinate
       
      var angle=0;  

      var T_PI=2*Math.PI;
     
      var svgns = "http://www.w3.org/2000/svg";
           

     // get dimensions from canvas.svg file

         var wheelFrame= canvas.getElementById(id)

         radius=0.5*parseFloat(wheelFrame.getAttribute('width'));   
         xpos=parseFloat(wheelFrame.getAttribute('x'))+radius;
         ypos=parseFloat(wheelFrame.getAttribute('y'));
         height=parseFloat(wheelFrame.getAttribute('height'));

     //  create spokes

        var spoke_angle,h,i;

          for(  i = 0; i <= nspokes-1; i++ ) {
        
              spoke_angle= angle+ i*T_PI/nspokes;
         
              h=radius*Math.sin(spoke_angle);    // projected spoke displacement
    
              spokes[i]=canvas.createElementNS(svgns,"rect");
              spokes[i].setAttribute("height",height);
              spokes[i].setAttribute("width",2);
              spokes[i].setAttribute("x",xpos+h);
              spokes[i].setAttribute("y",ypos);

              spokes[i].setAttributeNS(null, "fill", "#336");

                // stop spoke interfering with mousedown 
              spokes[i].setAttributeNS(null, "pointer-events", "none"); 

             canvas.documentElement.appendChild(spokes[i]);

          // only the front projection of the dial should be visible
         
             if (Math.cos(spoke_angle)<0) 
                  spokes[i].setAttributeNS(null, "display", "none");
      }


      
      function update(){

         if (angle>T_PI) angle-=T_PI;
         if (angle<0) angle+=T_PI;
      
         for(  i = 0; i <= nspokes-1; i++ ) {
        
             spoke_angle= angle+ i*T_PI/nspokes;
              h=radius*Math.sin(spoke_angle); 
    
             spokes[i].setAttribute("x",xpos+h);
            
             if (Math.cos(spoke_angle)<0) spokes[i].setAttributeNS(null, "display", "none");
                else spokes[i].setAttributeNS(null, "display", "inline");
          }
    }


      this.grip= function (evt) {  


            isGripped=true;
            grabX=evt.clientX;
         
      }


      this.drag = function (evt){

        if (!isGripped) return;

      
         dx=evt.clientX-grabX;   // handle to center vector
         angle+=dx*1e-2;
         grabX=evt.clientX;         

        updateFunc(dx)


         update();          

      };


      this.released = function(){
         isGripped=false;
      }



}

//*************
//  CLASS: VWHEEL 

// vertical wheel UI element
// Author: Nick Braun

 function VWheel(canvas,id,updateFunc){
    
   
      var spokes = [];
      var nspokes=40;               // number of spokes
      var xpos,ypos,height,radius;  // wheel dimensions
         
      var isGripped=false;
      var grabY;   // mousedown coordinate
      var angle=0;  

      var T_PI=2*Math.PI;
      var svgns = "http://www.w3.org/2000/svg";

 // constructor

     // get dimensions from canvas.svg file

         var wheelFrame= canvas.getElementById(id)

         radius=0.5*parseFloat(wheelFrame.getAttribute('height'));   
         xpos=parseFloat(wheelFrame.getAttribute('x'));
         ypos=parseFloat(wheelFrame.getAttribute('y'))+radius;
         height=parseFloat(wheelFrame.getAttribute('width'));

     //  create spokes

        var spoke_angle,h,i;

          for(  i = 0; i <= nspokes-1; i++ ) {
        
              spoke_angle= angle+ i*T_PI/nspokes;
         
              h=radius*Math.sin(spoke_angle);    // projected spoke displacement
    
              spokes[i]=canvas.createElementNS(svgns,"rect");
              spokes[i].setAttribute("height",2);
              spokes[i].setAttribute("width",height);
              spokes[i].setAttribute("x",xpos);
              spokes[i].setAttribute("y",ypos+h);

              spokes[i].setAttributeNS(null, "fill", "#224");

           // stop spoke interfering with mousedown 
              spokes[i].setAttributeNS(null, "pointer-events", "none"); 

             canvas.documentElement.appendChild(spokes[i]);

          // only the front projection of the dial should be visible
         
             if (Math.cos(spoke_angle)<0) 
                  spokes[i].setAttributeNS(null, "display", "none");
      }


      
      function update(){

         if (angle>T_PI) angle-=T_PI;
         if (angle<0) angle+=T_PI;
      
         for(  i = 0; i <= nspokes-1; i++ ) {
        
             spoke_angle= angle+ i*T_PI/nspokes;
              h=radius*Math.sin(spoke_angle); 
    
             spokes[i].setAttribute("y",ypos+h);
            
             if (Math.cos(spoke_angle)<0) spokes[i].setAttributeNS(null, "display", "none");
                else spokes[i].setAttributeNS(null, "display", "inline");
          }
    }


      this.grip= function (evt) {  


            isGripped=true;
            grabY=evt.clientY;
         
      }


      this.drag = function (evt){

        if (!isGripped) return;

      
         dy=evt.clientY-grabY;   // handle to center vector
         angle+=dy*1e-2;
         grabY=evt.clientY;         

         updateFunc(-dy);
         update();          

      };


      this.released = function(){
         isGripped=false;
      }

}


//*******************************
//  CLASS: Joystick1D
//
//  horizontal joystick UI element; SVG/Javascript
//  Author: Nick Braun, 2011


function Joystick1D(canvas,handle_id,updateFunc){


  //  equation of motion vars for spring action

      var x0;          // base position
      var x;            // dynamic position      
      var dX;         // displacement vector
      var velx=0;
      var mass=1.0;       // mass 
      var k =1;           // spring constant 
      var damp=0.7;       // damping 


      var s;              // bounding box dimension (hard wall constraint)
      var grabX ;   // initial grab mousedown coords

      var frameInterval=20;   // animation framerate period

      var isReleasing=false;  
      var isGripped=false;

      var handle;    // the SVG element

            
       handle = canvas.getElementById(handle_id);
       
       x=parseFloat(handle.getAttribute('x'));   // set dimensions 
       s=parseFloat(handle.getAttribute('width'));
     
       x0=x;
        
        canvas.documentElement.appendChild(handle);   
      
      
     function gripLoop(){       // transmitting handle state
         if (!isGripped) return
         updateFunc(x-x0)
         setTimeout(gripLoop, frameInterval); 

        }


    function releaseLoop(){      //  mechanical animation
      
        if (!isReleasing) return;
       
        // iterate the equation of motion 

        velx = damp * (velx - k* (x-x0)/mass);  x+= velx;

        updateCanvas();

        // when released handle's kinetic energy has dissipated, stop animating

        if (velx*velx<1e-2) isReleasing=false;  

        setTimeout(releaseLoop, frameInterval);

       }


      function updateCanvas(){  // update handle's drawing position with current x,y

        handle.setAttributeNS(null, 'x', ''+x);
              
       }


      this.grip = function(evt){   
       
        isGripped=true;
        isReleasing=false;
        grabX=evt.clientX;
       
        gripLoop()
       

      }


      this.drag = function(evt){   
      
        if (!isGripped) return;

         dX=(evt.clientX-grabX);
       
       // observe bounding box constraint
         
         x=  (x=x0+dX)< x0-s ? x0-s: x > x0 +s ? x0+s :x

         updateCanvas();     
      };


      this.released = function()  
      {
         if (!isGripped) return

         isGripped=false;
         isReleasing=true;
         dX=0;  
         releaseLoop(); 
      };

}
 


 function Testcard(canvas,id,aBoolean){  // boolean controls whether display attribute is 'inline' or 'none'

  var element = canvas.getElementById(id);
     

  this.toggle = function(show){

     show ? element.setAttributeNS(null,'display','inline'): element.setAttributeNS(null,'display','none');
     canvas.documentElement.appendChild(element)
      }

   this.toggle(aBoolean)         

}
  


     

    
