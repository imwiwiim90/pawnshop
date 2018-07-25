function windowGoBack() {
	window.history.back();
}

$(document).ready(function(){
	$('.gp-select').on('click',function(){
		$(this).parent().find('.selected').removeClass('selected');
		$(this).addClass('selected');
	});
});