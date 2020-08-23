// ==UserScript==
// @name         MCBBS Extender-Core
// @namespace    https://i.zapic.cc
// @version      v2.0.1-beta
// @description  MCBBS模块化优化框架
// @author       Zapic
// @match        https://*.mcbbs.net/*
// @run-at       document-body
// ==/UserScript==

// Core
(() => {
    let ShouldRun = true;
    // jQuery检查
    if (typeof jQuery == "undefined") {
        console.error("This page does NOT contain JQuery,MCBBS Extender will not work.");
        ShouldRun = false;
    }
    //在手机页面主动禁用
    if (document.getElementsByTagName('meta').viewport) {
        console.log("MCBBS Extender not fully compatible with Moblie page,exit manually");
        ShouldRun = false;
    }
    //夹带私货
    console.log(" %c Zapic's Homepage %c https://i.zapic.cc ", "color: #ffffff; background: #E91E63; padding:5px;", "background: #000; padding:5px; color:#ffffff");
    // 基本信息初始化
    let version = "v2.0.0 - beta";
    let vercode = 121040;
    let valueList = {};
    let configList = [];
    // 加载ValueStorage
    try {
        valueList = JSON.parse(localStorage.getItem("MExt_config"));
        if (typeof valueList != "object" || valueList == null) {
            valueList = {};
            localStorage.setItem("MExt_config", "{}")
        }
    } catch (ignore) {
        valueList = {};
        localStorage.setItem("MExt_config", "{}")
    }
    // 导出模块
    let exportModule = (...modules) => {
        if (!ShouldRun) { return; }
        for (let m of modules) {
            try {
                moduleLoader(m);
            } catch (e) {
                console.error("Error occurred while try to load a module:\n" + e);
            }
        }
    }
    let $ = unsafeWindow.jQuery;
    let dlg = (m) => {
        console.debug("[MCBBS Extender]" + m);
    };
    let setValue = (name, val) => {
        valueList[name] = val;
        localStorage.setItem("MExt_config", JSON.stringify(valueList));
    }
    let getValue = (name) => {
        return valueList[name];
    }
    let deleteValue = (name) => {
        delete valueList[name];
        localStorage.setItem("MExt_config", JSON.stringify(valueList));
    }
    $('head').append('<style id="MExt_CoreStyle"></style>');
    let appendStyle = (style) => {
        document.getElementById('MExt_CoreStyle').innerHTML += "\n" + style;
    };
    let getRequest = (variable, url = "") => {
            let query = url ? /\?(.*)/.exec(url)[1] : window.location.search.substring(1);
            let vars = query.split("&");
            for (let i = 0; i < vars.length; i++) {
                let pair = vars[i].split("=");
                if (pair[0] == variable) {
                    return pair[1];
                }
            }
            return (false);
        }
        // 模块加载器
    let moduleLoader = (module) => {
        // 载入配置项
        if (typeof module.config !== "undefined") {
            module.config.forEach((v) => {
                if (typeof getValue(v.id) == "undefined") {
                    setValue(v.id, v.default);
                }
                let config = v;
                v.value = getValue(v.id);
                configList.push(config);
            });
        }
        // 判断是否应该运行
        if (typeof module.runcase == "function") {
            if (!module.runcase()) {
                return;
            }
        }
        // 加载模块CSS
        if (typeof module.style == 'string') {
            appendStyle(module.style);
        }
        // 运行模块Core
        if (typeof module.core == "function") {
            module.core();
        }
    }

    // 钩住DiscuzAjax函数,使其触发全局事件
    let __ajaxpost = ajaxpost;
    ajaxpost = (formid, showid, waitid, showidclass, submitbtn, recall) => {
        let relfunc = () => {
            if (typeof recall == 'function') {
                recall();
            } else {
                eval(recall);
            }
            $(this).trigger('DiscuzAjaxPostFinished');
        }
        __ajaxpost(formid, showid, waitid, showidclass, submitbtn, relfunc);
    }
    let __ajaxget = ajaxget;
    ajaxget = (url, showid, waitid, loading, display, recall) => {
        let relfunc = () => {
            if (typeof recall == 'function') {
                recall();
            } else {
                eval(recall);
            }
            $(this).trigger('DiscuzAjaxGetFinished');
        }
        __ajaxget(url, showid, waitid, loading, display, relfunc);
    }
    dlg("Hooked into Discuz Ajax");

    // 对外暴露API
    let MExt = {
        "ValueStorage": {
            "get": getValue,
            "set": setValue,
            "delete": deleteValue
        },
        "exportModule": exportModule,
        "debugLog": dlg,
        "versionName": version,
        "versionCode": vercode,
        "jQuery": $,
        "configList": configList,
        "Units": {
            "appendStyle": appendStyle,
            "getRequest": getRequest
        }
    };
    unsafeWindow.MExt = MExt;
    dlg("Core loaded.");
})();

