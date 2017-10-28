// ==UserScript==
// @name         Forum Bureau Extension
// @namespace    http://pirati.cz/
// @version      0.1
// @description  Extentions for forum.pirati.cz
// @author       Ondrej Kotas
// @match        https://forum.pirati.cz/*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js
// @grant        none
// ==/UserScript==

$(function () {
    // === Define all elements ===
    // Constants
    var bureau_linksTitleText = "Přejít na";
    var homeOrganizationButtonText = "Fórum domovského krajského sdružení";
    
    // Bureau blocks
    var bureau_block = $("<div id=\"bureau-block\"></div>");
    bureau_block.css("border-radius", "5px");
    bureau_block.css("margin", "10px 0 10px 0");
    bureau_block.css("padding", "0");
    bureau_block.css("width", "100%");
    bureau_block.css("min-height", "100px");
    bureau_block.css("background", "#cadceb");
    
    var bureau_links = $("<div id=\"bureau-links\"></div>");
    bureau_links.css("margin", "0 10px 5px 10px");
    
    // Bureau texts
    var bureau_title = $("<h1>Bureau</h1>");
    bureau_title.css("color", "#105289");
    bureau_title.css("margin", "0 10px 0 10px");
    bureau_title.css("padding", "10px 0 5px 0");
    
    var bureau_titleLine = $("<hr />");
    bureau_titleLine.css("color", "#ffffff");
    bureau_titleLine.css("border-color", "#ffffff");
    bureau_titleLine.css("width", "100%");
    
    var bureau_linksTitle = $("<h2>" + bureau_linksTitleText + ":</h2>");
    bureau_linksTitle.css("color", "#000000");
    bureau_linksTitle.css("margin", "0");
    bureau_linksTitle.css("padding", "0");
    bureau_linksTitle.css("font-size", "10pt");
    bureau_linksTitle.css("font-weight", "bold");
    
    // Bureau buttons
    var homeOrganizationButton = $("<a href=\"" + GetHomeForumLink(36) + "\">" + homeOrganizationButtonText + "</a>");
    homeOrganizationButton.css("margin", "3px 0 0 0");
    homeOrganizationButton.css("font-size", "8pt");
    homeOrganizationButton.css("cursor", "pointer");
    
    // === Compose feature ===
    var username = GetUserName();
    
    if (username !== "") {
        bureau_links.append(bureau_linksTitle);
        bureau_links.append(homeOrganizationButton);

        $('#page-body').prepend(bureau_block);
        bureau_title.append(" - Vítejte " + username);
        bureau_title.append(bureau_titleLine);
        bureau_block.append(bureau_title);
        bureau_block.append(bureau_links);
        
        bureau_links.append(GetUserGroups(username));
    }
})();


// Parsuje username z tlacitka odhlasit na foru
function GetUserName() {
    if ($(".icon-logout").text() == "Přihlásit se") {
        return "";
    }
    else {
        return $(".icon-logout a").text().replace("Odhlásit [ ", "").replace(" ]", "");
    }
}

function GetUserGroups(username) {
  var groupsJsonUrl = "https://graph.pirati.cz/user/" + username + "/groups";
    
    $.getJSON( groupsJsonUrl, function( json ) {
        console.log( "JSON Data: " + json );
    });
    
    //return groupsJsonUrl;
}

// Na zaklade ID z graphApi poskytne adresu prislusneho fora
function GetHomeForumLink(forumId) {
    var forums = [
        [32, "kralovehradecky-kraj-f86"],
        [33, "praha-f78"],
        [34, "moravskoslezsky-kraj-f81"],
        [35, "pardubicky-kraj-f85"],
        [36, "jihomoravsky-kraj-f83"],
        [37, "vysocina-f84"],
        [38, "olomoucky-kraj-f80"],
        [42, "ustecky-kraj-f88"],
        [39, "zlinsky-kraj-f82"],
        [40, "jihocesky-kraj-f90"],
        [41, "liberecky-kraj-f87"],
        [43, "karlovarsky-kraj-f79"],
        [44, "plzensky-kraj-f89"],
        [78, "stredocesky-kraj-f276"]
    ];
    return indexLookup(forums, forumId);
}

function indexLookup(arr, search){
    for (i = 0; i < arr.length; i++) {
        if (arr[i][0] === search) return arr[i][1];
    }

    return undefined;
}