function HSVtoRGB(h,s,v){

		h%=6;
		var r,g,b;
		if (s==0) r=g=b=v;
		else {
			var H=h>>0;
			var f=h-H;
			var p=v*(1-s);
			var q=v*(1-f*s);
			var t=v*(1-(1-f)*s);
			if (H==0) r=v, g=t, b=p;
			if (H==1) r=q, g=v, b=p;
			if (H==2) r=p, g=v, b=t;
			if (H==3) r=p, g=q, b=v;
			if (H==4) r=t, g=p, b=v;
			if (H==5) r=v, g=p, b=q;
		}
		return {r:(r = r*256 >> 0) < 0 ? 0 : r > 255 ? 255 : r,
		g:(g = g*256 >> 0) < 0 ? 0 : g > 255 ? 255 : g,
		b:(b = b*256 >> 0) < 0 ? 0 : b > 255 ? 255 : b
		};
	}


//*************
//  CLASS: TELLUS

 function Tellus(canvas){

      this.canvas=canvas
      this.faces=[]; 
      this.camera=null
      
      this.ctMatrix=[ [1,0,0],[0,1,0] ,[0,0,1]]
   
      this.ctmStack=[]

      var parentThis=this
      var shapes=[]

       
     // methods

     this.addShape = function(shapeData){

       shapes.push(new Shape(parentThis,shapeData))
      }

     this.setCamera = function(zoom,xe,ye,ze,xc,yc,zc){
        this.camera = new Camera(parentThis,zoom,xe,ye,ze,xc,yc,zc)  
        this.update() 
     }

       this.popCTM = function(){
        this.ctMatrix = this.ctmStack.pop()
        }    

       this.pushCTM = function(){
        this.ctmStack.push(this.ctMatrix)
        }    


       this.rotateZ= function(rad){

         var s=Math.sin(rad)
         var c=Math.cos(rad)

        var m=this.ctMatrix

        this.ctMatrix=[ 
             [c*m[0][0]-s*m[1][0], c*m[0][1]-s*m[1][1], c*m[0][2]-s*m[1][2] ],
             [s*m[0][0] +c*m[1][0], s*m[0][1]+c*m[1][1], s*m[0][2]+c*m[1][2] ],
             [m[2][0],  m[2][1], m[2][2] ]        
            ] 

          this.update()

       }

   this.rotateX= function(rad){


         var s=Math.sin(rad)
         var c=Math.cos(rad)

        m=this.ctMatrix

        this.ctMatrix=[ 
             [m[0][0], m[0][1], m[0][2] ],
             [c*m[1][0] -s*m[2][0], c*m[1][1]-s*m[2][1], c*m[1][2]-s*m[2][2] ],
             [s*m[1][0]+c*m[2][0],  s*m[1][1]+c*m[2][1], s*m[1][2] +c*m[2][2] ]        
           ] 

            this.update()

       }

     this.update = function(){
        for (var i = 0; i < shapes.length; i++){
             shapes[i].update()
          }
       }

}

// ******************
// SHAPE CLASS

 function Shape(p,primitive){

     
      this.faces=[]; 
     
    

      for (var i = 0; i < primitive.length; i++){
       this.faces.push(new Face(p,primitive[i].vertices,primitive[i].hue))
      }
    
      this.faces.sort(function(a, b){  return a.mean_pa-b.mean_pa  })   // painter algorithm sorting
  
      for (var i = 0; i < this.faces.length; i++){
         p.canvas.documentElement.appendChild(this.faces[i].svgElement)
        }
      

    // method

     this.update = function() {

        for (var i = 0; i < this.faces.length; i++){
         this.faces[i].update()
        }

         this.faces.sort(function(a, b){ return a.mean_pa-b.mean_pa})
 
      for (var i = 0; i < this.faces.length; i++){
        p.canvas.documentElement.appendChild(this.faces[i].svgElement)
        }

     }
}



//***********

// CAMERA CLASS
    
