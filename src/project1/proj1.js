// Always execute in strict mode (less bug)
'use strict';

/* to1DF32Array(a2DArray)
 *
 * This function turns an array of 4-element arrays a2DArray into a packed
 * 1-dimensional array of 32-bit floating-point numbers.
 *
 * NOTE: This function should not be here. It should be in your library.
 */
function to1DF32Array(a2DArray)
{
    var size = a2DArray.length;

    if(size == 0)
    {
        console.log("[alib/to1DF32Array - DEBUG]: size is 0");
        return new Float32Array([]);
    }

    // Turn 2D array into 1D array
    
    var result = [];
    var index = 0;

    for(var i = 0; i < size; i++)
    {
        var anElement = a2DArray[i];
        
        if(anElement.length != 4)
            console.log("[laib/to1DF32Array - ERROR]: Not a 4-element vector");
        
        result[index] = anElement[0];
        result[index + 1] = anElement[1];
        result[index + 2] = anElement[2];
        result[index + 3] = anElement[3];
        index += 4;
    }

    return new Float32Array(result);
}

// These variables must be global variables.
// Some callback functions may need to access them.
var gl = null;
var canvas = null;
var ctm_location;
var ctms = [[[1.0, 0.0, 0.0, 0.0],
	     [0.0, 1.0, 0.0, 0.0],
	     [0.0, 0.0, 1.0, 0.0],
	     [0.0, 0.0, 0.0, 1.0]],
	    [[1.0, 0.0, 0.0, 0.0],
	     [0.0, 0.87, -0.50, 0.0],
	     [0.0, 0.50, 0.87, 0.0],
	     [0.0, 0.0, 0.0, 1.0]],
	    [[1.0, 0.0, 0.0, 0.0],
	     [0.0, 0.50, -0.87, 0.0],
	     [0.0, 0.87, 0.50, 0.0],
	     [0.0, 0.0, 0.0, 1.0]],
	    [[1.0, 0.0, 0.0, 0.0],
	     [0.0, 0.0, -1.0, 0.0],
	     [0.0, 1.0, 0.0, 0.0],
	     [0.0, 0.0, 0.0, 1.0]]];
var ctm_index = 0;
var degs = [0, 30, 60, 90];

//////////////////////
var shapeIndex = 0;  //globals for index in display  
var numV = 0; //num vertices in display
var fullVert  =0; //entire lenght of positions array
////global for mat
var mat4x4;

//global last x and y coordinate for canvas
var lastX; 
var lastY;
var meese= 0; //mouse up and down val, mouse down = 1, up =0
var tmd;

//[0] holds the index [1] holds the num of vertices 
var cubeD = [0,0]; 
var coneD = [0,0];
var cylD = [0,0]; 
var torD = [0,0];
var sphD = [0,0];


function initGL(canvas)
{
    gl = canvas.getContext("webgl");
    if(!gl)
    {
	alert("WebGL is not available...");
	return -1;
    }

    // Set the clear screen color to black (R, G, B, A)
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    // Enable hidden surface removal
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    return 0;
}

function init()
{
    var positions = generateCone();
    coneD[0] = 0;
    coneD[1] = generateCone().length; 

    //add cube
    positions = positions.concat(genCube());
    cubeD[0] = coneD[1];
    cubeD[1] =genCube().length;

    positions = positions.concat(genCylinder());
    cylD[0] =cubeD[0]+cubeD[1];
    cylD[1] =genCylinder().length;

    positions = positions.concat(genTorus());
    torD[0] =cylD[0]+cylD[1];
    torD[1] =genTorus().length;

    positions = positions.concat(genSphere());
    sphD[0] =torD[0]+torD[1];
    sphD[1] =genSphere().length;

    shapeIndex = coneD[0]; 
    numV = coneD[1];

    fullVert =positions.length;

    var colors = generateColors();

    // Load and compile shader programs
    var shaderProgram = initShaders(gl, "vertex-shader", "fragment-shader");
    if(shaderProgram == -1)
	return -1;
    gl.useProgram(shaderProgram)

    // Allocate memory in a graphics card
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, 4 * 4 * (positions.length + colors.length), gl.STATIC_DRAW);
    // Transfer positions and put it at the beginning of the buffer
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, to1DF32Array(positions));
    // Transfer colors and put it right after positions
    gl.bufferSubData(gl.ARRAY_BUFFER, 4 * 4 * positions.length, to1DF32Array(colors));

    // Vertex Position - locate and enable "vPosition"
    var vPosition_location = gl.getAttribLocation(shaderProgram, "vPosition");
    if (vPosition_location == -1)
    { 
        alert("Unable to locate vPosition");
        return -1;
    }
    gl.enableVertexAttribArray(vPosition_location);
    // vPosition starts at offset 0
    gl.vertexAttribPointer(vPosition_location, 4, gl.FLOAT, false, 0, 0);

    // Vertex Color - locate and enable vColor
    var vColor_location = gl.getAttribLocation(shaderProgram, "vColor");
    if (vColor_location == -1)
    { 
        alert("Unable to locate vColor");
        return -1;
    }
    gl.enableVertexAttribArray(vColor_location);
    // vColor starts at the end of positions
    gl.vertexAttribPointer(vColor_location, 4, gl.FLOAT, false, 0, 4 * 4 * positions.length);

    // Current Transformation Matrix - locate and enable "ctm"
    ctm_location = gl.getUniformLocation(shaderProgram, "ctm");
    if (ctm_location == -1)
    { 
        alert("Unable to locate ctm");
        return -1;
    }

    return 0;
}

