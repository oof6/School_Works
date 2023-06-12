// Always execute in strict mode (less bug)
//sheyi faparusi(oof6)
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

/* rotate_z(degree)
 *
 * This function returns rotation matric about the z-axis for a given degree.
 *
 * NOTE: This function should not be here. It should be in your library.
 */
function rotate_z(degree)
{
    // A result is a 4 x 4 matrix (column major)
    var result = [
	[1.0, 0.0, 0.0, 0.0],  // first column
	[0.0, 1.0, 0.0, 0.0],  // second column
	[0.0, 0.0, 1.0, 0.0],  // third column
	[0.0, 0.0, 0.0, 1.0]]; // fourth column

    var radian = degree * Math.PI / 180.0;

    result[0][0] = Math.cos(radian);
    result[0][1] = Math.sin(radian);
    result[1][0] = -Math.sin(radian);
    result[1][1] = Math.cos(radian);

    return result;
}

// These variables must be global variables.
// Some callback functions may need to access them.
var gl = null;
var canvas = null;
var ctm_location;
var identity = [[1.0, 0.0, 0.0, 0.0],
		[0.0, 1.0, 0.0, 0.0],
		[0.0, 0.0, 1.0, 0.0],
		[0.0, 0.0, 0.0, 1.0]];
var middle_triangle_ctm = [[1.0, 0.0, 0.0, 0.0],
		           [0.0, 1.0, 0.0, 0.0],
		           [0.0, 0.0, 1.0, 0.0],
		           [0.0, 0.0, 0.0, 1.0]];
var top_right_triangle_ctm = [[1.0, 0.0, 0.0, 0.0],
		              [0.0, 1.0, 0.0, 0.0],
		              [0.0, 0.0, 1.0, 0.0],
		              [0.0, 0.0, 0.0, 1.0]];
var isAnimating = true;
var triangle_position = 0.0;
var position_modifier = 0.01;
var triangle_degree = 0.0;


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
    var positions = [
	// First Triangle (the one in the middle)
	[0.0, 0.5, 0.0, 1.0],
	[-0.5, -0.5, 0.0, 1.0],
	[0.5, -0.5, 0.0, 1.0],
	// Second Triangle (top-right triangle - back of the middle one)
	[0.5, 1.0, -0.5, 1.0],
	[0.0, 0.0, -0.5, 1.0],
	[1.0, 0.0, -0.5, 1.0],
	// Square (in front of the middle one)
	[-0.1, -0.1, 0.5, 1.0],
	[-0.9, -0.1, 0.5, 1.0],
	[-0.1, -0.9, 0.5, 1.0],
	[-0.1, -0.9, 0.5, 1.0],
	[-0.9, -0.1, 0.5, 1.0],
	[-0.9, -0.9, 0.5, 1.0]
    ];

    var colors = [
	// First Triangle (rainbow)
	[1.0, 0.0, 0.0, 1.0],
	[0.0, 1.0, 0.0, 1.0],
	[0.0, 0.0, 1.0, 1.0],
	// Second Triangle (cyan)
	[0.0, 1.0, 1.0, 1.0],
	[0.0, 1.0, 1.0, 1.0],
	[0.0, 1.0, 1.0, 1.0],
	// Square (magenta)
	[1.0, 0.0, 1.0, 1.0],
	[1.0, 0.0, 1.0, 1.0],
	[1.0, 0.0, 1.0, 1.0],
	[1.0, 0.0, 1.0, 1.0],
	[1.0, 0.0, 1.0, 1.0],
	[1.0, 0.0, 1.0, 1.0]
    ];

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

    // Set the ctm of the middle triangle
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(middle_triangle_ctm));
    // Draw the middle triangle
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Set the ctm of the top-right triangle
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(top_right_triangle_ctm));
    // Draw the top-right triangle
    gl.drawArrays(gl.TRIANGLES, 3, 3);

    // Set the ctm of the square
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(identity));
    // Draw the square
    gl.drawArrays(gl.TRIANGLES, 6, 6);
}

