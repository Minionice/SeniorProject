//GLOBAL VARIABLE SECTION
//This section initializes data placeholders for global data

var ct=0; //Used for naming
var statesList=[]; //Stores all states of the array
var selectedState=null; //The selected state
var mainSVG=SVG().addTo('#svg-cover').size(1100, 800);
var startState=null;
var currState=null; //Used to indicate the current progression of the input string
var loadedString=null; //Indicates the loaded string in its entirety
var currentString=null; //Indicates the string in its current form in the automaton
var currStringIndex=0; //Indicates the index of the first character of the current string relative to the loaded string
var stateStack=[]; //Used to backtrack through characters of a loaded string
var transitionStack=[]; //Used to backtrack through characters of a loaded string (needed for lambda-transitions)

//CONSTRUCTOR SECTION
//This section defines the "classes" for the key objects as well as related graphics functions

class State{
	constructor(){
		var obj=this; //Needed for a different reference to the state object
		this.name="q"+ct++;
		this.transitions=[];
		this.accepting=false;
		states.push(this); //Add state to global array
		this.group=mainSVG.group();
		this.group.draggy().draggable();
		this.circle=this.group.circle(100).attr({stroke: '#000'}).mousemove(function(){
			updateTransitionSymbols(obj);
		});
		this.circle.fill("#f00");
		this.text=this.group.text(this.name).move(40, 40);
		this.group.click(()=>{ //Need to use an arrow function for the this keyword
			selectState(this);
		});
	}
}

function populateTextFromCharArray(arr){
	var str="";
	str+=arr[0];
	for(int i=1; i<arr.length; i++){
		str+="\n"+arr[i];
	}
	return str;
}

class Transition{
	constructor(start, end, chara){
		this.group=mainSVG.group();
		this.start=start;
		this.end=end;
		this.characters=[chara];
		this.start.outgoing.push(this);
		this.end.incoming.push(this);
		this.connector=this.start.group.connectable({
			container: mainSVG.group(),
			markers: mainSVG.group(),
			marker: 'default',
			type: 'straight',
			sourceAttach: 'perifery',
			targetAttach: 'perifery'},
			this.end.group);
		this.text=this.group.text(populateTextFromCharArray(this.characters))
			.attr({x: (this.start.group.x()+this.end.group.x())*2/3, y: (this.start.group.y()+this.end.group.y())*2/3});
	}
}

//Recreates the text for the transition
function repopulateTransitionText(transition, arr){
	transition.characters=arr;
	transition.text.remove();
	transition.text=transition.group.text(populateTextFromCharArray(transition.characters))
		.attr({x: (transition.start.group.x()+transition.end.group.x())*2/3, y: (transition.start.group.y()+transition.end.group.y())*2/3});
}

//Used to update the text the appears near each transition to indicate the transition character
function updateAllTransitionSymbols(someState){
	for(let i=0; i<someState.transitions.length; i++){
		var st=someState.transitions[i].start;
		var en=someState.transitions[i].end;
		someState.transitions[i].text.move((st.group.x()+en.group.x())*2/3, (st.group.y()+en.group.y())*2/3);
	}
}

//STATE FUNCTION SECTION
//This section provides the functions used to manipulate the states

//Returns the State object associated with the name or null if it does not exist
function findState(str){
	for(let i=0; i<statesList.length; i++){
		if(statesList[i].name==str){
			return statesList[i];
		}
	}
	return null;
}

function addState(){
	statesList.push(new State());
}

function deleteState(){
	var stateString=prompt("Enter the name of the state to be deleted.");
	var removed=null;
	//Remove the appropriate element
	for(let i=0; i<statesList.length; i++){
			removed=statesList.splice(i, 1)[0];
			break;
		}
	}
	if(startState==removed){startState=null;}
	if(currState==removed){currState=null;}
	removed.group.remove();
}

//Changes the selected state
function selectState(state){
	if(selectedState!=null){
		selectedState.circle.fill("#f00");
	}
	selectedState=state;
	selectedState.circle.fill("#999");
}

//Pulls up a prompt to rename the selected state
function renameState(){
	name=prompt("Enter a new name for the selected state.");
	if(findState(name)==null){
		selectedState.text.clear();
		selectedState.name=name;
		selectedState.text.plain(name);
	}
}

//Makes the selected state the start state
function selectStartState(){
	if(startState!=null){
		startState.text.font({fill: 'black'});
	}
	startState=selectedState;
	selectedState.text.font({fill: 'yellow'});
	alert("The start state is now "+startState.name+".");
}