function display()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4x4 =scalingMat(.5,.5,0);
   // mat4x4 = rotateX(0.01);

    var goon =  matMatMult(mat4x4,ctms[ctm_index]);
    // Set the ctm
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(goon));
    // Draw the object

    //////
    gl.drawArrays(gl.TRIANGLES, shapeIndex, numV);

}

function keyDownCallback(event)
{
    if(event.keyCode == 32)
    {
	ctm_index += 1;
	if(ctm_index == 4)
	    ctm_index = 0;

	console.log("Tilting backward " + degs[ctm_index] + " degrees")
	display()
    }
    //cube display
    else if(event.keyCode == 67){
        shapeIndex = cubeD[0]; 
        numV = cubeD[1];
        display();
    }
    //cone
    else if(event.keyCode == 79){
        shapeIndex = coneD[0]; 
        numV = coneD[1];
        display();

    }
    //cylinder 
    else if(event.keyCode == 76){
        shapeIndex = cylD[0]; 
        numV = cylD[1];
        display();
    }

    //torus
    else if(event.keyCode == 84){
        shapeIndex = torD[0]; 
        numV = torD[1];
        display();
    } 

    //sphere
    else if(event.keyCode == 83){
        shapeIndex = sphD[0]; 
        numV = sphD[1];
        display();
    }

    else if(event.keyCode == 38){ //scale up
        mat4x4 = scalingMat(1.02, 1.02, 1.02);
        ctms[ctm_index]= matMatMult(mat4x4,ctms[ctm_index]);
        display();
    }
    else if(event.keyCode == 40){ //scale down
        mat4x4 = scalingMat(-1.02, -1.02, -1.02);
        ctms[ctm_index]= matMatMult(mat4x4,ctms[ctm_index]);
        display();
    }

}

function mouseDownCallback(event){
    console.log("mouseDownCallback(): " +
       "event.which = " + event.which +
       ", x = " + (event.clientX - canvas.offsetLeft) +
        ", y = " + (event.clientY - canvas.offsetTop)  
     );
    lastX = event.clientX;
    lastY = event.clientY;
    meese = 1; 

    tmd = event.timeElapsed; 
}
function mouseUpCallback(event){
    var dist = (event.clientX - lastX) + (event.clientY - lastY);
    var speed = dist/tmd;

    lastX = event.clientX;
    lastY = event.clientY;
    meese =0;
    console.log("mouseUpCallback(): " +
        "event.which = " + event.which +
        ", x = " + (event.clientX - canvas.offsetLeft) +
        ", y = " + (event.clientY - canvas.offsetTop));
}
function mouseMoveCallback(event){
   if(meese==1){

        if(event.clientX >lastX){
             mat4x4 = rotateY(0.02);
            ctms[ctm_index]= matMatMult(mat4x4,ctms[ctm_index]);
            display();
        }    
        if(event.clientX <lastX){
             mat4x4 = rotateY(-0.02);
            ctms[ctm_index]= matMatMult(mat4x4,ctms[ctm_index]);
            display();
        }
        if(event.clientY >lastY){
             mat4x4 = rotateX(0.02);
            ctms[ctm_index]= matMatMult(mat4x4,ctms[ctm_index]);
            display();
        }
        if(event.clientY <lastY){
             mat4x4 = rotateX(-0.02);
            ctms[ctm_index]= matMatMult(mat4x4,ctms[ctm_index]);
            display();
        }
        if (event.shiftKey) {
            mat4x4 = rotateZ(.02);
            ctms[ctm_index]= matMatMult(mat4x4,ctms[ctm_index]);
            display();
        }
        if (event.altKey) {
            mat4x4 = rotateZ(-.02);
            ctms[ctm_index]= matMatMult(mat4x4,ctms[ctm_index]);
            display();
        } 

    }


   
        console.log("mouseMoveCallback(): " +
            "event.which = " + event.which +
            ", x = " + (event.clientX - canvas.offsetLeft) +
            ", y = " + (event.clientY - canvas.offsetTop));
}


