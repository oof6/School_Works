//sheyi faparusi(oof6)


var maze;//global
var depth = 0; 

function initMaze(){
	maze = new Array(17);

	for(var i = 0; i<17; i++){
		maze[i] = new Array(17);
	}
	//init maze to be blank 
	for(var i = 0; i < maze.length; i++){
		for(var n = 0; n < maze[i].length; n++){
			maze[i][n]="";
		}
	}


	//init the edges/outer frame 
	for(var i = 0; i < maze.length; i++){
		if(i % 2 == 0){
			maze[0][i] = "+"; 
			maze[16][i] = "+";
		}
		else if(i % 2 == 1){
			maze[0][i] = "---";
			maze[16][i] = "---";
		}
	}
	for(var i = 0; i < maze.length; i++){
		if(i % 2 == 0){
			maze[i][0] = "+"; 
			maze[i][16] = "+";
		}
		else if(i % 2 == 1){
			maze[i][0] = "|";
			maze[i][16] = "|";
		}
	}
	//
	maze[1][0] = ""; 
	maze[15][16] = "";
}
//-----------------------------------------------------
function maze(){
	initMaze();	

	//recursion?
	mazeR(0, 16, 0, 16);

	return maze;
 
}
//---------------------------------------------------------------------------------
//recursion function 
function mazeR(minX, maxX, minY, maxY) {
	//break condition
	if( maxY - minY <=2 ){
		return; 

	}
	else if(maxX - minX <=2 ){
		return; 

	}


	//random x val
	var ranX;// = Math.floor(Math.random() * (maxX-minX));
	do{
		ranX = Math.floor(Math.random() * (maxX-minX)); //get random x value within bounds
	}while((ranX%2 ==1) || (ranX+minX == maxX) || (ranX+minX == minX)); //get viable val

	var ranY;
	do{
		ranY = Math.floor(Math.random() * (maxY-minY));
	}while((ranY%2 ==1)  || (ranY == maxY) || (ranY+minY == maxY) || (ranY+minY == minY)); //get viable val
	
	//adjust random values
	ranX += minX; 
	ranY += minY;
	
	//console.log(ranX +"  "+ ranY);//---------

	for(var i = minX; i<maxX; i++){
		if(i%2 == 0){
			maze[i][ranY] = "+"; 
		}
		else{
			maze[i][ranY] = "|";
		}
	}
	for(var i = minY; i<maxY; i++){
		if(i%2 == 0){
			maze[ranX][i] = "+"; 
		}
		else{
			maze[ranX][i] = "---";
		}
	}
	
	var leaveOut =Math.floor(Math.random() * (4));	 // choose which wall not to touch 

	if(leaveOut!= 0){
		var zero; 
		do{
		zero = Math.floor(Math.random() * (ranY-minY));
		}while((zero%2 ==0) || (zero == minY));
		
		maze[ranX][zero] = ""; 
	}
	if(leaveOut!= 1){
		var one; 
		do{ 
		one = Math.floor(Math.random() * (ranX-minX));
		}while((one%2 ==0) || (one == minX));
		
		maze[one][ranY] = "";
	}
	if(leaveOut!= 2){
		var two; 
		do{
		two = Math.floor(Math.random() * (maxY-ranY));
		}while((two%2 ==0) || (two == ranY));
		//adjust
		two += minY;
		maze[ranX][two] = "";
	}
	if(leaveOut!= 3){
		var three; 
		do{
		three = Math.floor(Math.random() * (maxX-ranX));
		}while((three%2 ==0) || (three == ranX));

		//adjust 
		three += minX; 
		
		maze[three][ranY] = "";
	}

	mazeR(minX, ranX, minY, ranY);
	mazeR(minX, ranX, ranY, maxY);
	mazeR(ranX, maxX, minY, ranY);
	mazeR(ranX, maxX, ranY, maxY);
	
	return;


 
}

function printMaze(){ //prints out maze in correct format

	for(var i = 0; i < maze.length; i++){
		var str = ""; 
		for(var n = 0; n < maze[i].length; n++){
			str+=maze[i][n];
		}
		console.log(str); 
	}
}


function main(){
	//maze();
	printMaze(); 
}