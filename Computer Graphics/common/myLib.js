/* to1DF32Array(a2DArray)
 *
 * This function turns an array of 4-element arrays a2DArray into a packed
 * 1-dimensional array of 32-bit floating-point numbers.
 */

function to1DF32Array(a2DArray)
{
    var size = a2DArray.length;

    if(size == 0)
    {
        console.log("[mylib/to1DF32Array - DEBUG]: size is 0");
        return new Float32Array([]);
    }
    
    var result = [];
    var index = 0;

    for(var i = 0; i < size; i++)
    {
        var anElement = a2DArray[i];
        
        if(anElement.length != 4)
            console.log("[mylib/to1DF32Array - ERROR]: Not a 4-element vector");
        
        result[index] = anElement[0];
        result[index + 1] = anElement[1];
        result[index + 2] = anElement[2];
        result[index + 3] = anElement[3];
        index += 4;
    }

    return new Float32Array(result);
}

function rotate_z(degree)
{
    var result = [
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]];

    var radian = degree * Math.PI / 180.0;

    result[0][0] = Math.cos(radian);
    result[0][1] = Math.sin(radian);
    result[1][0] = -Math.sin(radian);
    result[1][1] = Math.cos(radian);

    return result;
}
////////////////////////////////////////////////////////////////////
//lab2
//prints out a vector 
function print4x1(vec){

   
    console.log("["+vec[0].toFixed(4) +" "+vec[1].toFixed(4)+" "+vec[2].toFixed(4)+" " + vec[3].toFixed(4)+"]" );
}
    //scaler * vector
function scalVecMult(s,v){
    var res = [0.0,0.0,0.0,0.0];
    res[0] = v[0] * s;
    res[1] = v[1] * s;
    res[2] = v[2] * s;
    res[3] = v[3] * s;

    return res; 

}
//add two vectors
function vecVecAdd(v1,v2){
    var res=[0,0,0,0];
    res[0]=v1[0]+v2[0];
    res[1]=v1[1]+v2[1];
    res[2]=v1[2]+v2[2];
    res[3]=v1[3]+v2[3];
    return res; 
}
//subtract two vectors 
function vecVecSub(v1,v2){
    var res=[0.0,0.0,0.0,0.0];

    res[0]=v1[0]-v2[0];
    res[1]=v1[1]-v2[1];
    res[2]=v1[2]-v2[2];
    res[3]=v1[3]-v2[3];

    return res; 

}
//magnitude of a vector (|v|)
function vecMag(v){ //double check
    var yoink; 
    yoink = (v[0]*v[0])+(v[1]*v[1])+(v[2]*v[2])+(v[3]*v[3]);

    var res =Math.sqrt(yoink);

    return res;

}
//normalize a vector
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

//print out the matrix
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
//add two matrices together
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
//subtract two matrices from each other
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

/////////////////////////////////////////////////////////////////////

function translateMat(x,y,z){ //done - double check 
    var affine = [
    [1.0, 0.0, 0.0, 0.0],
    [0.0, 1.0, 0.0, 0.0],
    [0.0, 0.0, 1.0, 0.0],
    [x, y, z, 1.0]];

    return affine;
}

function scalingMat(x,y,z){ //done
    if (x>=0) {
    var affine = [
    [x, 0.0, 0.0, 0.0],
    [0.0, y, 0.0, 0.0],
    [0.0, 0.0, z, 0.0],
    [0.0, 0.0, 0.0, 1.0]];
    }
    else {
        var affine = [
    [Math.abs(1/x), 0.0, 0.0, 0.0],
    [0.0, Math.abs(1/y), 0.0, 0.0],
    [0.0, 0.0, Math.abs(1/z), 0.0],
    [0.0, 0.0, 0.0, 1.0]];
    }


    return affine;
}
function rotateX(theta){
    var affine = [
    [1.0, 0.0, 0.0, 0.0],
    [0.0, Math.cos(theta), Math.sin(theta), 0.0],
    [0.0, -Math.sin(theta), Math.cos(theta), 0.0],
    [0.0, 0.0, 0.0, 1.0]];

    return affine;
}
function rotateY(theta){
    var affine = [
    [Math.cos(theta), 0.0, -Math.sin(theta), 0.0],
    [0.0, 1.0, 0.0, 0.0],
    [Math.sin(theta), 0.0, Math.cos(theta), 0.0],
    [0.0, 0.0, 0.0, 1.0]];

    return affine;
}
function rotateZ(theta){
    var affine = [
    [Math.cos(theta), Math.sin(theta), 0.0, 0.0],
    [-Math.sin(theta), Math.cos(theta), 0.0, 0.0],
    [0.0, 0.0, 1.0, 0.0],
    [0.0, 0.0, 0.0, 1.0]];

    return affine;
}