function idle()
{
    // Calculate ctm for the middle triangle
    triangle_position += position_modifier;
    if(triangle_position >= 0.5)
	position_modifier = -0.01;
    else if(triangle_position <= -0.5)
	position_modifier = 0.01;

    middle_triangle_ctm = [[1.0, 0.0, 0.0, 0.0],
			   [0.0, 1.0, 0.0, 0.0],
			   [0.0, 0.0, 1.0, 0.0],
			   [triangle_position, 0.0, 0.0, 1.0]];

    // Calculate ctm for the top-right triangle
    triangle_degree += 0.1;
    if(triangle_degree > 360.0)
	triangle_degree = 0.0;

    top_right_triangle_ctm = rotate_z(triangle_degree);

    // Draw
    display();

    if(isAnimating == true)
	requestAnimationFrame(idle);
}

// This function will be called when a mouse button is down inside the canvas.
function mouseDownCallback(event)
{
    console.log("mouseDownCallback(): " +
		"event.which = " + event.which +
		", x = " + (event.clientX - canvas.offsetLeft) +
		", y = " + (event.clientY - canvas.offsetTop));
}

// This function will be called when a mouse button is up inside the canvas
function mouseUpCallback(event)
{
    console.log("mouseUpCallback(): " +
		"event.which = " + event.which +
		", x = " + (event.clientX - canvas.offsetLeft) +
		", y = " + (event.clientY - canvas.offsetTop));
}

// This function will be called when a mouse pointer moves over the canvas.
function mouseMoveCallback(event)
{
    console.log("mouseMoveCallback(): " +
		"event.which = " + event.which +
		", x = " + (event.clientX - canvas.offsetLeft) +
		", y = " + (event.clientY - canvas.offsetTop));
}

// This function will be called when a keyboard is pressed.
function keyDownCallback(event)
{
    console.log("keyDownCallback(): " +
		"event.keyCode = " + event.keyCode)

    if(event.keyCode == 32)
    {
	isAnimating = !isAnimating;
	requestAnimationFrame(idle);
    }
}


//mines
function print4x1(vec){

   
    console.log("["+vec[0].toFixed(4) +" "+vec[1].toFixed(4)+" "+vec[2].toFixed(4)+" " + vec[3].toFixed(4)+"]" );
}

