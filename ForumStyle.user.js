// ==UserScript==
// @name         Pirati phpBB style
// @namespace    http://pirati.cz/
// @version      0.35
// @description  Extention for Stylish script on forum.pirati.cz
// @author       Ondrej Kotas
// @match        https://forum.pirati.cz/*
// @grant        none
// ==/UserScript==

$("a.lastsubject").each(function() {
  $( this ).text($( this).attr("title"));
});

$("a[itemprop='url']").each(function() {
  $( this ).text($( this).attr("title"));
});

$("#nav-main li.rightside:not(:first)").each(function() {
    var prevLeft = parseFloat($( this ).prev().css("left").replace(/[^-\d\.]/g, ''));
    prevLeft = prevLeft || 0;
    var prevWidth = $ ( this ).prev().width();
    $( this ).css("left", prevLeft + prevWidth + 10);
});

var newTopics = $("#nav-main li.responsive-hide:contains('Nové')");
newTopics.html(newTopics.html().replace("Nové", "Nového"));

var activeTopics = $("#nav-main li.responsive-hide:first");
activeTopics.parent().append(activeTopics);


var navMain = $("#nav-main");

var logout = $("#username_logged_in a[title='Odhlásit se']").clone();
logout.attr("id", "ok_logoutButton");
navMain.append(logout);

var modPanel = $("#quick-links a[title='Moderátorský panel']").clone();
modPanel.attr("id", "ok_modPanel");
navMain.append(modPanel);

var thanksList = $("#quick-links a[href='/app.php/thankslist']").clone();
thanksList.attr("id", "ok_thanksList");
navMain.append(thanksList);


var groupsList = thanksList.clone();
groupsList.find("span").text("Nastavit zobrazovaná fóra");
groupsList.attr("href", "ucp.php?i=167");
groupsList.attr("id", "ok_groupsList");
groupsList.find("i").addClass("fa-user-plus").removeClass("fa-thumbs-o-up");
navMain.append(groupsList);

$(".postbody .post-buttons .button span:contains('Upravit')").addClass("ok_showText");
$(".postbody .post-buttons .button span:contains('Citace')").addClass("ok_showText");
var thanksButton = $(".postbody .post-buttons .button span:contains('Poděkujte')");
if(thanksButton.length) {
  thanksButton.addClass("ok_showText");
  thanksButton.html(thanksButton.html().replace("Poděkujte", "Dík"));
}

$("div.post").each(function(){
   var notice = $( this ).find("div.notice");
   $( this ).find("div.signature").append(notice);
});

