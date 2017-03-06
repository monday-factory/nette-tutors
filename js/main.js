function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

$(document).ready(function() {
	if (!getCookie("cookies-agreement")) {
		$('.cookies-agreement').show();
	}
});

$('.cookies-agreement a.success-text-color').click(function() {
  var date;
  console.log('s');
  date = new Date();
  date.setFullYear(date.getFullYear() + 10);
  document.cookie = 'cookies-agreement=1; path=nette-forms.mondayfactory.com; expires=' + date.toGMTString();
  return $('.cookies-agreement').addClass('toggle');
});
