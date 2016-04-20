$(document).ready(function() {

	$( ".catalog_item2_characteristics_btn" ).mouseenter(function(){
		$(this).next(".catalog_item2_params").fadeIn(200);
	});
	$( ".catalog_item2_params" ).mouseleave(function(){
		$(this).fadeOut(200);
	});


});