/////////////////////////////////////////////////////////////////
//generate an array of verticies to make a cone 
function generateCone(){
    //init the arr of verticies
    var vert = new Array(36);
    for (var i = 0; i < vert.length; i++) {
        vert[i] = new Array(4);
    }

    var center = [0.0, 0.0, 0.0,1.0]; //center of base 
    var tip = [0.0, 1.0, 0.0, 1.0]; //tip of cone
    var pos = 0; //position in the vert array
    //generate verts for cone 
    for(var theta = 0; theta <360; theta+=30){
        //next theta value to get other point 
        var tNext = theta +30; 

       //convert to radians 
        var rad1 = theta * Math.PI/180; 
         var rad2 = tNext * Math.PI/180; 

        //get first point
        var point1 = [Math.sin(rad2), 0.0, Math.cos(rad2), 1.0];

        //get second point 
        var point2 = [Math.sin(rad1), 0.0,Math.cos(rad1), 1.0];
    
        //base of cone
        vert[pos] = center; 
        vert[pos+1] = [Math.sin(rad2), 0.0, Math.cos(rad2), 1.0];
        vert[pos+2] =  [Math.sin(rad1), 0.0,Math.cos(rad1), 1.0];

        //side of cone
        vert[pos+3] = tip; 

            vert[pos+4] = point2;
            vert[pos+5] = point1;


        pos+=6;
    } 
    return vert;
}


//generate arr of colors for cone
function generateColors(){

    //init color arr
    var colArr = new Array(fullVert); //one color per triangle
    for (var i = 0; i < colArr.length; i++) {
        colArr[i] = new Array(4);
    }

    for (var i = 0; i < colArr.length; i++) {
        //random values for the colors
        var val1 = Math.floor(Math.random() * 2);
        var val2 = Math.floor(Math.random() * 2);
        var val3 = Math.floor(Math.random() * 2);
        var val4 = 1.0;

        colArr[i] = [val1, val2, val3, val4];
        colArr[i+1] = [val1, val2, val3, val4];
        colArr[i+2] = [val1, val2, val3, val4];
        i+=2;
    } 

    return colArr;


}


