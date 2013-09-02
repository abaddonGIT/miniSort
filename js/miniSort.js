/******************************************************
 * Copyright 2013 by Abaddon <abaddongit@gmail.com>
 * @author Abaddon <abaddongit@gmail.com>
 * @version 1.0.0
 * ***************************************************/
/*global window, $, jQuery, document */
(function($) {
    var dr, acceptors = $();
    "use strict";
    $.fn.miniSort = function(options) {
        //Дефолтовые настройки
        var def = {
            'child': 'div',
            'accepterBorder': '2px dashed #2d6409',
            'succesDropURl': 'test.php',
            'dropAction': function(list, el, index) {//Ф-я выполняется после окончания перетаскивания
            }
        };

        //Инициализируем плагин для всех нужных элементов а так же расширяем дефолтовые настройки переданными
        $.extend(def, options);

        return this.each(function() {
            if ($(this).data('items')) {
                var items = $(this).data('items');
                items.off('dragstart mousedown dragend selectstart dragover dragenter drop');
            }

            //$(window).unbind('mousedown mouseup dragstart dragend selectstart dragover dragenter drop');
            acceptors = $();
            dr = null;

            var items = $(this).children(def.child), list = this;//Собираем набор элементов, которые будут перемещаться
            $(this).data('items', items);
            //Ставим атрибут draggable для разрешения перемещения
            items.prop('draggable', true);
            //Далее создаем элемент-акцептор в зависимости от того что из себя представляет блок-контейнер
            var acceptor = $('<' + (/^ul|ol$/i.test(this.tagName) ? 'li' : 'div') + ' class="currentAcceptor">');//акцептер, то куда падает передвигаемый элемент
            acceptor.css('border', def.accepterBorder);
            acceptors = acceptors.add(acceptor);
            //Цепочка событий перемещения элементов
            items.on('dragstart mousedown', function(e) {  //Сообытие при начале перетаскивании
                e = e || window.e;
                if (e.type === 'dragstart') {
                    var dt = e.originalEvent.dataTransfer;
                    dt.effectAllowed = 'move';
                    dt.setData('Text', 'fucking firefox');
                    //Получаем индекс перетаскиваемого елемента и добавляем метку перетаскиваемому элементу
                    dr = $(this);
                    index = $(dr).addClass('dragging').index();
                }
                //Вычисляем высоту акцептора
                if (e.type === 'mousedown') {
                    e.stopPropagation();
                    var acHeight = $(this).outerHeight() - (acceptor.outerHeight() - acceptor.height()), acWidth = $(this).width() - (acceptor.outerWidth() - acceptor.width());
                    acceptor.css('height', acHeight);
                    acceptor.css('width', acWidth);
                }
            }).on('selectstart', function() {//Предотвращаем выделение текста при перетаскивании
                //Обеспечиваем поддрежку drug and drop для IE
                this.dragDrop();
                return false;
            }).add([this, acceptor]).on('dragover dragenter drop', function(e) {
                if (e.type === 'drop') {
                    //делаем так чтобы что бы событие срабатывало только для конкретного элемента и распостранялось выше по "дереву"
                    e.stopPropagation();
                    //При "бросании" перетаскиваемого элемента находим текущий акцептор и вставляем после него наш элемент
                    acceptors.after(dr);
                    
                    return false;
                }
                else {
                    e.preventDefault();
                    e.originalEvent.dataTransfer.dropEffect = 'move';

                    if (items.is(this)) {
                        dr.hide();
                        $(this)[acceptor.index() < $(this).index() ? 'after' : 'before'](acceptor);
                        acceptors.not(acceptor).detach();
                    }
                }
                return false;
            }).on('dragend', function() {
                if (!dr) {
                    return;
                }
                dr.removeClass('dragging').show();
                acceptors.detach();

                if (index !== dr.index()) {
                    dr.parent().trigger('sortupdate', {item: dr});
                    //запускаем ф-ю по завершению таскания
                    def.dropAction(list, dr, dr.index());
                }
                dr = null;
            });
        });
    };
})(jQuery)