// Settings
(() => {
    let MExt = unsafeWindow.MExt;
    let $ = MExt.jQuery;
    let Md = {
        "style": `.conf_contain {
            max-height: 45vh;
            overflow-y: auto;
            padding-right: 5px;
            overflow-x: hidden;
            scrollbar-color: rgba(0, 0, 0, 0.17) #f7f7f7;
            scrollbar-width: thin;
        }

        .alert_info ::-webkit-scrollbar {
            background: #f7f7f7;
            height: 7px;
            width: 7px
        }

        .alert_info ::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.35);
        }

        .alert_info ::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.17);
        }

        .conf_item {
            line-height: 1.2;
            margin-bottom: 5px;
        }

        .conf_title {
            font-weight: 1000;
        }

        .conf_subtitle {
            font-size: 10px;
            color: rgba(0, 0, 0, 0.5);
            padding-right: 40px;
            display: block;
        }

        .conf_check {
            float: right;
            margin-top: -25px;
        }

        .conf_input {
            float: right;
            width: 30px;
            margin-top: -27px;
        }

        .conf_longinput {
            width: 100%;
            margin-top: 5px;
        }

        .conf_textarea {
            width: calc(100% - 4px);
            margin-top: 5px;
            resize: vertical;
            min-height: 50px;
        }`,
        "core": () => {
            let getRequest = MExt.Units.getRequest;
            $(() => {
                // 发送警告
                if (location.pathname == "/forum.php" && getRequest('mod') == "post" && getRequest('action') == "newthread" && getRequest('fid') == "246") {
                    $("body").append($(`<div id="close_script_alert" style="max-width:430px;position: fixed; left: 20px; top: 80px; z-index: 9999; transform: matrix3d(1, 0, 0, 0.0001, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1.025) translateX(-120%); background: rgba(228, 0, 0, 0.81); color: white; padding: 15px; transition-duration: 0.3s; border-radius: 5px; box-shadow: rgba(0, 0, 0, 0.66) 2px 2px 5px 0px;"><h1 style="font-size: 3em;float: left;margin-right: 12px;font-weight: 500;margin-top: 6px;">警告</h1><span style="font-size: 1.7em;">您正在向反馈与投诉版发表新的帖子</span><br>如果您正在向论坛报告论坛内的Bug,请先关闭此脚本再进行一次复现,以确保Bug不是由MCBBS Extender造成的.</div>`));
                    setTimeout(() => { $("#close_script_alert")[0].style.transform = "matrix3d(1, 0, 0, 0.0001, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1.025)"; }, 10);
                    setTimeout(() => { $("#close_script_alert")[0].style.transform = "none"; }, 300);
                    setTimeout(() => { $("#close_script_alert")[0].style.transform = "translateX(-120%)"; }, 10000);
                    MExt.debugLog("Warning send");
                }
                // 设置界面初始化
                $("#user_info_menu .user_info_menu_btn").append("<li><a href='javascript: void(0);' id=\"MExt_config\">MCBBS Extender 设置</a></li>");
                let confwinContent = '<style>body{overflow:hidden}.altw{width:700px;max-width:95vh;}.alert_info {background-image: unset;padding-left: 20px;padding-right: 17px;}</style><div class="conf_contain">';
                let inputType = {
                    "check": '',
                    "num": '',
                    "text": '',
                    "textarea": ''
                };
                MExt.configList.forEach((v) => {
                    switch (v.type) {
                        case "check":
                            inputType.check += '<p class="conf_item"><span class="conf_title">' + v.name + '</span><br><span class="conf_subtitle">' + v.desc + '</span><input class="conf_check" type="checkbox" id="in_' + v.id + '"></input></p>';
                            break;
                        case "num":
                            inputType.num += '<p class="conf_item"><span class="conf_title">' + v.name + '</span><br><span class="conf_subtitle">' + v.desc + '</span><input type="number" class="conf_input" id="in_' + v.id + '"></input></p>';
                            break;
                        case "text":
                            inputType.text += '<p class="conf_item"><span class="conf_title">' + v.name + '</span><br><span class="conf_subtitle">' + v.desc + '</span><input type="text" class="conf_longinput" id="in_' + v.id + '"></input></p>';
                            break;
                        case "textarea":
                            inputType.textarea += '<p class="conf_item"><span class="conf_title">' + v.name + '</span><br><span class="conf_subtitle">' + v.desc + '</span><textarea class="conf_textarea" id="in_' + v.id + '"></textarea></p>';
                            break;
                        default:
                            inputType.check += '<p class="conf_item"><span class="conf_title">' + v.name + '</span><br><span class="conf_subtitle">' + v.desc + '</span><input class="conf_check" type="checkbox" id="in_' + v.id + '"></input></p>';
                            break;
                    }
                });
                confwinContent += inputType.check + inputType.num + inputType.text + inputType.textarea + '</div>';
                MExt.debugLog('Setting window content loaded.');
                $("#MExt_config").on("click", () => {
                    unsafeWindow.showDialog(
                        confwinContent,
                        "confirm",
                        "MCBBS Extender 设置",
                        () => {
                            MExt.configList.forEach((v) => {
                                let val = '';
                                if (v.type == "num" || v.type == "text" || v.type == "textarea") {
                                    val = $("#in_" + v.id).val();
                                } else {
                                    val = $("#in_" + v.id).prop("checked");
                                }
                                MExt.ValueStorage.set(v.id, val);
                            });
                            setTimeout(() => {
                                unsafeWindow.showDialog("设置已保存,刷新生效<style>.alert_info{background:url(https://www.mcbbs.net/template/mcbbs/image/right.gif) no-repeat 8px 8px}</style>", "confirm", "", () => { location.reload() }, true, () => {}, "", "刷新", "确定");
                            });
                        },
                        true,
                        () => {},
                        "MCBBS Extender " + MExt.versionName + " - <s>世界第二委屈公主殿下</s>"
                    );
                    MExt.configList.forEach((v) => {
                        if (v.type == "num" || v.type == "text" || v.type == "textarea") {
                            $("#in_" + v.id).val(MExt.ValueStorage.get(v.id));
                        } else {
                            $("#in_" + v.id).prop("checked", MExt.ValueStorage.get(v.id));
                        }
                    });
                });
            });
        }
    };
    MExt.exportModule(Md);
})();

