//sheyi Faparusi (oof6 )
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
//=================================================

var model_view_location; 

var model_view =[[1, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1]];

var projection =[[1, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1]];

var frust =[[1, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1]];

var projection_location;

var currentState; // current state for idle to know what to do
var isAnimating;  
var planeNum;

//__________________________________
//[0] holds the index [1] holds the num of vertices 
var planeD = [0,0]; 
var ball1D = [0,0];
var ball2D = [0,0]; 
var ball3D = [0,0];
var ball4D = [0,0];
var lightBD = [0,0];


//==================================================

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
	genWorld();
    var positions = genWorld();/* [
	// First Triangle (the one in the middle)
	[0.0, 0.5, 0.0, 1.0],
	[-0.5, -0.5, 0.0, 1.0],
	[0.5, -0.5, 0.0, 1.0],
    ];


for(var i = 0; i<positions.length; i++){
        var mat4x4 = scalingMat(0.2,.2,0.2);
        positions[i] = matVecMult(mat4x4,positions[i]);
    }*/
    
    var colors = generateColors();
    colors = colors.concat(genColorsSph());
    colors = colors.concat(genColorsSph());
    colors = colors.concat(genColorsSph());
    colors = colors.concat(genColorsSph());

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


    //-----------------------------------------------
    var vNormal_location = gl.getAttribLocation(shaderProgram, "vNormal");
    /*
    if(vNormal_location == -1){
        alert("Unable to locate vNormal");
        return -1; 
    }
    */
    gl.enableVertexAttribArray(vNormal_location);
    // vColor starts at the end of positions
    gl.vertexAttribPointer(vNormal_location, 4, gl.FLOAT, false, 0, 4 * 4 * positions.length);

    //------------------------------------------------

    // Current Transformation Matrix - locate and enable "ctm"
    ctm_location = gl.getUniformLocation(shaderProgram, "ctm");
    if (ctm_location == -1)
    { 
        alert("Unable to locate ctm");
        return -1;
    }
    //==========================================
    //--




    model_view_location = gl.getUniformLocation(shaderProgram, "model_view");
    if (model_view_location == null){
        alert("Unable to locate model_view");
        return -1;
    }

    projection_location = gl.getUniformLocation(shaderProgram, "projection");
    if (projection_location == null){
        alert("Unable to locate projection");
        return -1;
    }

    //============================================
    return 0;
}

function display()
{
    var mat4x4 = rotateY(0); 

    var newC =  matMatMult(mat4x4,ctms[ctm_index]);



    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //===============================
    gl.uniformMatrix4fv(model_view_location, false, to1DF32Array(model_view));
    gl.uniformMatrix4fv(projection_location, false, to1DF32Array(projection));
    //===============================
    // Set the ctm
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(newC));
    // Draw the object
    gl.drawArrays(gl.TRIANGLES, 0, 5000);
}

function keyDownCallback(event)
{
    if(event.keyCode == 32) //instead of tilting back, it should fly up for arial view or back down 
    {
	ctm_index += 1;
	if(ctm_index == 4)
	    ctm_index = 0;

	console.log("Tilting backward " + degs[ctm_index] + " degrees")
	display()
    }

    if(event.keyCode == 87){ //walk forward 
    	console.log("walking forward");
    }
    if(event.keyCode == 65){ //turn left 
    	console.log("turn left");
    }
    if(event.keyCode == 83){ //walk backward 
    	console.log("walking backward");
    }
    if(event.keyCode == 68){ //turn right
    	console.log("turn right");
    }

}


