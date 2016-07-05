/**
 * Created by dg on 30.06.2015.
 */
var nemKa = {
    version: 0.2,
    updateMiniCart: function () {
        $.get('/cart/info', function (data) {
            $('.bot_panel').show();
            $('.minicart').html(data.widgetstring);
            $('#boot_count_cart').html(data.count);
            $('#boot_cart_price').html(data.price);
        });
    },
    yandexTarget: function (name) {
        if (typeof yaCounter22241857 == 'object') {
            switch (name) {
                case 'add':
                    yaCounter22241857.reachGoal('CART_ADD');
                    break;
                case 'order':
                    yaCounter22241857.reachGoal('ORDER_DELIVERY');
                    break;
            }
        }
    },
    fancyAlert: function (message) {
        $.fancybox('<div class="add_cart_alert">' +
            '<p class="alert_title">Товар УСПЕШНО добавлен в корзину</p>' +
            '<a href="/cart" class="btn_orange">ОФОРМИТЬ ЗАКАЗ</a>' +
            '<a href="javascript:void(0)" onclick="$.fancybox.close()" class="btn_blue">ПРОДОЛЖИТЬ ПОКУПКИ</a>' +
            '</div>',
            {
                scrolling: 'no',
                padding: 0,
                'closeBtn': false,
                onShow: function () {
                    $('.fancybox-close').hide()
                },
                helpers: {
                    overlay: {
                        locked: false
                    }
                }
            }
        );
    },
    initCartAdd: function () {
        var self = this;
        $('body').on('click', '.addtocart, .processorder', function (e) {
            self.yandexTarget('added');
            var form = $('form[name="cart-form"]'), button = e.target;
            if (form.length > 1) {
                if ($(this).parent().parent().parent()[0].nodeName == 'FORM') {
                    form = $(this).parent().parent().parent();
                } else if ($(this).parent()[0].nodeName == 'FORM') {
                    form = $(this).parent();
                }
            }
            $.ajax({
                type: "POST",
                url: $(form).attr('action'),
                data: $(form).serialize(),
                success: function (data) {
                    self.fancyAlert('Товар добавлен, спасибо!');
                    self.updateMiniCart();
                    if ($(button).hasClass('processorder')) {
                        window.location.href = '/cart'
                    }
                },
                error: function () {
                    self.fancyAlert('Ошибка сервера. Пожалуйста, попробуйте ещё разок.');
                }
            });
            return false;
        });
        if ($('.add_cart_btn,.catalog_item2_add_cart_btn').length) {
            $('body').on('click', '.add_cart_btn,.catalog_item2_add_cart_btn', function () {
                $.ajax({
                    type: "POST",
                    url: $(this).data('action'),
                    data: {
                        id: $(this).data('id'),
                        quantity: $(this).data('quantity')
                    },
                    success: function (data) {
                        self.fancyAlert('Товар добавлен, спасибо!');
                        self.updateMiniCart();
                    },
                    error: function () {
                        self.fancyAlert('Ошибка сервера. Пожалуйста, попробуйте ещё разок.');
                    }
                });
                return false;
            })
        }
        $('body').on('click', 'a[data-action="add_reserved"]', function () {
            var me = this, text = $(this).html();
            if (text == 'уже отложено') {
                $.post('/cart/deleteReserved', {
                    id: $(this).data('id'),
                    return_count: 'Y'
                }, function (data) {
                    $(me).html('отложить товар');
                    $('#boot_count_reserved').html(data.count);
                }, 'json')
            } else {
                $.post('/catalog/addReserved', {
                    id: $(this).data('id')
                }, function (data) {
                    var parent = $(me).parent();
                    $(me).html('уже отложено');
                    $('.bot_panel').show();
                    $('#boot_count_reserved').html(data.count);
                }, 'json')
            }

        })
    },
    initSearchCategory: function (params) {
        var me = this;
        $('body').on('change', 'select[data-action="parameters"]', function (e) {
            me.count(e.target);
        })
        this.count = function (th) {
            var data = {};
            $('select[data-action="parameters"] > option:selected').each(function (i, el) {
                data[$(this).parent().attr('name')] = $(this).val()
            })
            data['category_ids'] = $(th).data('category_id')

            $.post(params.url, data, function (data) {
                if (data.success) {
                    $('#result_search').html(data.count)
                }
            }, 'json')
        }
    },
    initCart: function () {
        var me = this;
        $('body').on('click', '.del-btn', function (event) {
            var data = {id: $(this).attr('data-id'), quantity: 0},
                self = this;
            me.updateCart(data, function () {
                me.recalculateCart();
                $(self).parent().parent().remove();
                if ($('.b-cart-table > tbody > tr').length - 1 <= 0) {
                    $('.b-cart-table').remove();
                    $('form[action="/order"]').html('Корзина пуста :(');
                }
            });

        });
        $('body').on('blur', 'input[name="quantity"]', function () {
            var data = {id: $(this).attr('data-id'), quantity: $(this).val()};
            me.updateCart(data);
        })
        me.updateCart = function (data, callback) {
            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: '/cart/update',
                data: data,
                success: function (data) {
                    if (typeof callback == 'function') {
                        callback();
                        return false;
                    }
                    if (data.success) {
                        $('#total_sum').html(data.total);
                        $('*[data-price="' + data.id + '"]').html(data.item_price);
                    }
                    me.updateMiniCart();
                }
            });
        }
    },
    recalculateCart: function () {
        var me = this, data = {
            position: {}
        }
        $('input[name="quantity"]').each(function () {
            data.position[$(this).data('id')] = $(this).val();
        })
        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: '/cart/recalculate',
            data: data,
            success: function (data) {
                if (data.success) {
                    $('#total_sum').html(data.total);
                    for (var i in data.items) {
                        $('*[data-price="' + data.items[i].id + '"]').html(data.items[i].item_price);
                    }
                }
                me.updateMiniCart();
            }
        })
    },
    initRegister: function () {
        $('body').on('change', '#UserCorporateProfile_same_addr', function () {
            if ($(this).is(':checked')) {
                $('.fact_address').slideToggle();
            }
            else {
                $('.fact_address').slideToggle();
            }
        });
        $('#User_role').change(function () {
            $.get('/user/getProfileForm', {role: $(this).val()}, function (data) {
                $('.user-profile-reg-fields').html(data);
            });
        });
    },
    initCalculate: function () {
        $('.calculate-price-btn').click(function () {
            var data = {
                m2: $('input[name="m2"]').val(),
                mm: $('input[name="mm"]').val(),
                id: $(this).data('id')
            }
            $.get('/catalog/calculate', data, function (data) {
                $('.input-wrap_last > p > b').html(data._result);
                $('input[name="quantity"]').val(data._result);
            }, 'json')
        })

    },
    initOffers: function () {
        $('select').change(function () {
            var option = $('option:selected', $(this)),
                price = parseFloat($(option).data('price')),
                sku = $(option).data('sku'),
                original_price = parseFloat($(option).data('original_price')),
                weight = $(option).data('weight');
            if (sku != '') {
                $('.item_num > span').html(sku)
            }
            if (price) {
                $('.main-price').html(price + '<i>руб.</i>')
            }
            if (original_price) {
                $('#original_price').html(original_price + ' руб.')
            }
            if (weight) {
                $('#_set_weight_').html(weight)
            }
        })
    },
    moveAllReservedToBasket: function () {
        $.post('/cart/moveAllReserved', $('form[name="reserved"]').serialize(),
            function (data) {
                if (data.success) {
                    window.location.href = '/cart'
                } else {
                    window.location.reload();
                }
            }, 'json')
    },
    deleteAllReserved: function () {
        $.post('/cart/deleteAllReserved', {}, function (data) {
            window.location.reload();
        }, 'json')
    },
    deleteReserved: function (element) {
        $.post('/cart/deleteReserved', {
            id: $(element).data('id')
        }, function (data) {
            $(element).parent().parent().remove();
            if ($('.b-basket-table > tbody > tr').length - 1 <= 0) {
                $('.b-basket-table').remove();
                $('form[name="reserved"]').html('Отложенных товаров нет');
            }
        }, 'json')
    },
    addReservedToBasket: function (element) {
        var me = this, id = $(element).data('id');
        $.post('/cart/putReserved', {
            id: id,
            quantity: $('input[name="quantity[' + id + ']"]').val()
        }, function (data) {
            me.updateMiniCart();
            $(element).parent().parent().hide();
        }, 'json')
    }
}

