function colapse1(test,obj){
	let name = "one_"+test;
	let names = document.getElementsByName(name);
	for(let k = 0; k < names.length; k++){
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
	let name = "two_"+test;
	let names = document.getElementsByName(name);
	for(let k = 0; k < names.length; k++){
		if(names[k].style.display=="none"){
			obj.innerHTML = "-";
			names[k].style.display = "";
		} else {
			obj.innerHTML = "+";
			names[k].style.display = "none";
		}
	}
}