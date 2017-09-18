
$(document).ready(function(){
  //messages
  $('#showSuccess').on('click', function(){
    $.showSuccessMessage('Mensaje de éxito');
  });
  $('#showWarning').on('click', function(){
    $.showWarningMessage('Mensaje de warning');
  });
  $('#showDanger').on('click', function(){
    $.showDangerMessage('Mensaje de danger');
  });
  $('#showConfirm').on('click', function(){
    $.showConfirmMessage(
      {
        Title: 'Titulo del mensaje',
        Message: 'Mensaje a mostrar',
        OnConfirm: function(){
          alert('Confirmado!');
        },
        OnCancel: function(){
          alert('Cancelado!');
        }
      }
    );
  });

  $('#showWait').on('click', function(){
      $.showWait();

      //Para cerrarlo es necesario llamar a $.closeWait();
      var t= setTimeout(function(){
          $.closeWait();
          clearTimeout(t);
      }, 2000);
  })



})
