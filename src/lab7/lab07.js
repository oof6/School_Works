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

// ==============================
var twin_cube_location = [0.0, 0.5, 0.0, 1.0]; // center of mass between two cubes
var left_cube_location = [-0.5, -0.5, 0.0, 1.0];
var right_cube_location = [0.5, -0.5, 0.0, 1.0];
var twin_cube_degree = 0.0;
var left_cube_degree = 0.0;
var right_cube_degree = 0.0;
var twin_cube_ctm = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];
var left_cube_ctm = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];
var right_cube_ctm = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];

var count = 0; 
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
    //=============================
    var positions =[];
    var cubeVertexPositions = drawCube();
    var cubeVertexColors = generateColors();
    var colors = []; 

    //twin cubes 
    for(var i = 0; i < cubeVertexPositions.length; i++){
        var temp_tr1 =translateMat(-0.5, 0.5,0.0);
        temp_tr1 = matMatMult(temp_tr1, scalingMat(-2,-2,-2));
        positions.push(matVecMult(temp_tr1, cubeVertexPositions[i]));
        colors.push(cubeVertexColors[i]);
    }

    for(var i = 0; i < cubeVertexPositions.length; i++)
    {
        var temp_tr2 = translateMat(0.5, 0.5, 0.0);
        temp_tr2 = matMatMult(temp_tr2, scalingMat(-2,-2,-2));
        positions.push(matVecMult(temp_tr2, cubeVertexPositions[i]));
        colors.push(cubeVertexColors[i]);
    }

    //solo cube
    for(var i = 0; i < cubeVertexPositions.length; i++){
        positions.push(cubeVertexPositions[i]);
        colors.push(cubeVertexColors[i]);
    }

    //=============================
 
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
    var n = 36; 

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //===============================
    gl.uniformMatrix4fv(model_view_location, false, to1DF32Array(model_view));
    gl.uniformMatrix4fv(projection_location, false, to1DF32Array(projection));

    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(twin_cube_ctm));
    gl.drawArrays(gl.TRIANGLES, 0, 2 * n);

    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(left_cube_ctm));
    gl.drawArrays(gl.TRIANGLES, 2 * n, n);

    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(right_cube_ctm));
    gl.drawArrays(gl.TRIANGLES, 2 * n, n);
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


}


function drawCube(){ //draws a 1x1 cube in the center
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
    var mat4x4 = translateMat(-0.5, -0.5, 0.5);
    var verts; 
    for (var i = 0; i< 36; i++){
        verts[i] = matVecMult(mat4x4, vert[i]); 
    //    console.log(verts[i]);
    }

    
    return verts; 
}

function generateColors(){

    //init color arr
    var colArr = new Array(36*4 ); //one color per triangle
    for (var i = 0; i < colArr.length; i++) {
        colArr[i] = new Array(4);
    }

    for (var i = 0; i < colArr.length; i++) {
        //random values for the colors
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

       
        i+= 5;
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


function frustum(left, right, bottom, top, near, far){
    var aVal = (-2*near)/(right-left); 
    var bVal = (-2*near)/(top- bottom);
    var cVal = (left+right)/(right-left);
    var dVal = (bottom +top )/ (top-bottom); 
    var eVal = (near + far) / (far - near);
    var fVal = -((2*near*far)/(far-near));
    
    var arr =   [[aVal, 0, 0, 0],
                [0, bVal, 0, 0],
                [cVal, dVal, fVal, -1],
                [0, 0, eVal, 0]];

    arr =   [[aVal, 0, cVal , 0],
                [0, bVal, dVal, 0],
                [0, 0, eVal, fVal],
                [0, 0, -1, 0]];

    frust = arr;
    projection = arr; 

    
}


//------------------------------
function idle(){
    var mat4x4 = rotateY(.3 * Math.PI/180);
    //move center of twins to origin and then back again for rotate 
    var trans = translateMat(0.0,-0.5, 0);
    twin_cube_ctm = matMatMult(trans, twin_cube_ctm);


    twin_cube_ctm= matMatMult(mat4x4,twin_cube_ctm);

    trans = translateMat(0.0, 0.5, 0);
    twin_cube_ctm = matMatMult(trans, twin_cube_ctm);

    //left cube
    //scale cube and translate it
    mat4x4 = scalingMat(-2, -2, -2);
    left_cube_ctm = matMatMult(mat4x4,left_cube_ctm); 

    mat4x4 = rotateZ(.3 * Math.PI/180);
    left_cube_ctm = matMatMult(mat4x4,left_cube_ctm); 

    mat4x4 = translateMat(-0.5, -0.5, 0);
    left_cube_ctm = matMatMult(mat4x4,left_cube_ctm); 
   
    //right cube
    mat4x4 = scalingMat(-2, -2, -2);
    right_cube_ctm = matMatMult(mat4x4,right_cube_ctm); 

    mat4x4 = rotateX(.3 * Math.PI/180);
    right_cube_ctm = matMatMult(mat4x4,right_cube_ctm); 

    mat4x4 = translateMat(0.5, -0.5, 0);
    right_cube_ctm = matMatMult(mat4x4,right_cube_ctm);

    display(); 
    //reset left cube
    mat4x4 = translateMat(0.5, 0.5, 0);
    left_cube_ctm = matMatMult(mat4x4,left_cube_ctm); 
    mat4x4 = scalingMat(2, 2, 2);
    left_cube_ctm = matMatMult(mat4x4,left_cube_ctm); 

    //reset right cube
    mat4x4 = translateMat(-0.5, 0.5, 0);
    right_cube_ctm = matMatMult(mat4x4,right_cube_ctm); 
    mat4x4 = scalingMat(2, 2, 2);
    right_cube_ctm = matMatMult(mat4x4,right_cube_ctm); 

    left_cube_degree = (count*0.3)%360; 
    right_cube_degree = (count*0.3)%360;  
    twin_cube_degree = (count*0.3)%360; 
    count++; 
 //   console.log(left_cube_degree); 


    requestAnimationFrame(idle);
}

function main()
{
    canvas = document.getElementById("gl-canvas");
    if(initGL(canvas) == -1)
    return -1;
    if(init() == -1)
    return -1;
 
    document.onkeydown = keyDownCallback;
    display();

    requestAnimationFrame(idle);


}