function drawCube(){
    //init array 
    var vert = new Array(36);
    for (var i = 0; i < vert.length; i++) {
        vert[i] = new Array(4);
    }
    var verts = new Array(36);
    for (var i = 0; i < verts.length; i++) {
        verts[i] = new Array(4);
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
    //======================================
    var mat4x4 = translateMat(-0.5, -0.5, -0.5);
    mat4x4 = scalingMat(1, 1, 0.1);
    var verts; 
    for (var i = 0; i< 36; i++){
        verts[i] = matVecMult(mat4x4, vert[i]); 
    //    console.log(verts[i]);
    }

     mat4x4 = translateMat(-0.5, -0.5, -0.5);
    for (var i = 0; i< 36; i++){
        verts[i] = matVecMult(mat4x4, vert[i]); 
    //    console.log(verts[i]);
    }
    return verts; 
}

function generateColors(){

    //init color arr
    var colArr = new Array(planeNum); //one color per triangle
    for (var i = 0; i < colArr.length; i++) {
        colArr[i] = new Array(4);
    }

    for (var i = 0; i < colArr.length; i++) {
        //random values for the colors
        /**
        var val1 = Math.floor(Math.random() * 2);
        var val2 = Math.floor(Math.random() * 2);
        var val3 = Math.floor(Math.random() * 2);
        var val4 = 1.0;
*/

        do{
        	var val1 = Math.floor(Math.random() * 2);
       		var val2 = Math.floor(Math.random() * 2);
	        var val3 = Math.floor(Math.random() * 2);
	        var val4 = 1.0;
        }while(val1==0 && val2 ==0 && val3 == 0);


        colArr[i] = [val1, val2, val3, val4];
        colArr[i+1] = [val1, val2, val3, val4];
        colArr[i+2] = [val1, val2, val3, val4];

        colArr[i+3] = [val1, val2, val3, val4];
        colArr[i+4] = [val1, val2, val3, val4];
        colArr[i+5] = [val1, val2, val3, val4];

        for(var g = 0; g<36; g++){
        	colArr[i+g] = [val1, val2, val3, val4];
        }
        i+= 35;
    } 

    return colArr;


}
function genColorsSph(){
     //init color arr
    var colArr = new Array(); //one color per triangle
    
    for (var i = 0; i<432; i++){
        colArr[i] = [0,0,1,1];
        colArr[i+1] = [0,0,1,1];
        colArr[i+2] = [0,0,1,1];

        colArr[i+3] = [0,0,1,1];
        colArr[i+4] = [0,0,1,1];
        colArr[i+5] = [0,0,1,1];
    }

    for (var i = 0; i<432; i++){
        colArr[432+i] = [0,1,1,1];
        colArr[432+i+1] = [0,1,1,1];
        colArr[432+i+2] = [0,1,1,1];

        colArr[432+i+3] = [0,1,1,1];
        colArr[432+i+4] = [0,1,1,1];
        colArr[432+i+5] = [0,1,1,1];
    }


    return colArr;
}
function look_at(eye, at, up){
    var zPrime = vecVecSub(eye,at);
    zPrime = norm(zPrime); 
    var xPrime = crossProd(up, zPrime); 
    xPrime = norm(xPrime); 
    var yPrime = crossProd(zPrime, xPrime); 
   // yPrime = norm(yPrime);

    var matR = new Array(4); 
    matR[0] = xPrime; 
    matR[1] = yPrime; 
    matR[2] = zPrime; 
    matR[3] = [0,0,0,1]; 

//-------------------------------------
    matR[0][3] = -1* dotProd(xPrime, eye); 
    matR[1][3] = -1* dotProd(yPrime, eye); 
    matR[2][3] = -1* dotProd(zPrime, eye); 
 
    model_view = matR; 
}
function ortho(left, right, bottom, top, near, far){
    var x =  (right+left)/2; 
    var y = (top+bottom)/2; 
    var z = (near+far)/2; 

    var matT = [[1, 0, 0, -x],
                [0, 1, 0, -y],
                [0, 0, 1, -z],
                [0, 0, 0, 1]];

    var xx = 2/(right-left);
    var yy = 2/ (top-bottom);
    var zz = 2/ (near-far); 

    var matS =[[xx, 0, 0, 0],
                [0, yy, 0, 0],
                [0, 0, zz, 0],
                [0, 0, 0, 1]];


    projection = matMatMult(matT, matS); 
}

function idle(){

    var move = rotateY(5*Math.PI/180);
    for(var i = 0; i<ball1D[1]; i++){
        ctms[i+ball1D[0]] = matVecMult(move, ctms[i+ball1D[0]]);
    }



    var mat4x4 = rotateZ(.5 * Math.PI/180);
   
   ctms[ctm_index]= matMatMult(mat4x4,ctms[ctm_index]);

    display(); 

    requestAnimationFrame(idle);
}

//generate a world from the maze 
//x and z to move 
function genWorld(){ 
    var arr = new Array(); 
    var hold= drawCube(); 
    var mat4x4 = scalingMat(0.2,0.2,0.2);
    for(var i = 0; i<hold.length; i++){
        hold[i] = matVecMult(mat4x4, hold[i]);
    }
    mat4x4 =  translateMat(0,.2,0);
    var holdMov = new Array(3);
    for(var i = 0; i<hold.length; i++){
        holdMov[i] = matVecMult(mat4x4, hold[i]);
    }
    arr = arr.concat(holdMov); 
    //arr = arr.concat(hold);

    mat4x4 =  translateMat(0,.2,0);
    for(var i = 0; i<holdMov.length; i++){
        holdMov[i] = matVecMult(mat4x4, holdMov[i]);
    }
    arr = arr.concat(holdMov);
    mat4x4 =  translateMat(0,.2,0);
    for(var i = 0; i<holdMov.length; i++){
        holdMov[i] = matVecMult(mat4x4, holdMov[i]);
    }
    arr = arr.concat(holdMov);
    mat4x4 =  translateMat(0,.2,0);
    for(var i = 0; i<holdMov.length; i++){
        holdMov[i] = matVecMult(mat4x4, holdMov[i]);
    }
    arr = arr.concat(holdMov);

    //right 
    mat4x4 =  translateMat(0.2,0,0);
    for(var i = 0; i<hold.length; i++){
        holdMov[i] = matVecMult(mat4x4, hold[i]);
    }
    arr = arr.concat(holdMov);

    mat4x4 =  translateMat(0.2,0,0);
    for(var i = 0; i<holdMov.length; i++){
        holdMov[i] = matVecMult(mat4x4, holdMov[i]);
    }
    arr = arr.concat(holdMov);

    mat4x4 =  translateMat(0.2,0,0);
    for(var i = 0; i<holdMov.length; i++){
        holdMov[i] = matVecMult(mat4x4, holdMov[i]);
    }
    arr = arr.concat(holdMov);

    mat4x4 =  translateMat(0.2,0,0);
    for(var i = 0; i<holdMov.length; i++){
        holdMov[i] = matVecMult(mat4x4, holdMov[i]);
    }
    arr = arr.concat(holdMov);

    //left 
    mat4x4 =  translateMat(-0.2,0,0);
    for(var i = 0; i<hold.length; i++){
        holdMov[i] = matVecMult(mat4x4, hold[i]);
    }
    arr = arr.concat(holdMov);

    mat4x4 =  translateMat(-0.2,0,0);
    for(var i = 0; i<holdMov.length; i++){
        holdMov[i] = matVecMult(mat4x4, holdMov[i]);
    }
    arr = arr.concat(holdMov);

    mat4x4 =  translateMat(-0.2,0,0);
    for(var i = 0; i<holdMov.length; i++){
        holdMov[i] = matVecMult(mat4x4, holdMov[i]);
    }
    arr = arr.concat(holdMov);

    mat4x4 =  translateMat(-0.2,0,0);
    for(var i = 0; i<holdMov.length; i++){
        holdMov[i] = matVecMult(mat4x4, holdMov[i]);
    }
    arr = arr.concat(holdMov);

    //down
    mat4x4 =  translateMat(0,-0.2,0);
    for(var i = 0; i<hold.length; i++){
        holdMov[i] = matVecMult(mat4x4, hold[i]);
    }
    arr = arr.concat(holdMov);

    mat4x4 =  translateMat(0,-0.2,0);
    for(var i = 0; i<holdMov.length; i++){
        holdMov[i] = matVecMult(mat4x4, holdMov[i]);
    }
    arr = arr.concat(holdMov);

    mat4x4 =  translateMat(0,-0.2,0);
    for(var i = 0; i<holdMov.length; i++){
        holdMov[i] = matVecMult(mat4x4, holdMov[i]);
    }
    arr = arr.concat(holdMov);

    mat4x4 =  translateMat(0,-0.2,0);
    for(var i = 0; i<holdMov.length; i++){
        holdMov[i] = matVecMult(mat4x4, holdMov[i]);
    }
    arr = arr.concat(holdMov);

    //bigger corner cubes    
    var bigger= drawCube();
    var bigger2 = new Array(3);
    mat4x4 = scalingMat(0.8,0.8,0.2);
    for(var i = 0; i<bigger.length; i++){
        bigger2[i] = matVecMult(mat4x4, bigger[i]);
    }

    //top right
    mat4x4 = translateMat(0.5,0.5,0);
    for(var i = 0; i<bigger2.length; i++){
        bigger[i] = matVecMult(mat4x4, bigger2[i]);
    }
    arr = arr.concat(bigger);
    //low left
    mat4x4 = translateMat(-0.5,-0.5,0);
    for(var i = 0; i<bigger2.length; i++){
        bigger[i] = matVecMult(mat4x4, bigger2[i]);
    }
    arr = arr.concat(bigger);
    //top left
    mat4x4 = translateMat(-0.5,0.5,0);
    for(var i = 0; i<bigger2.length; i++){
        bigger[i] = matVecMult(mat4x4, bigger2[i]);
    }
    arr = arr.concat(bigger);

    //low right 
    mat4x4 = translateMat(0.5,-0.5,0);
    for(var i = 0; i<bigger2.length; i++){
        bigger[i] = matVecMult(mat4x4, bigger2[i]);
    }
    arr = arr.concat(bigger);

    planeNum = arr.length;
    planeD = [0,planeNum]; 

    //scale entire world 
    
        mat4x4 = scalingMat(5,5,1);
        for(var i = 0; i<arr.length; i++){
            arr[i] = matVecMult(mat4x4, arr[i]);
        }
    //------------------------------------------------------------
     //spheres
        var sph = genSphere(); 
        var move = translateMat(1.0,0.5,0.0);
        for(var i = 0; i<sph.length; i++){
            sph[i] = matVecMult(move, sph[i]);
        }
        arr = arr.concat(sph);

        ball1D = [arr.length -sph.length,sph.length]; 

        sph = genSphere(); //re init

        move = translateMat(2.0,0.5,0.0);
        for(var i = 0; i<sph.length; i++){
            sph[i] = matVecMult(move, sph[i]);
        }
        arr = arr.concat(sph); 
        ball2D = [arr.length -sph.length,sph.length];
        sph = genSphere();

        move = translateMat(3.0,0.5,0.0);
        for(var i = 0; i<sph.length; i++){
            sph[i] = matVecMult(move, sph[i]);
        }
        arr = arr.concat(sph); 
        ball3D = [arr.length -sph.length,sph.length];
        sph = genSphere();

        move = translateMat(4.0,0.5,0.0); 
        for(var i = 0; i<sph.length; i++){
            sph[i] = matVecMult(move, sph[i]);
        }
        arr = arr.concat(sph); 
        ball4D = [arr.length -sph.length,sph.length];
     
//light bulb
        sph = genSphere();
        move = translateMat(0.0,5.0,0.0); 
        for(var i = 0; i<sph.length; i++){
            sph[i] = matVecMult(move, sph[i]);
        }

         move = scalingMat(0.2,0.2,0.2); 
        for(var i = 0; i<sph.length; i++){
            sph[i] = matVecMult(move, sph[i]);
        }


        arr = arr.concat(sph); 
        lightBD = [arr.length -sph.length,sph.length];





    return arr; 
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






var boo= rotateZ(90*Math.PI/180);
for(var i = 0; i<vert.length; i++){
    vert[i] = matVecMult(boo, vert[i]);
}
    

    //RETURN SPHERE VERTICES 
    return vert;
}







function frustum(left, right, bottom, top, near, far){
	var aVal = (-2*near)/(right-left); 
	var bVal = (-2*near)/(top- bottom);
	var cVal = (left+right)/(right-left);
	var dVal = (bottom +top )/ (top-bottom); 
	var eVal = (near + far) / (far - near);
	var fVal = -((2*near*far)/(far-near));
	
	var arr = 	[[aVal, 0, 0, 0],
				[0, bVal, 0, 0],
				[cVal, dVal, fVal, -1],
				[0, 0, eVal, 0]];

	arr = 	[[aVal, 0, cVal	, 0],
				[0, bVal, dVal, 0],
				[0, 0, eVal, fVal],
				[0, 0, -1, 0]];

	frust = arr;
	projection = arr; 

	
}

//
//------------------------------

function main()
{
    canvas = document.getElementById("gl-canvas");
    if(initGL(canvas) == -1)
	return -1;
    if(init() == -1)
	return -1;

   	look_at([0,4,-15, 0], [0,0,0,0], [0,1,0, 0] );
   
    //look_at([4,5,-4, 0], [4,1,-4,0], [0 ,1,-8, 0] );

	//frustum(-5, 5, -5, 5, -1, -20);
 	//ortho(0, 8, -0, 2, -10, 0);
 
    document.onkeydown = keyDownCallback;
    printMat(model_view	);
    display();

 
    

    requestAnimationFrame(idle);

}