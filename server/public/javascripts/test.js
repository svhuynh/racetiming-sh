$(function() {
  $.get("./users")
    .done(function(data) {
      $('#loading').hide();
      data.forEach(primate => {
        $('ul').append('<li>' + primate + '</li>');
      });
    })
    .fail(function(err) {
      $('#loading').hide();
      console.log(err);
    });
});