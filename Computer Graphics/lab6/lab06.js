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

var projection_location;





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
    var positions = drawCube(); /** [
	// First Triangle (the one in the middle)
	[0.0, 0.5, 0.0, 1.0],
	[-0.5, -0.5, 0.0, 1.0],
	[0.5, -0.5, 0.0, 1.0],
    ];
*/
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
    var mat4x4 = rotateY(30*Math.PI/180); 

    var newC =  matMatMult(mat4x4,ctms[ctm_index]);



    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //===============================
    gl.uniformMatrix4fv(model_view_location, false, to1DF32Array(model_view));
    gl.uniformMatrix4fv(projection_location, false, to1DF32Array(projection));
    //===============================
    // Set the ctm
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(newC));
    // Draw the object
    gl.drawArrays(gl.TRIANGLES, 0, 36);
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
    var verts; 
    for (var i = 0; i< 36; i++){
        verts[i] = matVecMult(mat4x4, vert[i]); 
        console.log(verts[i]);
    }
    return verts; 
}

function generateColors(){

    //init color arr
    var colArr = new Array(1000); //one color per triangle
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

        colArr[i+3] = [val1, val2, val3, val4];
        colArr[i+4] = [val1, val2, val3, val4];
        colArr[i+5] = [val1, val2, val3, val4];
        i+=5;
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
 




    var matT = translateMat(-eye[0], -eye[1], -eye[2]);/** [[1, 0, 0, eye[0]],
                [0, 1, 0, eye[1]],
                [0, 0, 1, eye[2]],
                [0, 0, 0, 1]];
*/
    


    var res = matMatMult(matR, matT);
   // res[2][3] = res[3][1];
    //res[3][1] = 0;
//    res = matMatMult(matT, matR);

    model_view = res; 
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
    var mat4x4 = rotateZ(.5 * Math.PI/180);
    //mat4x4 = rotateX(.5 * Math.PI/180);

 // mat4x4 = matMatMult(mat4x4, rotateZ(1*Math.PI/180));
 // mat4x4 = matMatMult(mat4x4, rotateX(1*Math.PI/180));
   ctms[ctm_index]= matMatMult(mat4x4,ctms[ctm_index]);

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

    look_at([0,1,1, 0], [0,0,0,0], [0,1,0, 0] );
    printMat(model_view);

   ortho(-2, 2, -1, 1, -1, -15);
 //  ortho(hold[0]-1, hold[0]+1, hold[1]-1, hold[1]+1, hold[2]+1, hold[2]-1);
    //ortho(-1, 1, 0,1, 2, 0);

    document.onkeydown = keyDownCallback;
    
    display();

    requestAnimationFrame(idle);

}
