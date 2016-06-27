merge2JsonObjects = function(obj1, obj2){
	var finalobj={};
	for(var _obj in obj1) finalobj[_obj ]=obj1[_obj];
	for(var _obj in obj2) finalobj[_obj ]=obj2[_obj];

	return finalobj;
}
