
#
# generate faces for 3d lute in json format readable by the chefnb rendering engine https://github.com/chefnb/3d-viewer
#
# Author: Nick Braun; last update Nov 2011

import json
import pprint
import copy
from math import *

  
def translate(shape_original,translation_vector):

  shape=copy.deepcopy(shape_original)
  for face in shape:
    for vertex in face['vertices']:
        for k in range(3): vertex[k]+=translation_vector[k]

  return shape



def set_contour(s,k,f):  # the classical egg contour ; closure over dimensional params

  def contour(z):
    if z<f: return z
    if z< 2*s:  return 7.234e-4*z*z*z-6.858e-2*z*z+2.1545*z-5.41
    return (s-k)/float(s)*sqrt(max(0,s*s-(z-2*s)*(z-2*s)))+k

  return contour
  

# *************** dimensional parameters (all lengths in cm) *********************

S=17			 # basic dimension parameter 17cm
K=7 			 # back-klotz radius 
F=10			 # front-klotz cylindrical depth

Z0=3.5 			 # neck/soundboard point
Z1=S*3 			 # klotz point (back end of the lute)
ZRES=10			 # z resolution
STRIPS=3		 # no of back strips

NECK=23.5
BRIDGE_Z=40		# backend-bridge distance
BRIDGE_HEIGHT=2
BRIDGE_WIDTH=10
NUT_WIDTH=5

SOUNDHOLE_Z=20
SOUNDHOLE_RADIUS=6
BANDING_WIDTH=0.5

             
HEAD_LENGTH=10
HEAD_DEPTH=2
HEAD_ANGLE=1.0


tVector=[0,0,-30]    	 # bulk translation

# **************** components*****************

def bridge(h,w,z):

  w/=2.0

  faces=[]

  faces.append([   [ w,-h,z],
                   [-w, -h, z],
                   [-w, -h, z+h],
                   [ w,-h,z+h ] ])

  faces.append([   [ w,-h,z],
                   [-w, -h, z],
                   [-w,0,z],
                   [ w, 0, z] ])

  faces.append([   [ w,-h,z+h],
                   [-w, -h, z+h],
                   [-w,0,z+h],
                   [ w, 0, z+h] ])

  faces.append([   [ w,-h,z+h],
                   [ w, 0, z+h],
                   [ w, 0, z],
                   [ w, -h, z] ])

  faces.append([   [ -w,-h,z+h],
                   [ -w, 0, z+h],
                   [ -w, 0, z],
                   [ -w, -h, z] ])


  return [ {"face": 'bridge',  "vertices":  face, "hue":  0  } for face in faces]



def decke(zres,z0,z1,hole_z,hole_r,k,bw,contour):

  dz=(z1-z0)/float(zres)
  faces=[]

  for j in range(0,zres):

    z=j*dz+z0
     
    phi=pi*j/zres-pi/2
    phip=pi*(j+1.5)/zres-pi/2

    cz=contour(z)
    czd=contour(z+dz)

 
    for s in [1,-1]: # left/right symmetry
 

       faces.append([             [s*cz, 0 ,z],  # inner to soundhole rim
                                  [s*czd,0,z+dz], 
                                  [s*hole_r*cos(phip),0,hole_r*sin(phip)+hole_z], 
                                  [s*hole_r*cos(phi),0,hole_r*sin(phi)+hole_z]])


       faces.append([[k,0,z1],[-k,0,z1],[0,0,hole_z+hole_r] ])  # fill gaps
       faces.append([[contour(z0),0,z0],[-contour(z0),0,z0],[0,0,hole_z-hole_r] ])
  


  return [ {"face": 'decke',  "vertices":  face, "hue":  0.8  } for face in faces]

#

def banding(width,zres,z0,z1,k,contour):

  dz=(z1-z0)/float(zres)

  faces=[]

  for s in [1,-1]:
    for j in range(0,zres):
      z=j*dz+z0

      cz=s*contour(z)
      czd=s*contour(z+dz)

      theta=atan((czd-cz)/dz)
      dc=s*width/cos(theta)
    
      faces.append([  [cz, 0 ,z],  
                      [czd,0,z+dz*1.01],
                      [czd-dc, 0 ,z+dz*1.01],  
                      [cz-dc,0,z]])

  faces.append([[k,0,z1],[-k,0,z1],[-k,0,z1-width],[k,0,z1-width] ])  # backend
     

  return [ {"face": 'banding',  "vertices":  face, "hue":  4  } for face in faces]