// Update Manager
(() => {
    let updatelist = [
        "1. 新增 开发事件API,为某些用户交互触发事件(如打开评分窗口)."
    ];
    unsafeWindow.MExt.exportModule({
        "core": () => {
            if (typeof unsafeWindow.MExt.ValueStorage.get("LastVersion") == "undefined") {
                unsafeWindow.MExt.ValueStorage.set("LastVersion", unsafeWindow.MExt.versionCode);
                showDialog("<b>欢迎使用MCBBS Extender</b>.<br>脚本本身不包含任何功能,请到<a style=\"color: #E91E63\" href=\"https://github.com/Proj-MExt/Modules-Repo\">模块仓库</a>寻找模块.<br>设置按钮已经放进入了您的个人信息菜单里,如需调整设置请在个人信息菜单里查看.", "right", "欢迎", () => {
                    showMenu('user_info');
                    unsafeWindow.MExt.jQuery("#MExt_config").css("background-color", "#E91E63").css("color", "#fff");
                    setTimeout(() => {
                        hideMenu('user_info_menu');
                        unsafeWindow.MExt.jQuery("#MExt_config").css("background-color", "").css("color", "");
                    }, 3000);
                });
                return;
            }
            if (unsafeWindow.MExt.ValueStorage.get("LastVersion") == unsafeWindow.MExt.versionCode) { return; }
            let updateContent = '';
            updatelist.forEach((v) => {
                updateContent += "<br>" + v;
            });
            showDialog("<b>MCBBS Extender 已经更新至 " + unsafeWindow.MExt.versionName + "</b>" + updateContent, "right");
            unsafeWindow.MExt.ValueStorage.set("LastVersion", unsafeWindow.MExt.versionCode);
        }
    });
})();

