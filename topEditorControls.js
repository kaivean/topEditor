
//插件添加  visible 是否可见 command单击控件按钮执行的命令  tooltip提示   
    //若自定义exec函数 则单击该按钮时执行该函数   tag和css用于在获取光标所在处的字体样式

/// <reference path="../../JS/jquery-1.6.4.min.js" />

var r;

var Replace = function (html, self)    //将指定html替换选中区域的文本   
{
    var range = self.range;
    if (range != null) {

        if ($.browser.msie) {
            // self.Winfocus();
            if (range.pasteHTML != undefined) {
                range.select();
                range.pasteHTML(html); //微软的该函数替换range里的文本
                range.select();
                return true;
            }
        }
        else //if (browser.firefox || browser.chrome)   //firefox  safri  opera
        {

            if (range.deleteContents != undefined && range.insertNode != undefined) {

                var temp = document.createElement("DIV");
                temp.innerHTML = html;

                var elems = [];
                for (var i = 0; i < temp.childNodes.length; i++) {
                    elems.push(temp.childNodes[i]);

                }

                range.deleteContents();

                for (var i in elems) {
                    temp.removeChild(elems[i]);
                    range.insertNode(elems[i]);
                }
                return true;
            }
        }  //else
    }   //if
    else { self.setContent(html); }

    return false;

}   ;   //replace


var insert = function (self, imagPath, vid) {    //http://www.baidu.com/img/baidu_sylogo1.gif
    //  if (imagPathL && imagPathL.length > 0)
    if ($.browser.msie) {
        if (self.range) {
            self.focus();
            var str = '<img src="' + imagPath + '"></img>';
            if (vid) str = '<img src="' + imagPath + '" vid="' + vid + '"></img>';
            Replace(str, self);

        }
        else {
            //  alert("1233");
            var str = self.getContent() + '<img src="' + imagPath + '"></img>';
            if (vid) str = '<img src="' + imagPath + '" vid="' + vid + '"></img>';
            self.setContent(str);

        }
    }
    else {
       
        self.editorDoc.execCommand('insertImage', false, imagPath);
        if (vid) $(self.editorDoc).find("img[src=" + imagPath + "]").attr("vid", vid);
    }
};