#-------------------------

def rosette(width,zres,z0,z1,center_z,radius):

  w=width
  r=radius
  cz=center_z
  dz=(z1-z0)/float(zres)
  faces=[]

  for s in [1,-1]:
    for j in range(0,zres):
      phi=pi*j/zres-pi/2
      phip=pi*(j+1.5)/zres-pi/2

  
      faces.append([  
       [s*r*cos(phip),0,r*sin(phip)+cz], 
       [s*r*cos(phi),0,r*sin(phi)+cz], 
       [s*(r-w)*cos(phi),0,(r-w)*sin(phi)+cz],                           
       [s*(r-w)*cos(phip),0,(r-w)*sin(phip)+cz] ] )


  return [ {"face": 'rosette',  "vertices":  face, "hue":  4  } for face in faces]


#-------------------------

def klotz(strips,z1,k):

  dphi=pi/strips
  vertices=[]
  for i in range(0,strips+1):
    vertices.append([k*cos(i*dphi),k*sin(i*dphi),z1])
  
  return [{"face":       'klotz',
          "vertices":  vertices,
          "hue":	  0.6   }]

#---------------------------------


def gewoelbe(z0,z1,z_res,strips,contour):

  def hue(i):
    if i % 2 == 0: return 0.5 
    else: return 2.5

  dz=(z1-z0)/float(z_res)
  dphi=pi/strips
  faces = []

  for i in range(0,strips):
 
    for j in range(0,z_res):

      z=j*dz+z0
      phi=i*dphi
      phip=(i+1)*dphi
      r=contour(z)
      zp=z+dz
      rp=contour(zp)
      c=cos(phi)
      s=sin(phi)
      cp=cos(phip)
      sp=sin(phip)

  
      faces.append( {"face":       'gewoelbe',
     		     "vertices":  [[r*c, r*s ,z],  [rp*c,rp*s,zp], [rp*cp,rp*sp,zp],    [r*cp,r*sp,z]],
	             "hue":	  hue(i)   })

  return faces


#-------------------------



def wirbelkasten(zklotz,neck_length,kasten_length,depth,nut):

 znut=zklotz-neck_length
  
 faces=[]  

 faces.append( [[nut/2.0, 0 ,znut], 
                [nut/2.0, kasten_length, znut], 
                [nut/2.0, kasten_length, znut-depth], 
                [nut/2.0, nut/2.0 ,znut-depth] 
                    ])
 faces.append(  [[-nut/2.0, 0 ,znut], 
                [-nut/2.0, kasten_length, znut], 
                [-nut/2.0, kasten_length, znut-depth], 
                [-nut/2.0, nut/2.0 ,znut-depth] 
                        ])

 faces.append([
                [-nut/2.0, nut/2.0 ,znut-depth], 
                [-nut/2.0, kasten_length, znut-depth], 
                [nut/2.0, kasten_length, znut-depth], 
                [nut/2.0, nut/2.0 ,znut-depth] ,
		[nut/3.0, nut/2.0 ,znut-depth], 
                [nut/3.0, kasten_length-nut/2.0, znut-depth],
                [-nut/3.0, kasten_length-nut/2.0, znut-depth],
                [-nut/3.0, nut/2.0, znut-depth]
                        ])

 faces.append([
                [-nut/2.0, nut/2.0 ,znut], 
                [-nut/2.0, kasten_length, znut], 
                [nut/2.0, kasten_length, znut], 
                [nut/2.0, nut/2.0 ,znut] ,
		[nut/3.0, nut/2.0 ,znut], 
                [nut/3.0, kasten_length-nut/2.0, znut],
                [-nut/3.0, kasten_length-nut/2.0, znut],
                [-nut/3.0, nut/2.0, znut]
                        ])


 faces.append([
  		[-nut/2.0, 0 ,znut],  
                [-nut/2.0, nut/2.0, znut-depth], 
                [nut/2.0, nut/2.0, znut-depth], 
                [nut/2.0, 0 ,znut]  
 		 ])

 faces.append([
  		[-nut/2.0, kasten_length ,znut],  
                [-nut/2.0, kasten_length  , znut-depth], 
                [nut/2.0,  kasten_length , znut-depth], 
                [nut/2.0,  kasten_length ,znut]  
 		 ])


 faces.append([
  		[-nut/2.0, 0 ,znut],  
                [-nut/2.0, nut/2.0, znut-depth], 
                [nut/2.0, nut/2.0, znut-depth], 
                [nut/2.0, 0 ,znut]  
 		 ])

 faces.append( [[nut/2.0, 0 ,znut], 
                [nut/2.0, nut/2.0, znut],  
                [nut/2.0, nut/2.0 ,znut-depth] 
                    ])
 faces.append( [[-nut/2.0, 0 ,znut], 
                [-nut/2.0, nut/2.0, znut],  
                [-nut/2.0, nut/2.0 ,znut-depth] 
                    ])


 return [ {"face": 'kasten',  "vertices":  face, "hue":  0.5  } for face in faces]
 