// Observer
(() => {
    let $ = unsafeWindow.MExt.jQuery;
    let removeHandler = (r) => {
        switch(r.target.nodeName){
            case "TBODY":
                if(typeof r.target.id != "undefined"){
                    if(r.target.id.lastIndexOf("normalthread_") >= 0){
                        $(r.target).trigger("ThreadPreviewClosed");
                    }
                }
                break;
            case "DIV":
                if(typeof r.target.id != 'undefined' && r.target.id.lastIndexOf("threadPreview_") >= 0){
                    if(r.removedNodes[0].nodeName == "SPAN" && r.removedNodes[0].innerText == " 请稍候..."){
                        $(r.target).trigger("ThreadPreviewOpened");
                    }
                } else if(r.removedNodes.length >=3 && r.target.id.lastIndexOf("post_") >= 0){
                    if(r.removedNodes[0].nodeName == "A" && r.removedNodes[0].name == "newpost" && r.removedNodes[0].parentNode != null){
                        $(r.target).trigger("ThreadFlushStarted");
                    }
                } else if(r.target.id == "append_parent"){
                    if(r.removedNodes[0].nodeName == "DIV"){
                        if( r.removedNodes[0].id == "fwin_rate"){
                            $(r.target).trigger("RateWindowClosed");
                        } else if( r.removedNodes[0].id == "fwin_reply"){
                            $(r.target).trigger("ReplyWindowClosed");
                        } else if( typeof r.removedNodes[0].id != 'undefined' && r.removedNodes[0].id.lastIndexOf("fwin_miscreport") >= 0 ){
                            console.log("Report window closed.");
                            $(r.target).trigger("ReportWindowClosed");
                        }
                    }
                }
                break;
        }
    }
    let addHandler = (r) => {
        switch(r.target.nodeName){
            case "DIV":
                if(typeof r.target.id != "undefined"){
                    if(r.target.id.lastIndexOf("threadPreview_") >= 0){
                        if(r.addedNodes[0].nodeName == "SPAN" && r.addedNodes[0].innerText == " 请稍候..."){
                            $(r.target).trigger("ThreadPreviewPreOpen");
                        }
                    }else if(r.addedNodes.length >= 3 && r.target.id.lastIndexOf("post_") >= 0){
                        if(r.addedNodes[0].nodeName == "A" && r.addedNodes[0].name == "newpost" && r.addedNodes[0].parentNode != null){
                            $(r.target).trigger("ThreadFlushFinished");
                        }
                    }else if(r.target.id == "append_parent"){
                        if(r.addedNodes[0].nodeName == "DIV"){
                            if(r.addedNodes[0].id == "fwin_rate"){
                                $(r.addedNodes[0]).trigger("RateWindowPreOpen");
                            } else if (r.addedNodes[0].id == "fwin_reply"){
                                $(r.addedNodes[0]).trigger("ReplyWindowPreOpen");
                            } else if (typeof r.addedNodes[0].id != 'undefined' && r.addedNodes[0].id.lastIndexOf("fwin_miscreport") >= 0){
                                $(r.addedNodes[0]).trigger("ReportWindowPreOpen");
                            }
                        }
                    } else if(r.target.id === "") {
                        if(r.target.parentElement !=null && r.target.parentElement == "postlistreply"){
                            $(r.target).trigger("NewReplyAppended");
                        }
                    }
                }
                break;
            case "A":
                if(r.addedNodes[0].nodeName == "#text"){
                    if(r.addedNodes[0].nodeValue == "正在加载, 请稍后...") {
                        console.log(r.target).trigger("ThreadsListLoadStart");
                    } else if(r.addedNodes[0].nodeValue == "下一页 »") {
                        console.log(r.target).trigger("ThreadsListLoadFinished");
                    }
                }
                break;
            case "TD":
                if(r.target.id == "fwin_content_rate" && r.addedNodes[0].nodeName == "DIV" && r.addedNodes[0].id == "floatlayout_topicadmin" ){
                    $(r.target).trigger("RateWindowOpened");
                }
                if(r.target.id == "fwin_content_reply" && r.addedNodes[0].nodeName == "H3" && r.addedNodes[0].id == "fctrl_reply" ){
                    $(r.target).trigger("ReplyWindowOpened");
                }
                if(typeof r.target.id != 'undefined' && r.target.id.lastIndexOf("fwin_content_miscreport") >= 0 && r.addedNodes[0].nodeName == "H3" && r.addedNodes[0].id.lastIndexOf("fctrl_miscreport") >= 0){
                    $(r.target).trigger("ReportWindowOpened");
                }
                break;
        }
    }
    let mainHandler = (r) => {
        if(r.type == "childList"){
            if(r.addedNodes.length > 0){
                addHandler(r);
            }
            if(r.removedNodes.length > 0){
                removeHandler(r);
            }
        }
    }
    let O = new MutationObserver((e,f)=>{
        for(let record of e){
            mainHandler(record);
        }
    });
    O.observe(document.body,{ childList: true, subtree: true });
})();
