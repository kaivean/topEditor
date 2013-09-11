
//插件资源

var pluginInfo = {   //插件的提示信息
           Cut: {
            t: "\u526a\u5207"
        }
        , Copy: {
            t: "\u590d\u5236"
        }
        , Paste: {
            t: "\u7c98\u8d34"
        }
        , Pastetext: {
            t: "\u7c98\u8d34\u6587\u672c"
        }
        , Blocktag: {
            t: "\u6bb5\u843d\u6807\u7b7e"
        }
        , Fontface: {
            t: "\u5b57\u4f53"

        }
        , FontSize: {
            t: "\u5b57\u4f53\u5927\u5c0f"
        }
        , Bold: {
            t: "\u52a0\u7c97"
        }
        , Italic: {
            t: "\u659c\u4f53"
        }
        , Underline: {
            t: "\u4e0b\u5212\u7ebf"
        }
        , Strikethrough: {
            t: "\u5220\u9664\u7ebf"
        }
        , FontColor: {
            t: "\u5b57\u4f53\u989c\u8272"
        }
        , BackColor: {
            t: "\u80cc\u666f\u989c\u8272"
        }
        , SelectAll: {
            t: "\u5168\u9009 (Ctrl+A)"
        }
        , Removeformat: {
            t: "\u5220\u9664\u6587\u5b57\u683c\u5f0f"
        }
        , Align: {
            t: "\u5bf9\u9f50", h: 1
        }
        , List: {
            t: "\u5217\u8868", h: 1
        }
        , Outdent: {
            t: "\u51cf\u5c11\u7f29\u8fdb"
        }
        , Indent: {
            t: "\u589e\u52a0\u7f29\u8fdb"
        }
        , Link: {
            t: "\u8d85\u94fe\u63a5 (Ctrl+L)"
        }
        , Unlink: {
            t: "\u53d6\u6d88\u8d85\u94fe\u63a5"
        }
        , Anchor: {
            t: "\u951a\u70b9", h: 0
        }
        , Img: {
            t: "\u56fe\u7247", h: 0
        }
        , Flash: {
            t: "Flash\u52a8\u753b", h: 0
        }
        , Media: {
            t: "\u591a\u5a92\u4f53\u6587\u4ef6", h: 0
        }
        , Hr: {
            t: "\u63d2\u5165\u6c34\u5e73\u7ebf"
        }
        , Emot: {
            t: "\u8868\u60c5", s: "ctrl+e", h: 0
        }
        , Table: {
            t: "\u8868\u683c", h: 0
        }
        , Source: {
            t: "\u6e90\u4ee3\u7801"
        }
        , Preview: {
            t: "\u9884\u89c8"
        }
        , Print: {
            t: "\u6253\u5370 (Ctrl+P)"
        }
        , Fullscreen: {
            t: "\u5168\u5c4f\u7f16\u8f91"

        }, JustifyLeft: {
            t: "JustifyLeft"

        }, JustifyCenter: {
            t: "JustifyCenter"

        }, JustifyRight: {
            t: "JustifyRight"

        }
        , JustifyFull: {
            t: "JustifyFull"
        }
        , Subscript: {
            t: "Subscript"
        }
        , Superscript: {
            t: "Superscript"
        }
        , Undo: {
            t: "Undo"
        }
        , Redo: {
            t: "Redo"
        }

}




//颜色集合
Colors = "#FFFFFF,#CCCCCC,#C0C0C0,#999999,#666666,#333333,#000000,#FFCCCC,#FF6666,#FF0000,#CC0000,#990000,#660000,#330000,#FFCC99,#FF9966,#FF9900,#FF6600,#CC6600,#993300,#663300,#FFFF99,#FFFF66,#FFCC66,#FFCC33,#CC9933,#996633,#663333,#FFFFCC,#FFFF33,#FFFF00,#FFCC00,#999900,#666600,#333300,#99FF99,#66FF99,#33FF33,#33CC00,#009900,#006600,#003300,#99FFFF,#33FFFF,#66CCCC,#00CCCC,#339999,#336666,#003333,#CCFFFF,#66FFFF,#33CCFF,#3366FF,#3333FF,#000099,#000066,#CCCCFF,#9999FF,#6666CC,#6633FF,#6600CC,#333399,#330099,#FFCCFF,#FF99FF,#CC66CC,#CC33CC,#993399,#663366,#330033".split(",")

//字体信息
Families = [
"\u5b8b\u4f53",
"\u4eff\u5b8b\u4f53",
"\u9ed1\u4f53",
"\u5fae\u8f6f\u96c5\u9ed1",
"Arial",
"Arial Black",
"Comic Sans MS",
"Courier New",
"System",
"Times New Roman",
"Tahoma",
"Verdana"
]
    ,




//插件显示信息
Ia = {
    mini: "Bold,Italic,Underline,Strikethrough,|,Align,List,|,Link,Img", simple: "Blocktag,Fontface,FontSize,Bold,Italic,Underline,Strikethrough,FontColor,BackColor,|,Align,List,Outdent,Indent,|,Link,Img,Emot", full: "Cut,Copy,Paste,Pastetext,|,Blocktag,Fontface,FontSize,Bold,Italic,Underline,Strikethrough,FontColor,BackColor,SelectAll,Removeformat,|,Align,List,Outdent,Indent,|,Link,Unlink,Anchor,Img,Flash,Media,Hr,Emot,Table,|,Source,Preview,Print,Fullscreen"
}


//键码信息
Codes = {
    27: "esc", 9: "tab", 32: "space", 13: "enter", 8: "backspace", 145: "scroll", 20: "capslock", 144: "numlock", 19: "pause", 45: "insert", 36: "home", 46: "del", 35: "end", 33: "pageup", 34: "pagedown", 37: "left", 38: "up", 39: "right", 40: "down", 112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8", 120: "f9", 121: "f10", 122: "f11", 123: "f12"
};