#--------

def neck(zklotz,length,nut,strips,contour):

  rklotz=contour(zklotz)  # radius of neck at klotz junction
  rnut=nut/2.0
  znut=zklotz-length
  
  dphi=pi/strips
  faces = []

  for i in range(0,strips):
 
      phi=i*dphi
      phip=(i+1)*dphi
      
      c=cos(phi)
      s=sin(phi)
      cp=cos(phip)
      sp=sin(phip)

  
      faces.append( {"face":       'neck',
     		     "vertices":  [[rklotz*c, rklotz*s ,zklotz],  [rnut*c,rnut*s,znut], [rnut*cp,rnut*sp,znut],    [rklotz*cp,rklotz*sp,zklotz]],
	             "hue":	  0   })

  faces.append( {"face":       'neck',    # fretboard
     		     "vertices":  [[rklotz, 0 ,zklotz],  [rnut,0,znut], [-rnut,0,znut],    [-rklotz,0,zklotz]],
	             "hue":	  0.2   })

  return faces




#****************++ MAIN **********************

theMould=set_contour(S,K,F)




f= open('lute.js',"w")  

f.write("var ROSETTE = "+json.dumps({
         "CofM":[0,1,-SOUNDHOLE_Z],
         "faces": translate( 
                 rosette(BANDING_WIDTH,ZRES,Z0,Z1,SOUNDHOLE_Z,SOUNDHOLE_RADIUS), 
                    tVector ) }
      )+";\n")


f.write("var BANDING = "+json.dumps({
         "CofM":[0,1,-SOUNDHOLE_Z],
         "faces": translate(      
             banding(BANDING_WIDTH,ZRES,Z0,Z1,K,theMould),
                    tVector ) }
      )+";\n")
 

f.write("var SHELL = "+json.dumps({
         "CofM":[0,-1,-SOUNDHOLE_Z],
         "faces": translate( gewoelbe(Z0,Z1,ZRES,STRIPS,theMould) +klotz(STRIPS,Z1,K), tVector  ) }
      )+";\n")

f.write("var SOUNDBOARD = "+json.dumps(
           {"CofM":[0,0,-SOUNDHOLE_Z], 
            "faces": translate( decke(ZRES,Z0,Z1,SOUNDHOLE_Z,SOUNDHOLE_RADIUS,K,BANDING_WIDTH,theMould), tVector) }
        )+";\n")

f.write("var BRIDGE = "+json.dumps({
         "CofM":[0,BRIDGE_HEIGHT,-SOUNDHOLE_Z],
         "faces": translate(      
               bridge(BRIDGE_HEIGHT,BRIDGE_WIDTH, BRIDGE_Z),
                    tVector ) }
      )+";\n")

f.write("var NECK = "+json.dumps({
         "CofM":[0,0,-Z0],
         "faces": translate(      
             neck(Z0,NECK,NUT_WIDTH,STRIPS,theMould),
                    tVector ) }
      )+";\n")

f.write("var HEAD = "+json.dumps({
         "CofM":[0,-2,-Z0+NECK+HEAD_LENGTH],
         "faces": translate(      
                wirbelkasten(Z0,NECK,HEAD_LENGTH,HEAD_DEPTH,NUT_WIDTH),

                    tVector ) }
      )+";\n")



f.close()
           

#pprint.pprint(lute)

