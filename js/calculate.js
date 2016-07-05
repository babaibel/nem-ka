/**
 * Created by dg on 01.01.2016.
 */
$(document).ready(function () {
    var form = $('form[name="calculate"]'),
        select = $('select', form), option = $('option:selected', select);

    $('span#prefix').html($(option).data('prefix'));
    $('#price').html($(option).data('price'));

    $(select).change(function () {
        option = $('option:selected', this);
        $('span#prefix').html($(option).data('prefix'));
        $('#price').html($(option).data('price'));
    })


    $('body').on('keyup', 'input[data-vtype="digit"]', function (e) {
        e.target.value = e.target.value.replace(/[^\d]/, '');
    })

    $('form[name="kitBox"]').submit(function () {
        $.post('/cart/putKitBox', $(this).serialize(), function () {
            nemKa.fancyAlert();
        }, 'json')
        return false;
    })

    $('select[data-action="calculate_changes"]').change(function () {
        console.log($(this).data('kit'))
        $('form[name="kitBox-' + $(this).data('kit') + '"]').submit();
    })
})