function genCircle(){
   //init the arr of verticies
    var vert = new Array(36);
    for (var i = 0; i < vert.length; i++) {
        vert[i] = new Array(4);
    }

    var center = [0.0, 0.0, 0.0,1.0]; //center of base 
    var pos = 0; //position in the vert array
    //generate verts for cone 
    for(var theta = 0; theta <360; theta+=30){
        //next theta value to get other point 
        var tNext = theta +30; 

       //convert to radians 
        var rad1 = theta * Math.PI/180; 
         var rad2 = tNext * Math.PI/180; 

        //get first point
        var point1 = [Math.sin(rad1), Math.cos(rad1),0.0, 1.0];

        //get second point 
        var point2 = [Math.sin(rad2), Math.cos(rad2),0.0, 1.0];
    
        vert[pos] = center; 
        vert[pos+1] = point2;
        vert[pos+2] =  point1;

        pos+=3;
    } 
    return vert;
}
function genCube(){

    //init array 
    var vert = new Array(36);
    for (var i = 0; i < vert.length; i++) {
        vert[i] = new Array(4);
    }

    vert = [
    //front & back
        [0,1.0,0.0,1.0],
        [0,0.0,0.0,1.0],
        [1,1.0,0.0,1.0],
        /////
        [1, 1.0, 0.0,1.0],
        [0,0.0,0.0,1.0],
        [1,0.0,0.0,1.0],

        //set
        [0.0,0.0,-1.0,1.0],
        [0.0,1.0,-1.0,1.0],
        [1,0.0,-1.0,1.0],
        /////
        [0, 1.0, -1.0,1.0],
        [1,1.0,-1,1.0],
        [1,0.0,-1,1.0],

        //sides 
        [0,1,0,1],
        [0,1,-1,1.0],
        //[0,1,0,1],
        [0,0,0,1],

        [0,0,0,1],
        [0,1,-1,1],
        [0,0,-1,1],
////
        [1,1,0,1],
        [1,0,0,1],
        [1,1,-1,1],
        
        [1,1,-1,1],
        [1,0,0,1],   
        [1,0,-1,1],

        // bottom & top -all set

        [0,0,0,1],
        [0,0,-1,1],
        [1,0,0,1],

        [1,0,0,1],
        [0,0,-1,1],
        [1,0,-1,1],

        [0,1,-1,1],
        [0,1,0,1],
        [1,1,0,1],

        [0,1,-1,1],
        [1,1,0,1],//check  
        [1,1,-1,1],
    ];


    return vert; 

}
function genCylinder(){
    //init the arr of verticies
    var vert = new Array(72);
    for (var i = 0; i < vert.length; i++) {
        vert[i] = new Array(4);
    }

    var center = [0.0, 0.0, 0.0,1.0]; //center of base 
    var top = [0.0, 0.5, 0.0,1.0]; //center of the top
    var pos = 0; //position in the vert array
    //generate verts for cone 
    for(var theta = 0; theta <360; theta+=30){
        //next theta value to get other point 
        var tNext = theta +30; 

       //convert to radians 
        var rad1 = theta * (Math.PI/180); 
        var rad2 = tNext * (Math.PI/180); 

        //get first point
        var point1 = [Math.sin(rad2), 0.0, Math.cos(rad2), 1.0];
        //get second point 
        var point2 = [Math.sin(rad1), 0.0, Math.cos(rad1), 1.0];

        var point3 = [Math.sin(rad2), 0.5, Math.cos(rad2), 1.0];
        //get second point 
        var point4 = [Math.sin(rad1), 0.5, Math.cos(rad1), 1.0];
    
        //base
        vert[pos] = center; 
        vert[pos+1] = [Math.sin(rad2), 0.0, Math.cos(rad2), 1.0];
        vert[pos+2] = [Math.sin(rad1), 0.0, Math.cos(rad1), 1.0];

        //top circle
        vert[pos+3] = top; 
        vert[pos+4] = [Math.cos(rad2), 0.5, Math.sin(rad2), 1.0];
        vert[pos+5] = [Math.cos(rad1), 0.5, Math.sin(rad1), 1.0];

        //sides 
        ////////////////////
        vert[pos+6] = point3; 
        vert[pos+7] = point4;
        vert[pos+8] = point2;

        vert[pos+9] = point3; 
        vert[pos+10] = point2;
        vert[pos+11] = point1;

        pos+=12;
    } 
    return vert;

}

