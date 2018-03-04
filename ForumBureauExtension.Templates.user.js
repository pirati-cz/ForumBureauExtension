// ==UserScript==
// @name         Forum Bureau Extension - Templates
// @namespace    http://pirati.cz/
// @version      0.1
// @description  Extentions for forum.pirati.cz
// @author       Ondrej Kotas
// @match        https://forum.pirati.cz/posting.php?mode=post*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js
// @grant        none
// ==/UserScript==

$(function () {
    // === Define all elements ===    
    // Bureau blocks
    var bureau_block = $("<div id=\"bureau-block\"></div>");
    bureau_block.css("border-radius", "5px");
    bureau_block.css("margin", "10px 0 10px 0");
    bureau_block.css("padding", "0");
    bureau_block.css("width", "100%");
    bureau_block.css("min-height", "100px");
    bureau_block.css("background", "#cadceb");
    
    var bureau_content = $("<div id=\"bureau-content\"></div>");
    bureau_content.css("margin", "0 10px 5px 10px");
    
    // Bureau texts
    var bureau_title = $("<h1>Šablony</h1>");
    bureau_title.css("color", "#105289");
    bureau_title.css("margin", "0 10px 0 10px");
    bureau_title.css("padding", "10px 0 5px 0");
    
    var bureau_titleLine = $("<hr />");
    bureau_titleLine.css("color", "#ffffff");
    bureau_titleLine.css("border-color", "#ffffff");
    bureau_titleLine.css("width", "100%");
    
    var bureau_cats = [
        $("<h2 class=\"bureau\">Schůze</h2>"),
        $("<h2 class=\"bureau\">Jednání</h2>")
    ];

    var bureau_cats_links = [
        $("<ul class=\"bureau\" id=\"cat0\"></ul>"),
        $("<ul class=\"bureau\" id=\"cat1\"></ul>")
    ];

    var index;
    for (index = 0; index < bureau_cats.length; ++index) {
        bureau_cats[index].css("color", "#000000");
        bureau_cats[index].css("margin", "0");
        bureau_cats[index].css("padding", "0");
        bureau_cats[index].css("font-size", "10pt");
        bureau_cats[index].css("font-weight", "bold");

        bureau_cats_blocks[index].css("float:", "");
    }
    

    // === Compose feature ===
    for (index = 0; index < bureau_cats.length; ++index) {
        bureau_cats[index].append(bureau_cats_blocks[index]);
        bureau_content.append(bureau_cats[index]);
    }

    $('#page-body').prepend(bureau_block);
    bureau_title.append(bureau_titleLine);
    bureau_block.append(bureau_title);

    bureau_block.append(bureau_content);
})();