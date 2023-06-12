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