function toggleAcceptingState(){
	if(selectedState!=null){
		if(selectedState.accepting==true){
			selectedState.accepting=false;
			selectedState.group.circ2.remove();
		}
		else{
			selectedState.accepting=true;
			selectedState.group.circ2=selected.group.circle(80).move(selectedState.circle.x()+10, selectedState.circle.y()+10).attr({'fill-opacity': 0.0, stroke: '#000'});
		}
	}
}
//Background function to change the current state for an input
function selectCurrState(state){
	if(currState!=null){
		currState.circle.fill("#f00");
	}
	currState=state;
	currState.circle.fill("#88f");
}

//TRANSITIONS SECTION
//This section provides the functions used to manipulate transitions

//Adds a transition given two state names and a character
function addTransition(){
	starta=findState(prompt("Enter the name of the start state."));
	enda=findState(prompt("Enter the name of the end state."));
	singChar=prompt("Enter a one-character string as the transition character.");
	if(starta!=null&&enda!=null&&singChar.length<=1){ //Account for lambda-transitions
		new Transition(starta, enda, singChar);
	}
}

function deleteTransition(){
	var st=prompt("Enter the name of the starting point of the transition: ");
	var en=prompt("Enter the name of the endpoint of the transition: ");
	var ch=prompt("Enter the transition character: ");
	var sstate=findState(st);
	if(sstate!=null){
		var removedTransition=null;
		for(let i=0; i<sstate.outgoing.length; i++){
			var out=sstate.outgoing[i];
			if(out.chara==ch&&out.end.name==en){
				for(let j=0; j<out.end.incoming.length; j++){
					if(out.end.incoming[j].start.name==sstate.name){
						removedTransition=out.end.incoming.splice(j, 1)[0];
						sstate.outgoing.splice(i, 1);
						break;
					}
				}
				break;
			}
		}
		removedTransition.connector.connector.remove();
		removedTransition.connector=null;
		removedTransition.text.remove();
	}
}

//Takes a character and a state and returns an array of viable transitions
function findTransitions(ch, state){
	var arr=[];
	for(let i=0; i<state.transitions.length; i++){
		if(state.transitions[i].chara==ch){
			arr.push(state.transitions[i]);
		}
	}
	return arr;
}

//TOTAL INPUT SECTION
//This sections deals with the ability for the user to test whether a string is accepted

//Returns true if a string is accepted by the automaton and prints the result of the test
function acceptString(){
	str=prompt("Enter an input string.");
	if(start!=null){
		var bool=acceptOrReject(str, start);
		if(bool){
			alert("Accepted!");
		}
		else{
			alert("Rejected!");
		}
	}
	else{
		alert("Error: Invalid state name");
	}
}

//Actual recursive algorithm that takes in a string parameter
function acceptOrReject(str, someState){
	var bool=false;
	if(str==""){
		bool=someState.accepting;
	}
	else{
		for(let i=0; i<someState.outgoing.length; i++){
			if(someState.outgoing[i].chara==""||str.substring(0,1)==someState.outgoing[i].chara){
				bool=bool||acceptOrReject(str.substring(1), someState.outgoing[i].end);
			}
		}
	}
	return bool;
}

//THOROUGH TEST SECTION
//This section deals with operations involving step-by-step input analysis of strings

function loadString(){
	if(start!=null){
		loadedString=prompt("Enter the string to be loaded: ");
		currentString=loadedString;
		currStringIndex=0;
		selectCurrState(start)
	}
	else{
		alert("Error: No start state set");
	}
}

//Advances the current state by the transition given a string
//Returns true if at least one outgoing transition has that character
function advance(){
	if(currentString.length>0){
		var arrOfOutgoingTransitions=findOutgoingTransitions(currentString.substring(0, 1), currState);
		if(arrOfOutgoingTransitions.length==0){
			alert("Error: Cannot advance input due to lack of transitions");
		}
		else{
			var nameOfNextState=arrOfOutgoingTransitions[0].end.name;
			prevTransition=arrOfOutgoingTransitions[0];
			if(arrOfOutgoingTransitions.length>1){
				var tempName=prompt("Enter the name of the next desired state: ");
				for(let i=0; i<arrOfOutgoingTransitions.length; i++){
					if(tempName==arrOfOutgoingTransitions[i].end.name){
						nameOfNextState=tempName;
						prevTransition=arrOfOutgoingTransitions[i];
						break;
					}
				}
			}
			if(prevTransition.chara!=""){
				currentString=currentString.substring(1);
				currStringIndex+=1;
			}
			stateStack.push(currState);
			selectCurrState(findState(nameOfNextState));
		}
	}
}

function backtrack(){
	if(currStringIndex!=0){
		selectCurrState(stateStack.pop());
		currStringIndex-=1;
		currentString=loadedString.substring(currStringIndex, currStringIndex+1)+currentString;
	}
}

//Wipe the loaded information (used if the automaton is updated during the input analysis)
function wipeLoadedInfo(){
	stateStack=[];
	transitionStack=[];
	loadedString=null;
	currentString=null;
}
