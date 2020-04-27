const init = $('#email').val();
async function emailGood(type) {
  fetch('/AJAX/emailExists', {
    method: 'post',
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify({
      email: $('#email').val(),
      type: type
    })
  }).then(results => {
    if(results.status === 302 && initEmail !== $('#email').val()) {
      $('#post-btn').prop('disabled', true)
      $('#email').css('border', 'red 1px solid')
      $('#emailExistsMsg').html('The email already belongs to another user!');
    } else {
      $('#post-btn').prop('disabled', false)
      $('#email').css('border', '');
      $('#emailExistsMsg').html('');
    }
  });
}

$('#email').on('change', function() {
  emailGood('STUDENT');
})