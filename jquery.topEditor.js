/**
 * topEditor - jQuery plugin 1.0
 * 
 */
/// 
//
// jQuery.fn = jQuery.prototype
//  $.fn.topEditor就是给jQuery类添加一个成员函数   该成员函数只能由jQuery实例调用  而$("#btn1") 会生成一个 jQuery类的实例。
// 所以 调用方法为$('#topEditor').topEditor();

/**
 * $.fn.topEditor
 * 
 */
(function ($) {
    $.fn.topEditor = function (options) {
        // 若参数为字符串 则表示调用该方法
        //若参数为控件对象或参数不存在 则表示初始化一个编辑器
        if (arguments.length > 0 && arguments[0].constructor == String) {  //arguments[0]参数包含 所有控件项

            var action = arguments[0].toString();
            var params = [];

            for (var i = 1; i < arguments.length; i++)
                params[i - 1] = arguments[i];

            if (action in $.fn.topEditor) {
                return this.each(function () {
                    $.data(this, 'topEditor')
                     .designMode();

                    CtopEditor[action].apply(this, params);
                });
            }
            else return this;
        }

        var controls = {};

        /**
        * 
        * 用户自定义控件和默认控件 归并处理
        */
        if (options && options.controls) {
            var controls = options.controls;
            delete options.controls;   //删除options.controls为undefined
        }

        options = $.extend({
            html: '<' + '?xml version="1.0" encoding="UTF-8"?' + '><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">STYLE_SHEET'
             + '<script type="text/javascript">document.domain = "localhost";</script>'
             + '</head><body spellcheck="false" contenteditable="true" ></body></html>',
            controls: {}
        }, options);

        options.controls = $.extend(true, options.controls, $.fn.topEditorControls);

        for (var control in controls) {
            if (control in options.controls)
                $.extend(options.controls[control], controls[control]);
            else
                options.controls[control] = controls[control];
        }

       // 初始化一个新的编辑器
        return this.each(function () {   // this为textarea的DOM对象
            //
            $.fn.topEditor.init(this, options);

        });
    };


/**
 * 拓展$.fn.topEditor 属性和方法
 * 
 */

    $.extend($.fn.topEditor,
    {
        original: null,    //original是该编辑器的原始对象 即textarea对象   
        options: {},      //包含的选项json
        element: null,    //iframe的DOM对象
        editor: null,     //iframe的juqery对象
        editorDoc: null,
        range: null,
        source: "",     //源码
        his: [],     //撤销的历史数据
        rehis: [],    //重做的历史数据
        curindex: 0, //历史记录中恢复的索引值

        focus: function () {
            $(this.editorDoc.body).focus();

        },
        Winfocus: function () {
            // this.editor[0].contentWindow.focus();
        },
        init: function (element, options) {
            var self = this;
			//alert(this);//this为$.fn.topEditor对象
            this.options = options || {};

            $.data(element, 'topEditor', this);   //将this即$.fn.topEditor  绑定到textarea上 方便使用

            if (element.nodeName.toLowerCase() == 'textarea') {
                this.original = element;
                element.className='textarea';
                //创建iframe对象
                var editor = this.editor = $('<iframe src="javascript:false;"></iframe>').attr('id', ($(element).attr('id') ? $(element).attr('id') : $(element).attr('class')) + 'IFrame')    //'topEditor' 
                .attr('frameborder', '0');

                /**
                * http://code.google.com/p/jtopEditor/issues/detail?id=96
                */
                this.editor.attr('tabindex', $(element).attr('tabindex'));
            }
            this.element = $('<div></div>').addClass('topEditor')
                .append(editor);

            this.registerControls();

            $(element).hide().before(this.element);
            this.element.append($(element));  //将textarea放在iframe后面  放在div.topEditor里面

            this.initFrame();

            /*
            * 当表单重置的时候  同样重置编辑器的内容
            */
            var form = $(element).closest('form');

            form.bind('reset', function () {
                self.setContent("");
                self.saveContent();
            });
        },

        initFrame: function () {
            var self = this;
            var style = '';

            /**
            * 加入css样式   iframe.css
            */
            var h = location.href.toString();
            var p = h.substr(0, h.lastIndexOf('/') + 1) + "css/iframe.css";
            style = '<link rel="stylesheet" type="text/css" media="screen" href="' + p + '" />';


            this.editorDoc = $(this.editor).document();  //获取iframe的document对象
            this.editorWin = $(this.editor).window();
            this.editorDoc_designMode = false;

            this.setDesignMode(true);

            this.editorDoc.open();  //打开一个新的空白文档

            this.editorDoc.write(     //将选项的html输出到该文档
                this.options.html
                    .replace(/STYLE_SHEET/, function () { return style; })
            );
            this.editorDoc.close();
            this.editorDoc.contentEditable = 'true';
            if (true) {
                try {
                    this.editorDoc.execCommand("styleWithCSS", 0, true);
                } catch (e) {
                    try {
                        this.editorDoc.execCommand("useCSS", 0, true);
                    } catch (e) { }
                }
            }


            var a, b, c;
            a = b = c = false;

            /**
            * 以下是iframe的 document注册事件
            */
			
            $(this.editorDoc).click(function (e) {
                setTimeout( function (){
                	self.check();
                }  , 100);  //检查元素的样式 以控制按钮的状态 check函数 
            });

            $(this.editorDoc).mousedown(function (event) {
                a = true;
            });

            $(this.editorDoc).mouseup(function (e) {

                self.hideColorPicker(e);

                if (a) {
                    self.range = self.getRange();
                }
                a = b = false;
            });


            $(window).click(function (e) {
                //单击窗口 关闭 打开的窗口
                if (self.dia) {
                    if ($(e.target).attr("class")) {
                        if ($(e.target).attr("class").toLowerCase() != self.dia.data("cmd"))
                            self.removeCombox(self.dia);
                    }
                    else self.removeCombox(self.dia);
                }

                self.hideColorPicker(e);

            });
          
           // alert($(this.editor).window().getSelection());
            /**
            * textarea的注册事件
            */
            $(this.original).focus(function () {
                if (!$.browser.msie) {
                  //  self.focus();
                }
            });

            if (true) {     //在键盘按下 放下和鼠标按下时保存body内容到textarea中
                /**
                * @link http://code.google.com/p/jtopEditor/issues/detail?id=11
                */
                $(this.editorDoc).keydown(function (e) {

                    self.saveContent();
                })
                                 .keyup(function (e) {
                                     self.saveContent(); //  alert(self.getText().trim().length);


                                 })
                                 .mousedown(function () { self.saveContent(); });
            }


            $(this.editorDoc.body).focus();

            $(this.editorDoc).keyup(function (e) {
                if ((e.keyCode >= 37 && e.keyCode <= 40)) {
                    var node = self.getNodeOfCursor();
                    self.checkTargets(node);
                }

                var t = self.getText();
                if ($.trim(t) == "" && t.length == 1) {
                    if ($.browser.msie) self.focus();
                    self.editorDoc.execCommand('removeFormat', false, []);
                    self.editorDoc.execCommand('unlink', false, []);
                    self.setContent("");

                }

                if (self.getContent() == "<br>") {

                    self.focus();
                    self.editorDoc.execCommand('SelectAll', false, []);
                    self.editorDoc.execCommand('removeFormat', false, []);
                    self.editorDoc.execCommand('unlink', false, []);


                }
                //   $(self.editorDoc.body).find("strong").focus();
            });


            $(this.editorDoc).keydown(function (e) {   //在IE下 按下enter换行时 用<br>表示行间隔

                if ($.browser.msie && e.keyCode == 13) {
                    var rng = self.getRange();   //若选择了内容 将被替换
                    rng.pasteHTML('<br />');
                    rng.collapse(false);
                    rng.select();
                    return false;
                }
                return true;
            });
        },
        setDesignMode: function (isOpen) {
            if (isOpen) {
                try {
                    this.editorDoc.designMode = 'on';
                    this.editorDoc_designMode = true;
                } catch (e) {
                    $(this.editorDoc).focus(function () {
                        self.designMode();
                    });
                }
            }
            else {
                try {
                    this.editorDoc.designMode = 'off';
                    this.editorDoc_designMode = false;
                } catch (e) {
                    // Will fail on Gecko if the editor is placed in an hidden container element
                    // The design mode will be set ones the editor is focused

                    $(this.editorDoc).focus(function () {
                        //   self.designMode();
                    });
                }
            }
        },
        designMode: function () {
            if (!(this.editorDoc_designMode)) {
                try {
                    this.editorDoc.designMode = 'on';
                    this.editorDoc_designMode = true;
                } catch (e) { }
            }
        },

        getSelection: function () {


            return (!$.browser.msie) ? $(this.editor).window().getSelection() : $(this.editor).document().selection;
        },

        getRange: function () {
            var selection = this.getSelection();

            if (!(selection))
                return null;

            return (selection.rangeCount > 0) ? selection.getRangeAt(0) : selection.createRange();
        },
        //用于获得被选的内容 或 光标当前的内容
        getSelected: function () {
            var range = null;
            var text;

            if ($.browser.msie) {
                range = $(this.editor).window().document.selection.createRange();    // win.document.selection获取选取区域    再将选取区域变成                                                                                       range对 //象.createRange();
                text = range.text;


            }
            else //if (browser.firefox || browser.chrome)
            {
                var sel = $(this.editor).window().getSelection();    //获取选取区域
                if (sel.rangeCount > 0) {
                    range = sel.getRangeAt(0); // 再将选取区域变成range对象
                    text = range;
                }
                else range = null;
            }
            //  alert(range);
            var rangeNode = null;
            if (range != null) {
                if (range.commonAncestorContainer) {
                    rangeNode = range.commonAncestorContainer;
                }
                else {
                    if (range.parentElement) rangeNode = range.parentElement();
                }
            }
            return {
                node: rangeNode,
                range: range,
                text: text
            }
        },
        getNodeOfCursor: function () {
            var node = this.getSelected().node; //获取光标位置元素
            if (node != null) {
                //节点类型为 1 则该节点为元素  为 2 则为属性等
                while (node.nodeType != 1) {
                    // alert("node");
                    node = node.parentNode;

                }
                return node;
            }


        },
        getHTML: function () {           //获取HTML <html>标签包含的内容
            return $(this.editor).document().documentElement.innerHTML;

        },
        getContent: function () {   //获取body的内容
            // alert("!@#  "+$(this.editor.document()).find('body').html());
            return $(this.editor.document()).find('body').html();
        },

        getText: function () {         //获取文本    <body>标签包含的内容
            return $("<div />").append($(this.editor).document().body.innerHTML).text();

        },

        setContent: function (newContent) {  //设置body的内容
            $($(this.editor).document()).find('body').html(newContent);
        },

        saveContent: function () {       //保存body的内容到textarea的对象中
            if (this.original) {
                var content = this.getContent();

                if (this.options.rmUnwantedBr) {

                    content = (content.substr(-4) == '<br>') ? content.substr(0, content.length - 4) : content;
                }

                $(this.original).val(content);
            }
        },
        setHistory: function () {
            var self = this;


        },
        addHis: function (val) {
            var self = this;
            self.his.push(val);
            this.rehis = [];
            this.normal($("#tool a[cmd=Undo]"));
            this.disable($("#tool a[cmd=Redo]"));
        },
        execUndo: function () {
            // alert(this.his.length);
            var val = this.his.pop();
            this.rehis.push(this.getContent());
            if (this.his.length == 0) { this.disable($("#tool a[cmd=Undo]")); }
            this.normal($("#tool a[cmd=Redo]"));
            this.setContent(val);

        },
        execRedo: function () {
            var val = this.rehis.pop();
            if (this.rehis.length == 0) { this.disable($("#tool a[cmd=Redo]")); }
            this.normal($("#tool a[cmd=Undo]"));
            this.his.push(this.getContent());
            this.setContent(val);

        },
        hasUndo: function () {

            return (this.his.length > 0);

        },
        hasRedo: function () {

            return (this.rehis.length > 0);

        },

        //打开一个框让用户选择值 比如颜色框  obj为单击的按钮li的DOM对象 con为显示内容的jquery对象  cmd为框对象的执行命令
        showCombox: function (obj, con, cmd) {
            var div = $("<div/>").append(con).addClass("dialog").css("left", $(obj).position().left).css("top", $(obj).position().top
                                                                              + 20).appendTo($("ul.panel"));

            this.dia = $("ul.panel .dialog").data("cmd", cmd);

        },
        removeCombox: function (j) {        //j 为要关闭的窗口或框的jquery对象
            j.hide(); j.remove(); this.dia = null;

        },
        hideColorPicker: function (e) {

            if ($(e.target).attr("cmd") != undefined) {
                var name = $(e.target).attr("cmd").toLowerCase();

                if (name != "forecolor" && name != "backcolor" && jscolor.dom != null) {

                    jscolor.close(jscolor.dom);

                }
            }
            else { jscolor.close(jscolor.dom); }


        },
        registerControls: function () {

            this.dia = null;
            var self = this;
            for (var name in this.options.controls) {
                var control = this.options.controls[name];
                var cmd = control.command;
                if (cmd == "Undo" || cmd == "Redo" || cmd == "Save") {
                    self.disable($("#tool a[cmd=" + cmd + "]"));
                }
                if (cmd == "JustifyFull") self.active($("#tool a[cmd=" + cmd + "]"))
            }
            $("#tool .item").click(function () {

                if (!(self.isDisable($(this)))) {

                    var cmd = $(this).attr("cmd");
                    var control = self.options.controls[cmd];

                    args = [];
                    //是否需要打开一个对话框  比如颜色框
                    if (self.dia && (self.dia.data("cmd") == cmd.toLowerCase())) { self.removeCombox(self.dia); return false; }
                    if (self.dia && (self.dia.data("cmd") != cmd.toLowerCase())) { alert(cmd + "yes1"); self.removeCombox(self.dia); }                //  dia=this;    
                    var d = self.editorDoc;

                    if (control.exec) { control.exec.apply(self, [self, this, cmd]); }
                    else {

                        switch (cmd) {

                            case "": { break; }
                            default:
                                {
                                	 alert("fwe");
                                    if ($.browser.msie && self.range) self.range.select();
                                    var temp = self.getContent();
                                    self.editorDoc.execCommand(cmd, false, args);
                                    self.check();
                                    $(self.editorDoc).focus();
                                   
                                    if (temp != self.getContent() && cmd != "undo") { self.addHis(temp); }
                                    break;
                                }

                        }

                    }
                }

            }).mouseenter(function () {
                if (!(self.isDisable($(this)) || self.isActive($(this)))) {
                    $(this).addClass('hover');
                }
            }).mouseleave(function () {
            	
                if (!(self.isDisable($(this)) || self.isActive($(this)))) {
                    $(this).removeClass('hover');
                }
            }); //#tool .item事件结束

            $("#tool select").change(function () {
                var cmd = $(this).attr("cmd");
                $(this).find("option:selected").each(function () {
                    var control = self.options.controls[cmd];
                    if (control.exec) { control.exec.apply(self, [self, this, cmd]); }


                });

            }); //#tool select事件结束



        },
        //改变工具栏按钮的状态
        isDisable: function ($elem) {
            return $elem.hasClass('disable');
        },
        isActive: function ($elem) {
            return  $elem.hasClass('active');
        },
        disable: function ($elem) {
           
            $elem.addClass('disable');
        },
        active: function ($elem) {
             $elem.addClass('active');

        },
        normal: function ($elem) {
           $elem.removeClass("disable").removeClass("active");
           
        },
        check: function () {
  			  var self = this;
  			
  			  var node = self.getNodeOfCursor();
  			  self.checkTargets(node);
		},
        checkTargets: function (element) { //检查单击处的样式  以更新工具栏 显示对应样式
            var self = this;
            for (var name in this.options.controls) {
                var control = this.options.controls[name];
                var cmd = control.command;
                if (control.tags || control.css) {
                    if (control.css) {
                        self.normal($("#tool a[cmd=" + cmd + "]"));
                        var elm = $(element);

                        if (elm[0].nodeType != 1)
                            break;

                        for (var cssProperty in control.css)
                        //alert(cssProperty + "    " + elm.css(cssProperty));
                        var css = elm.css(cssProperty).toString();
                        if (cmd == "FontName") {
							//alert(cssProperty + "    " + elm.css(cssProperty));
                            $("#" + cmd).find('option').each(function(index) {        	
                          	 var a=	 $(this).val().split(',');	
                          	 var b= css.split(',');	
                              if( $.trim( a[0] ) ==  $.trim( b[0] )  ){
                              	 $(this)[0].selected=true;
                              }
                            });
                          
                            continue;
                        }
                        else if (cmd == "FontSize") {

                            $("#" + cmd).val(css.substring(0, css.length - 2)); continue;
                        }
                        else if (cmd == "Bold") {
                            css = css.toLowerCase();
                            if (css == "700" || css == "bold") {
                                self.active($("#tool a[cmd=" + cmd + "]"));
                            }

                        }
                        else if (cmd == "Italic") {
                            css = css.toLowerCase();
                            if (css == "italic") {
                                self.active($("#tool a[cmd=" + cmd + "]"));
                            }

                        }
                        else if (cmd == "Underline") {
                            css = css.toLowerCase();
                            if (css == "underline") {
                                self.active($("#tool a[cmd=" + cmd + "]")); continue;
                            }

                        }

                        else if (cmd == "JustifyLeft" || cmd == "JustifyCenter" || cmd == "JustifyRight" || cmd == "JustifyFull") {
                            css = css.toLowerCase();
                            //   alert(cssProperty + "    " + elm.css(cssProperty));
                            if (css == "start" || css == "justify") {
                                self.active($("#tool a[cmd=JustifyFull]"));
                            }
                            if (css == "left") {
                                self.active($("#tool a[cmd=JustifyLeft]"));
                            }
                            if (css == "center") {
                                self.active($("#tool a[cmd=JustifyCenter]"));
                            }
                            if (css == "right") {
                                self.active($("#tool a[cmd=JustifyRight]"));
                            }
                        }
                        else { self.normal($("#tool a[cmd=" + cmd + "]")); }
                    }
                }//if
            }//for
        },//function

        getElementByAttributeValue: function (tagName, attributeName, attributeValue) {
            var elements = this.editorDoc.getElementsByTagName(tagName);

            for (var i = 0; i < elements.length; i++) {
                var value = elements[i].getAttribute(attributeName);

                if ($.browser.msie) {
                    /** IE add full path, so I check by the last chars. */
                    value = value.substr(value.length - attributeValue.length);
                }

                if (value == attributeValue)
                    return elements[i];
            }

            return false;
        }
    });

/**
 *   $.fn.window 获取  window对象
 * 
 */

    $.fn.window = function () {


        var element = this.get(0);  //this 是个juqery对象  这里是iframe的juqery对象  使用get(0) 获得iframe得DOM对象

        if (element.nodeName.toLowerCase() == 'iframe') {
            return element.contentWindow;
        }
        return this;
    };

/**
 *  $.fn.document 获取 document对象
 * 
 */
    $.fn.document = function () {

        var element = this.get(0);  //this 是个juqery对象  这里是iframe的juqery对象  使用get(0) 获得iframe得DOM对象

        if (element.nodeName.toLowerCase() == 'iframe') {
            return element.contentWindow.document;

        }
        return this;
    };

/**
 *  $.fn.documentSelection 获取 document的选择区对象
 * 
 */
    $.fn.documentSelection = function () {
        var element = this.get(0);

        if (element.contentWindow.document.selection)
            return element.contentWindow.document.selection.createRange().text;
        else
            return element.contentWindow.getSelection().toString();
    };

})(jQuery);