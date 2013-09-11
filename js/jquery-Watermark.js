/// <reference path="../../JS/jquery-1.7.min.js" />

// 创建一个闭包   文字水印 
(function ($) {

    var $ = $;
    // 插件的定义       
    $.fn.Watermark = function (options) {


        var opts = $.extend({}, $.fn.Watermark.defaults, options);

        return this.each(function () {
            $this = $(this);
            var defaultColor = $(this).css("color"); // 
            $this.css("color", opts.color).val(opts.text);

            $this.bind("blur", function () {
                if (this.value.trim() == '') { this.value = opts.text; $this.css("color", opts.color); }


            }).bind("focus", function () {
                if (this.value.trim() == opts.text) this.value = '';
                $this.css("color", defaultColor);
            });
        });
    };

  // 插件的defaults     
    $.fn.Watermark.defaults = {
        text: '请输入',
        color: '#A8A8A8'
    };
    // 闭包结束     
})(jQuery);   
  
