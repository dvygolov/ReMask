function colapse1(test,obj){
	var name = "one_"+test;
	var names = document.getElementsByName(name);
	for(var k = 0; k < names.length; k++){
		if(names[k].style.display=="none"){
			obj.innerHTML = "-";
			names[k].style.display = "";
		} else {
			obj.innerHTML = "+";
			names[k].style.display = "none";
		}
	}
}
function colapse2(test,obj){
	var name = "two_"+test;
	var names = document.getElementsByName(name);
	for(var k = 0; k < names.length; k++){
		if(names[k].style.display=="none"){
			obj.innerHTML = "-";
			names[k].style.display = "";
		} else {
			obj.innerHTML = "+";
			names[k].style.display = "none";
		}
	}
}