$.fn.topEditorControls = {

    Save: { visible: true, command: "Save", tooltip: "BackColor",
        exec: function (self, elem, cmd) {   //exec函数 回调的参数 self是topEditor对象    elem是单击的li元素的DOM对象

           self.saveContent();

        }
    },


    Undo: { visible: true, tooltip: pluginInfo['Undo'].t, command: "Undo",
        exec: function (self, elem, cmd) {

            if (self.hasUndo()) {
                self.execUndo();
            }
            else { alert("不能撤销了"); }
            $(self.editorDoc.body).focus();


        }

    },
    Redo: { visible: true, tooltip: pluginInfo['Redo'].t, command: "Redo",
        exec: function (self, elem, cmd) {
            if (self.hasRedo()) {

                self.execRedo();
            }
            else { alert("不能撤销了"); }
            $(self.editorDoc).focus();
        }


    },

    FontName: { visible: true, tags: [], css: { fontFamily: '' }, command: "FontName", tooltip: "FontName",
        exec: function (self, elem, cmd) {
            var args = $(elem).val();
            var temp = self.getContent();
            if ($.browser.msie && self.range) self.range.select();
            self.editorDoc.execCommand(cmd, false, args);
            self.check();
            if (temp != self.getContent() && cmd != "undo") { self.addHis(temp); }

        }
    },

    FontSize: { visible: true, tags: [], css: { fontSize: '' }, command: "FontSize", tooltip: "fontsize",

        exec: function (self, elem, cmd) {
            var args = parseInt($(elem).val());
            var s = ' <span style="font-size:' + args + 'px">' + self.getSelected().text + '</span>';
            var temp = self.getContent();
            if ($.browser.msie && self.range) self.range.select();
            Replace(s, self);
            self.check();
            if (temp != self.getContent() && cmd != "undo") { self.addHis(temp); }
        }
    },

    Bold: { visible: true, tags: ['b', 'strong'], command: "Bold", css: { fontWeight: 'bold' }, tooltip: pluginInfo['Bold'].t },
    Italic: { visible: true, tags: ['i', 'em'], command: "Italic", css: { fontStyle: 'italic' }, tooltip: pluginInfo['Italic'].t },
    Underline: { visible: true, tags: ['u'], command: "Underline", css: { textDecoration: 'underline' }, tooltip: pluginInfo['Underline'].t },


    ForeColor: { visible: true, command: "ForeColor", tooltip: "ForeColor",
        exec: function (self, elem, cmd) {
            cmd = cmd.toLowerCase();

            var c = elem;

            if (!c.color) {
                jscolor.open(c);
            }
            else jscolor.close(c);

            jscolor.callback = function (args) {

                if (self.range) {
                    if ($.browser.msie && self.range) self.range.select();
                    self.addHis();
                    self.editorDoc.execCommand(cmd, false, args);
                }
            }


        }

    },

    BackColor: { visible: true, command: "BackColor", tooltip: "BackColor",
        exec: function (self, elem, cmd) {
            cmd = cmd.toLowerCase();
            var c = elem;
            if (!c.color)
                jscolor.open(c);
            else jscolor.close(c);

            jscolor.callback = function (args) {
                if (self.range) {
                    var temp = self.getContent();   //保存执行命令之前的值
                    if ($.browser.msie) self.range.select();
                    (cmd.toLowerCase() == "backcolor") && ($.browser.mozilla) ? self.editorDoc.execCommand('hilitecolor', false, args) :
                                                        self.editorDoc.execCommand(cmd, false, args);  //非火狐
                    if (temp != self.getContent() && cmd != "undo") self.addHis(temp);  //如果内容变了则将之前的值加入历史记录 以便undo
                }
            }


        }
    },


    JustifyLeft: { visible: true, css: { textAlign: 'left' }, command: "JustifyLeft", tooltip: pluginInfo['JustifyLeft'].t },  //左对齐
    JustifyCenter: { visible: true, tags: ['center'], command: "JustifyCenter", css: { textAlign: 'center' }, tooltip: pluginInfo['JustifyCenter'].t },
    JustifyRight: { visible: true, css: { textAlign: 'right' }, command: "JustifyRight", tooltip: pluginInfo['JustifyRight'].t },
    JustifyFull: { visible: true, css: { textAlign: 'justify' }, command: "JustifyFull", tooltip: pluginInfo['JustifyFull'].t },

    CreateLink: {
        visible: true, command: "CreateLink",
        exec: function () {
            var selection = $(this.editor).documentSelection();

            if (selection.length > 0) {
                if ($.browser.msie) {
                    this.focus();
                    this.editorDoc.execCommand('createLink', true, null);
                }
                else {
                    var szURL = prompt('URL', 'http://');

                    if (szURL && szURL.length > 0) {
                        this.editorDoc.execCommand('unlink', false, []);
                        this.editorDoc.execCommand('createLink', false, szURL);
                    }
                }
            }
            else if (this.options.messages.nonSelection)
                alert(this.options.messages.nonSelection);
        }
    },

    RemoveFormat: {
        visible: true, command: "RemoveFormat",
        exec: function (self, elem, cmd) {
            if ($.browser.msie) self.range.select();
            self.editorDoc.execCommand('removeFormat', false, []);
            self.editorDoc.execCommand('unlink', false, []);
        },
        tooltip: pluginInfo['Removeformat'].t
    },


    InsertVideo: {
        visible: true, command: "InsertVideo", tooltip: pluginInfo['Media'].t,
        exec: function (self, elem, cmd) {

            var dia = $('<div id="insertVideo"></div>').css("overflow", "hidden");
            dia.dialog({
                width: 600,
                height: 300,
                resizable: false,
                title: "插入视频"
            });
            var ifr = $('<iframe/>').attr("id", "iframeInsertVideo").attr("src", "uploadVideo.html").attr("frameborder", "0").width(600).height(220).css({
                "border": "none",
                "outline": "none",
                "overflow": "hidden"
            }).appendTo(dia);
            var divBtn = $('<div class="InsertFooter"> <div id="BtnInsertVideo" class="BtnInsert">插入  </div> </div>').appendTo(dia);
            $("#BtnInsertVideo").click(function () {
                var doc = $("#iframeInsertVideo").document();
                $(doc).find(".ui-tabs-panel").not(".ui-tabs-hide").find("input[type=text]").each(function () {
                    if ($.trim($(this).val()) != "") {
                        str = '<img src="image/videoshot.png" vid="' + $(this).val() + '"></img>';
                        Replace(str, self);

                    }
                    // insert(self, "image/videoshot.png", $(this).val());
                    else alert("地址为空");
                });


            });

        } //exec


    },
    InsertImage: {
        visible: true, command: "InsertImage", tooltip: pluginInfo['Img'].t,
        exec: function (self, elem, cmd) {

            var dia = $('<div id="insertimg"></div>').css("overflow", "hidden").appendTo($("body"));
            dia.dialog({
                width: 630,
                height: 400,
                resizable: false,
                title: "插入图片"
            });
            var ifr = $('<iframe/>').attr("id", "iframeInsertImg").attr("src", "uploadImg.html").attr("frameborder", "0").width(630).height(300).css({
                "border": "none",
                "outline": "none",
                "overflow": "hidden"
            }).appendTo(dia);
            var divBtn = $('<div class="InsertFooter"> <div id="BtnInsertImg"  class="BtnInsert">插入  </div> </div>').appendTo(dia);
            $("#BtnInsertImg").click(function () {
				        	
                var doc = $("#iframeInsertImg").document();
                $(doc).find(".ui-tabs-panel").not(".ui-tabs-hide").find("li img").each(function () {
                    insert(self, $(this).attr("src"));
					
                });
            });

        }

    },
    InserteFace: { visible: true, command: "InsertFace", tooltip: "emot",
        exec: function (self, elem, cmd) {
            var dia = $('<div id="insertemot"></div>').css("overflow", "hidden");
            var d = $('<div/>').css({
                "border": "none",
                "overflow": "hidden"
            }).appendTo(dia).addClass("emotlist");
            var u = $("<ul/>").appendTo(d);
            $.each(Emots, function (index, value) {

                //  alert(Emots[index].title);
                var l = $("<li/>").appendTo(u).click(function () {
                    var szURL = $(this).find("img").attr("src");

                    insert(self, szURL);

                }); ;
                var s = "image/Emot/default/" + Emots[index].path + ".gif";
                $("<img/>").attr("title", Emots[index].title).attr("src", s).appendTo(l);

            });
            dia.dialog({
                width: 400,
                height: 200,
                resizable: false,
                title: "插入表情"
            });


        }
    },

    Html: {
        visible: true, command: "Html",
        exec: function (self) {
            if (this.viewHTML) {  //若是观看源码模式  

                this.setContent($(this.original).val());
                 $(".item").not("[cmd=Html]").each(function (){
				  	self.normal($(this));
				  });
                
                $(this.original).hide();
                $(this.editor).show();
            }
            else {

                $(this.editor.document()).find('body');
                this.saveContent();
                $(this.editor).hide();
                $(this.original).show();
                //   this.setDesignMode(false);
                // $(".item").removeClass('disable');
                 $(".item").not("[cmd=Html]").each(function (){
				  	self.disable($(this));
				  });
            }

            this.viewHTML = !(this.viewHTML);
        },
        tooltip: pluginInfo['Source'].t
    }
};


//表情信息
var Emots = [{ title: "微笑", path: "smile" }, { title: "吐舌头", path: "tongue" },
         { title: "偷笑", path: "titter" }, { title: "大笑", path: "laugh" },
         { title: "难过", path: "sad" }, { title: "委屈", path: "wronged" },
         { title: "快哭了", path: "fastcry" }, { title: "哭", path: "cry" },
         { title: "大哭", path: "wail" }, { title: "生气", path: "mad" },
         { title: "敲打", path: "knock" }, { title: "骂人", path: "curse" },
         { title: "抓狂", path: "crazy" }, { title: "发火", path: "angry" },
         { title: "惊讶", path: "ohmy" }, { title: "尴尬", path: "awkward" },
         { title: "惊恐", path: "panic" }, { title: "害羞", path: "shy" },
         { title: "可怜", path: "cute" }, { title: "羡慕", path: "envy" },
         { title: "得意", path: "proud" }, { title: "闭嘴", path: "shutup" },
         { title: "奋斗", path: "struggle" }, { title: "安静", path: "quiet" },
         { title: "疑问", path: "doubt" }, { title: "鄙视", path: "despise" },
         { title: "睡觉", path: "sleep" }, { title: "再见", path: "bye" }
];