function scalVecMult(s,v){
    var res = [0.0,0.0,0.0,0.0];
    res[0] = v[0] * s;
    res[1] = v[1] * s;
    res[2] = v[2] * s;
    res[3] = v[3] * s;

    return res; 

}
function vecVecAdd(v1,v2){
    var res=[0,0,0,0];
    res[0]=v1[0]+v2[0];
    res[1]=v1[1]+v2[1];
    res[2]=v1[2]+v2[2];
    res[3]=v1[3]+v2[3];
    return res; 
}
function vecVecSub(v1,v2){
    var res=[0.0,0.0,0.0,0.0];

    res[0]=v1[0]-v2[0];
    res[1]=v1[1]-v2[1];
    res[2]=v1[2]-v2[2];
    res[3]=v1[3]-v2[3];

    return res; 

}
function vecMag(v){ //double check
    var yoink; 
    yoink = (v[0]*v[0])+(v[1]*v[1])+(v[2]*v[2])+(v[3]*v[3]);

    var res =Math.sqrt(yoink);

    return res;

}
function norm(v){
    var s = 1/(vecMag(v));
    var res =scalVecMult(s,v);
    return res;

}
function dotProd(v1,v2){ //double check 
    var res = (v1[0]*v2[0])+(v1[1]*v2[1])+(v1[2]*v2[2])+(v1[3]*v2[3]);

    return res; 

}
function crossProd(v1,v2){ //double check
    var res=[0.0,0.0,0.0,0.0];

    res[0] = (v1[1]*v2[2]) - (v1[2]*v2[1]);
    res[1] = (v1[2]*v2[0]) - (v1[0]*v2[2]) ;
    res[2] = (v1[0]*v2[1]) - (v1[1]*v2[0]);
    res[3] = 0.0;

    return res;

}
//matrix functions
function printMat(m){

    console.log("["+m[0][0].toFixed(4) +" "+m[0][1].toFixed(4)+" "+m[0][2].toFixed(4)+" " + m[0][3].toFixed(4)+"]" );
    console.log("["+m[1][0].toFixed(4) +" "+m[1][1].toFixed(4)+" "+m[1][2].toFixed(4)+" " + m[1][3].toFixed(4)+"]" );
    console.log("["+m[2][0].toFixed(4) +" "+m[2][1].toFixed(4)+" "+m[2][2].toFixed(4)+" " + m[2][3].toFixed(4)+"]" );
    console.log("["+m[3][0].toFixed(4) +" "+m[3][1].toFixed(4)+" "+m[3][2].toFixed(4)+" " + m[3][3].toFixed(4)+"]" );

}
function scalMat(s,m){ //multiple matrix by scalar
    var res = [
    [0.0, 0.0, 0.0, 0.0],  // first column
    [0.0, 0.0, 0.0, 0.0],  // second column
    [0.0, 0.0, 0.0, 0.0],  // third column
    [0.0, 0.0, 0.0, 0.0]];


    res[0] = scalVecMult(s,m[0]);
    res[1] = scalVecMult(s,m[1]);
    res[2] = scalVecMult(s,m[2]);
    res[3] = scalVecMult(s,m[3]);


    return res;


}
function matMatAdd(m1,m2){
    var res = [
    [0.0, 0.0, 0.0, 0.0],  // first column
    [0.0, 0.0, 0.0, 0.0],  // second column
    [0.0, 0.0, 0.0, 0.0],  // third column
    [0.0, 0.0, 0.0, 0.0]];

    res[0] = vecVecAdd(m1[0],m2[0]);
    res[1] = vecVecAdd(m1[1],m2[1]);
    res[2] = vecVecAdd(m1[2],m2[2]);
    res[3] = vecVecAdd(m1[3],m2[3]);

    return res; 


}
function matMatSub(m1,m2){
    var res = [
    [0.0, 0.0, 0.0, 0.0],  // first column
    [0.0, 0.0, 0.0, 0.0],  // second column
    [0.0, 0.0, 0.0, 0.0],  // third column
    [0.0, 0.0, 0.0, 0.0]];

    res[0] = vecVecSub(m1[0],m2[0]);
    res[1] = vecVecSub(m1[1],m2[1]);
    res[2] = vecVecSub(m1[2],m2[2]);
    res[3] = vecVecSub(m1[3],m2[3]);

    return res; 

}
function matVecMult(m,v){//double check
    var res = [0.0,0.0,0.0,0.0];

    res = scalVecMult(v[0],m[0]);
    res = vecVecAdd(res, scalVecMult(v[1],m[1]));
    res = vecVecAdd(res, scalVecMult(v[2],m[2]));
    res = vecVecAdd(res, scalVecMult(v[3],m[3]));

    return res;
}
function matMatMult(m1,m2){ //double heck
    var res = [
    [0.0, 0.0, 0.0, 0.0],  // first column
    [0.0, 0.0, 0.0, 0.0],  // second column
    [0.0, 0.0, 0.0, 0.0],  // third column
    [0.0, 0.0, 0.0, 0.0]];

////////
res[0] =matVecMult(m1,m2[0]);
res[1] =matVecMult(m1,m2[1]);
res[2] =matVecMult(m1,m2[2]);
res[3] =matVecMult(m1,m2[3]);

    return res;


}
function transMat(m){ //double check
    var res = [
    [0.0, 0.0, 0.0, 0.0],  // first column
    [0.0, 0.0, 0.0, 0.0],  // second column
    [0.0, 0.0, 0.0, 0.0],  // third column
    [0.0, 0.0, 0.0, 0.0]];

    res[0][0] = m[0][0];
    res[0][1] = m[1][0];
    res[0][2] = m[2][0];
    res[0][3] = m[3][0];

    res[1][0] = m[0][1];
    res[1][1] = m[1][1];
    res[1][2] = m[2][1];
    res[1][3] = m[3][1];

    res[2][0] = m[0][2];
    res[2][1] = m[1][2];
    res[2][2] = m[2][2];
    res[2][3] = m[3][2];

    res[3][0] = m[0][3];
    res[3][1] = m[1][3];
    res[3][2] = m[2][3];
    res[3][3] = m[3][3];

    return res;

}
function minorHelp(m){ //double check
    var res =0.0; 

    res = (m[0][0]*m[1][1]*m[2][2]) + (m[1][0]*m[2][1]*m[0][2]) + (m[2][0]*m[0][1]*m[1][2]) - (m[0][2]*m[1][1]*m[2][0]) - (m[1][2]*m[2][1]*m[0][0]) - (m[2][2]*m[0][1]*m[1][0]);

    return res;
}
function matMinor(m){ //double check
    var res = [
    [0.0, 0.0, 0.0, 0.0],  // first column
    [0.0, 0.0, 0.0, 0.0],  // second column
    [0.0, 0.0, 0.0, 0.0],  // third column
    [0.0, 0.0, 0.0, 0.0]];

    var mHelp = [
    [m[1][1], m[1][2], m[1][3]],
    [m[2][1], m[2][2], m[2][3]],
    [m[3][1], m[3][2], m[3][3]]];
    res[0][0] = minorHelp(mHelp);

    mHelp = [
    [m[1][0], m[1][2], m[1][3]],
    [m[2][0], m[2][2], m[2][3]],
    [m[3][0], m[3][2], m[3][3]]];
    res[0][1] = minorHelp(mHelp);

    mHelp = [
    [m[1][0], m[1][1], m[1][3]],
    [m[2][0], m[2][1], m[2][3]],
    [m[3][0], m[3][1], m[3][3]]];
    res[0][2] = minorHelp(mHelp);

    mHelp = [
    [m[1][0], m[1][1], m[1][2]],
    [m[2][0], m[2][1], m[2][2]],
    [m[3][0], m[3][1], m[3][2]]];
    res[0][3] = minorHelp(mHelp);

    //
    mHelp = [
    [m[0][1], m[0][2], m[0][3]],
    [m[2][1], m[2][2], m[2][3]],
    [m[3][1], m[3][2], m[3][3]]];
    res[1][0] = minorHelp(mHelp);

    mHelp = [
    [m[0][0], m[0][2], m[0][3]],
    [m[2][0], m[2][2], m[2][3]],
    [m[3][0], m[3][2], m[3][3]]];
    res[1][1] = minorHelp(mHelp);

    mHelp = [
    [m[0][0], m[0][1], m[0][3]],
    [m[2][0], m[2][1], m[2][3]],
    [m[3][0], m[3][1], m[3][3]]];
    res[1][2] = minorHelp(mHelp);
    
    mHelp = [
    [m[0][0], m[0][1], m[0][2]],
    [m[2][0], m[2][1], m[2][2]],
    [m[3][0], m[3][1], m[3][2]]];
    res[1][3] = minorHelp(mHelp);

    //
    mHelp = [
    [m[0][1], m[0][2], m[0][3]],
    [m[1][1], m[1][2], m[1][3]],
    [m[3][1], m[3][2], m[3][3]]];
    res[2][0] = minorHelp(mHelp);

    mHelp = [
    [m[0][0], m[0][2], m[0][3]],
    [m[1][0], m[1][2], m[1][3]],
    [m[3][0], m[3][2], m[3][3]]];
    res[2][1] = minorHelp(mHelp);

    mHelp = [
    [m[0][0], m[0][1], m[0][3]],
    [m[1][0], m[1][1], m[1][3]],
    [m[3][0], m[3][1], m[3][3]]];
    res[2][2] = minorHelp(mHelp);

    mHelp = [
    [m[0][0], m[0][1], m[0][2]],
    [m[1][0], m[1][1], m[1][2]],
    [m[3][0], m[3][1], m[3][2]]];
    res[2][3] = minorHelp(mHelp);
    //

    mHelp = [
    [m[0][1], m[0][2], m[0][3]],
    [m[1][1], m[1][2], m[1][3]],
    [m[2][1], m[2][2], m[2][3]]];
    res[3][0] = minorHelp(mHelp);

    mHelp = [
    [m[0][0], m[0][2], m[0][3]],
    [m[1][0], m[1][2], m[1][3]],
    [m[2][0], m[2][2], m[2][3]]];
    res[3][1] = minorHelp(mHelp);

    mHelp = [
    [m[0][0], m[0][1], m[0][3]],
    [m[1][0], m[1][1], m[1][3]],
    [m[2][0], m[2][1], m[2][3]]];
    res[3][2] = minorHelp(mHelp);

    mHelp = [
    [m[0][0], m[0][1], m[0][2]],
    [m[1][0], m[1][1], m[1][2]],
    [m[2][0], m[2][1], m[2][2]]];
    res[3][3] = minorHelp(mHelp);



    return res;
}
function coFact(m){ //double check
    var res = [
    [0.0, 0.0, 0.0, 0.0],  // first column
    [0.0, 0.0, 0.0, 0.0],  // second column
    [0.0, 0.0, 0.0, 0.0],  // third column
    [0.0, 0.0, 0.0, 0.0]];


    res[0][0] = m[0][0];
    res[0][1] = (-1)*m[0][1];
    res[0][2] = m[0][2];
    res[0][3] = (-1)*m[0][3];

    res[1][0] = (-1)*m[1][0];
    res[1][1] = m[1][1];
    res[1][2] = (-1)*m[1][2];
    res[1][3] = m[1][3];

    res[2][0] = m[2][0];
    res[2][1] = (-1)*m[2][1];
    res[2][2] = m[2][2];
    res[2][3] = (-1)*m[2][3];

    res[3][0] = (-1)*m[3][0];
    res[3][1] = m[3][1];
    res[3][2] = (-1)*m[3][2];
    res[3][3] = m[3][3];



    return res;
}