/* 
Perspective (u,v) view of cartesian space (x,y,z)

The perspective transform comprises coordinate rotation (twice) such that y-axis points along ec and z-axis points 'up' perpendicular to ec  

For further reference see Andrejs Treibergs' site 
     `Mathematics of Perspective Drawing'
     http://www.math.utah.edu/~treiberg/Perspect/Perspect.htm
  
*/

   function Camera(p,zoom,xe,ye,ze,xc,yc,zc){

       this.zoom=zoom
       this.colourSaturation=1.0
       this.contrast=0.8

        var perspectiveView=false

        var ec1=xc-xe   // eye to center displacement vector ec
        var ec2=yc-ye   
        var ec3=zc-ze

        //   1. determine Euler angle h which rotates ec about about z to ecd =(0,ecd2,ecd3)  

       var r1=Math.sqrt(ec1*ec1+ec2*ec2)  // projected length of ec in xy plane
       var sh=ec1/r1      // sin h
       var ch=ec2/r1      // cos h

       var ecd2=sh*ec1+ch*ec2   // the rotated ec_y and ec_z
       var ecd3=ec3

       // 2. determine Euler angle k which rotates z about new x axis to point upwards

       var r2=Math.sqrt(ec1*ec1+ec2*ec2+ec3*ec3)
       var ck=ecd2/r2
       var sk=ecd3/r2


   // METHODS      

        this.setSaturation = function(newVal){
          this.colourSaturation=newVal
          p.update()
         }

        this.setContrast= function(newVal){
          this.contrast=newVal
          p.update()
         }

        this.setZoom= function(newVal){
          this.zoom=newVal
          p.update()
         }

        this.projectionMode= function(mode){
          perspectiveView = (mode=="perspective") ? true : false;
          p.update()
         }
        

        this.uvProjection = function(x,y,z){

          var depth=sh*ck*(x-xe)+ch*ck*(y-ye)+sk*(z-ze)
          var u=this.zoom*(ch*(x-xe)-sh*(y-ye))  
          var v=this.zoom*(-sh*sk*(x-xe)-ch*sk*(y-ye)+ck*(z-ze))  
       
          if (perspectiveView) { u/=depth;v/=depth } else {u/=-ye; v/=-ye}

         return {pa: -depth, 
                 u:  u,
                 v:  v
                } 
        }
      }

//*********************************************

// VERTEX CLASS

   function Vertex(ggp,point){

      
         var x=point[0];
         var y=point[1];
         var z=point[2];

         this.u=null;
         this.v=null;

         this.pa=null; // painters algorithm distance from viewer
       
     // method

        this.update = function(){

           // apply CTM - global coordinate transform matrix

             var m=ggp.ctMatrix      


             var xd=m[0][0]*x+m[0][1]*y +m[0][2]*z;   
             var yd=m[1][0]*x+m[1][1]*y +m[1][2]*z;       
             var zd=m[2][0]*x+m[2][1]*y +m[2][2]*z;       

       
            uv_projection=ggp.camera.uvProjection(xd,yd,zd)

            this.pa=uv_projection.pa
            this.u=uv_projection.u+190
            this.v=uv_projection.v+140

          }
		this.update();   //!!!

   }

   

//**************    

 //  FACE CLASS

       function Face(gp,points,hue){

          this.vertices=[]
          this.svgElement= null
          this.mean_pa=0  // for painters algorithm 
          
          var light = [0,1,0]
     
        
          // compute normal n=axb 

          var ax=points[1][0]-points[0][0]
          var ay=points[1][1]-points[0][1]
          var az=points[1][2]-points[0][2]
          var bx=points[2][0]-points[0][0]
          var by=points[2][1]-points[0][1]
          var bz=points[2][2]-points[0][2]

          var nx=ay*bz-az*by
          var ny=az*bx-bz*ax
          var nz=ax*by-ay*bx

          gamma=Math.sqrt(nx*nx+ny*ny+nz*nz)
          
          var normal = [ nx/gamma,ny/gamma,nz/gamma ]
          
          pathString="M "
          for (var i = 0; i < points.length; i++){
                  this.vertices[i]=new Vertex(gp,points[i]);
                  pathString+=this.vertices[i].u+","+this.vertices[i].v+" ";
                  this.mean_pa+=this.vertices[i].pa
          }
          pathString+="Z"
          this.mean_pa/=points.length

          this.svgElement=gp.canvas.createElementNS("http://www.w3.org/2000/svg","path")
	  this.svgElement.setAttributeNS(null,"d",pathString)

          var rgb= HSVtoRGB(hue,gp.camera.colourSaturation,1.0)

          this.svgElement.setAttributeNS(null,"style","fill:rgb("+rgb.r+","+rgb.g+","+rgb.b+")")
     
          this.svgElement.setAttributeNS(null,"clip-path","url(#casingClip)")
       
        // method

           this.update=function(){
             
              this.mean_pa=0  

              var pathString="M "

              for (var i = 0; i < points.length; i++){
                  this.vertices[i].update();
                  pathString+=this.vertices[i].u+","+this.vertices[i].v+" ";
                  this.mean_pa+=this.vertices[i].pa
              }

             pathString+="Z"
             this.mean_pa/=points.length

             this.svgElement.setAttributeNS(null,"d",pathString);


          // update shading

          // normal in current ref frame

            var m=gp.ctMatrix  

             nx=m[0][0]*normal[0]+m[0][1]*normal[1] +m[0][2]*normal[2];   
             ny=m[1][0]*normal[0]+m[1][1]*normal[1] +m[1][2]*normal[2];       
             nz=m[2][0]*normal[0]+m[2][1]*normal[1] +m[2][2]*normal[2];       

          
            var shading= Math.abs(nx*light[0]+ny*light[1]+nz*light[2])

            shading=(shading=1+gp.camera.contrast*(1.5*shading-1))>1 ? 1: shading

            var rgb= HSVtoRGB(hue,gp.camera.colourSaturation,shading)
           
    
            this.svgElement.setAttributeNS(null,"style","fill:rgb("+rgb.r+","+rgb.g+","+rgb.b+")")
    

         }

        }

 
  
