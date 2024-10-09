const btnAddCity = function() {
    $('#modalAddCity').modal('show');
    $('#fltZIP').off();
    $('#fltZIP').on('keyup',function() {
        $('#fltCity').val("");
        if($('#fltZIP').val().length == 5) {
            $.getJSON("https://api.corrently.io/v2.0/gsi/prediction?zip="+$('#fltZIP').val(),function(data) {
                    $('#fltCity').val(data.location.city);
            });
        }        
    });
    $('#formAddCity').off(); 
    $('#formAddCity').on('submit',function(e) {
        e.preventDefault();
        var formData = $(this).serializeArray();
        let jsonData = {};
        $.each(formData, function() {
            jsonData[this.name] = this.value;
        });
    
        console.log("Hajo!",jsonData);        
    });
}

$(document).ready(function() {
    const token = localStorage.getItem("token");
    if(!token) {
      //  location.href = "./login.html";
    }

    $('#btnAddCity').on('click',btnAddCity);
});