function invMat(m){ //double check
    var res = [
    [0.0, 0.0, 0.0, 0.0],  // first column
    [0.0, 0.0, 0.0, 0.0],  // second column
    [0.0, 0.0, 0.0, 0.0],  // third column
    [0.0, 0.0, 0.0, 0.0]];

    var minor = [
    [0.0, 0.0, 0.0, 0.0],  // first column
    [0.0, 0.0, 0.0, 0.0],  // second column
    [0.0, 0.0, 0.0, 0.0],  // third column
    [0.0, 0.0, 0.0, 0.0]];

    var coFactMin = [
    [0.0, 0.0, 0.0, 0.0],  // first column
    [0.0, 0.0, 0.0, 0.0],  // second column
    [0.0, 0.0, 0.0, 0.0],  // third column
    [0.0, 0.0, 0.0, 0.0]];

    var tranCoFact = [
    [0.0, 0.0, 0.0, 0.0],  // first column
    [0.0, 0.0, 0.0, 0.0],  // second column
    [0.0, 0.0, 0.0, 0.0],  // third column
    [0.0, 0.0, 0.0, 0.0]];

    var determinant =0.0;

    /////
    //find matrix minor of og matrix
    minor = matMinor(m);

    //matrix coFact minor
    coFactMin= coFact(minor);

    //trans cofact
    tranCoFact = transMat(coFactMin);

    //determinant of m
    determinant = (m[0][0]*minor[0][0]) - (m[0][1]*minor[0][1]) + (m[0][2]*minor[0][2]) - (m[0][3]*minor[0][3]);

    //tada 
    res= scalMat((1/determinant),tranCoFact);


    return res;
}

























