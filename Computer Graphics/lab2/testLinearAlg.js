function main()
{


    var v1 = [10.05,72.63,-82.17,-81.15];
    var v2 = [-78.40, -22.40, 89.17, -71.11];

    var m1 = [
    [-47.28, -15.54, 50.58, -75.31],  // first column
    [-24.87, -71.42, -70.05, 66.31],  // second column
    [19.07, -17.87, 4.77, 79.18],  // third column
    [90.39, -44.49, 13.44, 7.29]];

    var m2 = [
    [-28.44, 72.09, 47.66, -82.19],  // first column
    [94.60, -66.39, 11.38, 67.11],  // second column
    [64.76, 97.18, -34.10, 59.25],  // third column
    [17.61, 81.95, 91.14, 92.48]];

    var s =  -85.64;


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
    document.ready = printMat(matMatMult(m1,m2));
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

    document.ready = console.log();
    //inverseof m2 
    document.ready = console.log("inverse m2");
    document.ready = printMat(invMat(m2));
    //normalize v2
    document.ready = console.log("normalize v2");
    document.ready = print4x1(norm(v2));
    //m2*m1
    document.ready = console.log("m2 *m1");
    document.ready = printMat(matMatMult(m2,m1));









/////////////////////////////////
  
}