function genTorus(){
    var vert = new Array(36);
    for (var i = 0; i < vert.length; i++) {
        vert[i] = new Array(4);
    }

  //  var center = [0.0, 0.0, 0.0,1.0]; //center of base 
    var pos = 0; //position in the vert array

    //spokes for inner circle first
    for(var theta = 0; theta <360; theta+=20){
        //next theta value to get other point 
        var tNext = theta +20; 

       //convert to radians 
        var rad1 = theta * Math.PI/180; 
        var rad2 = tNext * Math.PI/180; 

        //get first point
   //     var point1 = [Math.sin(rad1), 0.0, Math.cos(rad1), 1.0];
        //get second point 
   //     var point2 = [Math.sin(rad2), 0.0, Math.cos(rad2), 1.0];
        
        //torus sides 
        //bTheta === baby theta for outer circles 
        for(var bTheta = 0; bTheta < 360; bTheta+=20){
            //theta val after btheta
            var bNext = bTheta +20;

            var rad3 = bTheta * Math.PI/180;
            var rad4 = bNext  * Math.PI/180;


            var p1 = [0.5*Math.cos( rad1) + 0.5*Math.cos( rad3)*Math.cos( rad1) , 0.5*Math.sin( rad1)+ 0.5*Math.cos( rad3)*Math.sin( rad1) ,0.5*Math.sin( rad3), 1.0]; 
            var p2 = [0.5*Math.cos( rad1) + 0.5*Math.cos( rad4)*Math.cos( rad1) , 0.5*Math.sin( rad1)+ 0.5*Math.cos( rad4)*Math.sin( rad1) ,0.5*Math.sin( rad4), 1.0]; 
            var p3 = [0.5*Math.cos( rad2) + 0.5*Math.cos( rad3)*Math.cos( rad2) , 0.5*Math.sin( rad2)+ 0.5*Math.cos( rad3)*Math.sin( rad2) ,0.5*Math.sin( rad3), 1.0];
            var p4 = [0.5*Math.cos( rad2) + 0.5*Math.cos( rad4)*Math.cos( rad2) , 0.5*Math.sin( rad2)+ 0.5*Math.cos( rad4)*Math.sin( rad2) ,0.5*Math.sin( rad4), 1.0];



            vert[pos]   = p2; 
            vert[pos+1] = p1; 
            vert[pos+2] = p3; 

            vert[pos+3] = p3; 
            vert[pos+4] = p4; 
            vert[pos+5] = p2;

            //increment pos
            pos+=6;  



        }
        
    } 
    

























    //RETURN TORUS VERTICES
    return vert;
}

function genSphere(){
    var vert = new Array(36);
    for (var i = 0; i < vert.length; i++) {
        vert[i] = new Array(4);
    }

    var cent = [0, 0, 0, 1]; 

    var pos = 0; //position in the vert array
    var rot = 30* (Math.PI/180);

    //spokes for inner circle first
    for(var theta = 0; theta <360; theta+=30){
        //next theta value to get other point 
        var tNext = theta +30; 

       //convert to radians 
        var rad1 = theta * Math.PI/180; 
        var rad2 = tNext * Math.PI/180; 


        var p1 = [Math.sin(rad1), 0, Math.cos(rad1), 1.0];
        var leap = rotateY(30*(Math.PI/180));
        var p2 = matVecMult(leap, p1);//[.5*Math.sin(rad2), 1.2, .5*Math.cos(rad2), 1.0];
        
     

        var  p3; 
        var p4; 
        for(var i = 0; i<12; i++){
            var mat = rotateX(-30*(Math.PI/180)); 
            
            p3 = matVecMult(mat,p1);
            p4 = matVecMult(mat,p2);

        
if (pos<= (864+6)/2){
            vert[pos] = p1;
            vert[pos+1] = p3 ;
            vert[pos+2] = p4;

            vert[pos+3] =p2 ;
            vert[pos+4] =p1 ;
            vert[pos+5] = p4; 
}

else if (pos+6>= 864/2){
            vert[pos] = p1;
            vert[pos+1] = p4 ;
            vert[pos+2] = p3;

            vert[pos+3] =p4 ;
            vert[pos+4] =p1 ;
            vert[pos+5] = p2;
}



            pos+=6; 

            p1 =  p3;
            p2=p4;          

        }
        








    }
for(var i = 0; i< 432; i++){
    var rot  = rotateZ(180 *Math.PI/180);
    vert[i+432] = matVecMult(rot, vert[i]);
}




var boo= translateMat(0,0,-1);
for(var i = 0; i<vert.length; i++){
    vert[i] = matVecMult(boo, vert[i]);
}

boo= rotateZ(90*Math.PI/180);
for(var i = 0; i<vert.length; i++){
    vert[i] = matVecMult(boo, vert[i]);
}

    //RETURN SPHERE VERTICES 
    return vert;
}


/////////////////////////////////////////////////////////////////////
function idle(){
 // mat4x4 = rotateY(0.022);
   //ctms[ctm_index]= matMatMult(mat4x4,ctms[ctm_index]);

    display(); 

    requestAnimationFrame(idle);
}



function main()
{
    canvas = document.getElementById("gl-canvas");
    if(initGL(canvas) == -1)
	return -1;
    if(init() == -1)
	return -1;
    
    //////////////////////////
    canvas.onmousedown = mouseDownCallback;
    canvas.onmouseup = mouseUpCallback;
    canvas.onmousemove = mouseMoveCallback;
    document.onkeydown = keyDownCallback;
    
    display();

    requestAnimationFrame(idle);

}