function main()
{
    canvas = document.getElementById("gl-canvas");
    if(initGL(canvas) == -1)
	return -1;
    if(init() == -1)
	return -1;


    var v1 = [1,2,3,4];
    var v2 = [5,6,7,8];

    var m1 = [
    [1.0, 2.0, 3.0, 4.0],  // first column
    [-5.0, 6.0, 7.0, 8.0],  // second column
    [9.0, -10.0, 11.0, 12.0],  // third column
    [13.0, 14.0, 15.0, -16.0]];

    var m2 = [
    [4.0, 3.0, 2.0, 1.0],  // first column
    [8.0, 7.0, 6.0, 5.0],  // second column
    [12.0, 11.0, 10.0, 9.0],  // third column
    [16.0, 15.0, 14.0, 13.0]];

    var s = 3.0;


    // Register callback functions
    // Comment out those that are not used.
    //canvas.onmousedown = mouseDownCallback;
    //canvas.onmouseup = mouseUpCallback;
    //canvas.onmousemove = mouseMoveCallback;
    //document.onkeydown = keyDownCallback;
    /**
    document.ready = print4x1(vec);
    document.ready = print4x1(vecVecSub(vec,vec2));
    console.log("");
    document.ready = printMat(matMatAdd(result,result2));
*/
//tests
//////////////////
    document.ready = console.log("vector v1:");
    document.ready = print4x1(v1);
    document.ready = console.log("vector v2:");
    document.ready = print4x1(v2);
    document.ready = console.log("scalar s: " + s);
    
    document.ready = console.log("s * v1: ");
    document.ready = print4x1(scalVecMult(s,v1));
    document.ready = console.log("v1 + v2: ");
    document.ready = print4x1(vecVecAdd(v1,v2));
    document.ready = console.log("v1 - v2: ");
    document.ready = print4x1(vecVecSub(v1,v2));
    document.ready = console.log("|v1|(magnitude): " + vecMag(v1));

    //document.ready = console.log(vecMag(v1));
    document.ready = console.log("Normalized v1: ");
    document.ready = print4x1(norm(v1));
    document.ready = console.log("v1 . v2 (dot product): ");
    document.ready = console.log(dotProd(v1,v2));
    document.ready = console.log("v1 x v2 (cross product): ");
    document.ready = print4x1(crossProd(v1,v2));
    document.ready = console.log("Matrix m1: ");
    document.ready = printMat(m1);

    document.ready = console.log("Matrix m2: ");
    document.ready = printMat(m2);

    document.ready = console.log("s * m1: ");
    document.ready = printMat(scalMat(s,m1));
    document.ready = console.log("m1 + m2: ");
    document.ready = printMat(matMatAdd(m1,m2));
    document.ready = console.log("m1 - m2: ");
    document.ready = printMat(matMatSub(m1,m2));
    document.ready = console.log("m1 * m2: ");
    document.ready = printMat(matMatMult(m2,m1));
    document.ready = console.log("m1^T (transpose) : ");

    document.ready = printMat(transMat(m1));
    document.ready = console.log("m1^{-1} (inverse) : ");
    document.ready = printMat(invMat(m1));
    document.ready = console.log("m1 * v1: ");
    document.ready = print4x1(matVecMult(m1,v1));
    document.ready = console.log("m1 * m1^{-1}: ");
    document.ready = printMat(matMatMult(m1,invMat(m1)));
    document.ready = console.log("m1^{-1} * m1: ");

    document.ready = printMat(matMatMult(invMat(m1),m1));

/////////////////////////////////
    display();

    if(isAnimating)
        requestAnimationFrame(idle);
}
