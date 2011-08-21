/*     

 Lambertian viewer  - SVG/Javascript
 
 Author: Nick Braun, 2011

 main.js

*/


   var zWheel,xWheel,saturationSlider,zoomHandle,poSwitch,contrastSlider  // UI elements

   var testCard
   var theSpace= null   
   var maxZoom=600
   var minZoom=100

   var isOn=true


  function init(){
        
       
        canvas=document.getElementById('svg_canvas').svg

        theSpace = new Tellus(canvas)
        theSpace.setCamera(250,0,-30,0,0,0,0)   
        theSpace.addShape(BOX)
     
       
        zWheel= new HWheel(canvas,'zWheel',function (delta){theSpace.rotateZ(delta/60.0)}) 
        xWheel= new VWheel(canvas,'xWheel',function (delta){theSpace.rotateX(delta/60.0)}) 


       canvas.documentElement.appendChild(canvas.getElementById("casing"));   
      

        zoomHandle = new Joystick1D(canvas,'zoomHandle',function(delta){

                        var zoomFactor=Math.min(theSpace.camera.zoom+0.5*delta,maxZoom)
                        zoomFactor=Math.max(zoomFactor,minZoom)
                        theSpace.camera.setZoom(zoomFactor)
                      })

        saturationSlider = new Slider(canvas,'saturationFrame','saturation',function(sliderVal){
                             theSpace.camera.setSaturation(sliderVal/100)
                              })

        saturationSlider.setValue(30)


        contrastSlider = new Slider(canvas,'contrastFrame','contrast',function(sliderVal){
                             theSpace.camera.setContrast(sliderVal/100)
                              })

        contrastSlider.setValue(80)


        poSwitch = new Switch2way(canvas,'poHandle',function(state){
                        if (state) theSpace.camera.projectionMode('perspective')
                               else theSpace.camera.projectionMode('orthographic')
                              })
        poSwitch.toggle('right')
     
        theSpace.rotateX(-0.2)
        theSpace.rotateZ(2.0)

        testCard = new Testcard(canvas,'testCard',false)
   
  
       document.getElementById('container').style.visibility = 'visible';
       document.getElementById('loading').style.display = 'none';   
	


}



  function displayToggle(){
 
      isOn=!isOn 

      isOn ? testCard.toggle(false) : testCard.toggle(true)

     }


//***** Mouse events ****


  function released(){
 
    if (isOn) {
 
      zWheel.released()
      xWheel.released()
      saturationSlider.released()
      zoomHandle.released()
      contrastSlider.released()
      poSwitch.released()
        }

        
   }
  
  function drag(evt){ 
   
    if (isOn) {
       zWheel.drag(evt)
       xWheel.drag(evt)
       saturationSlider.drag(evt)
       zoomHandle.drag(evt)
       contrastSlider.drag(evt)
       poSwitch.drag(evt)

         }
  
  }


