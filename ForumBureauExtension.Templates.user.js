// ==UserScript==
// @name         Forum Bureau extension - Templates
// @namespace    http://pirati.cz/
// @version      1.0.2
// @description  Extention for Stylish script on forum.pirati.cz
// @author       Ondrej Kotas
// @match        https://forum.pirati.cz/posting.php?mode=post*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js
// @require      https://raw.githubusercontent.com/ether/etherpad-lite-jquery-plugin/master/js/etherpad.js
// @grant        none
// ==/UserScript==

var DEBUG = true;

// TRIGGER
$.get("https://pad.pirati.cz/p/bureau_template_list/export/txt", FillTemplatesList);

// FUNCTIONS
function FillTemplatesList(data) {
  var templateBox = $("#postform #postingbox").find("dl:contains('Předmět:')").clone();
  var templateListBox = $("<select></select>");
  var lines = data.split("\n");
  var helplink = $("<a></a>");
  var hrline = $("<hr />");
  
  helplink.attr("href", "https://github.com/pirati-cz/ForumBureauExtension/wiki");
  helplink.text("[?]");
  helplink.attr("title", "Nabídka šablon pro rutinní úlohy. Pro více informací klikněte.");
  helplink.attr("target", "_blank");
  
  templateBox.find("label").text("Šablona:");
  templateBox.find("label").append(helplink);
  templateBox.find("input").remove();
  templateListBox.css("min-width", "335px");
  templateListBox.append($("<option />").val("").text(""));  
  templateListBox.attr("id", "bureau_select");
  
  templateListBox.on("change", function(){
     if(this.value != "") {
        $.get(this.value + "/export/txt", FillPostingboxWithTemplate);
     }
     else {
        $("form#postform").trigger('reset');
     }
  });
  
  for (i = 0; i < lines.length; i++) {
    if(lines[i] != "") {
      var pair = lines[i].split("|");
  
      Log("INFO", pair);
      templateListBox.append($("<option />").val(pair[1]).text(pair[0])); 
    }
  }
  
  templateBox.append(templateListBox);
  templateBox.append(hrline);
  $("#postingbox dl").prepend(templateBox);
}

function FillPostingboxWithTemplate(data) {
  var lines = data.split("\n");
  if(lines[0] == "#šablona") {
     // TODO: syntax engine na formuláře
     // 
     if(SearchStringInArray("!anketa", lines) > 0) {
       FillValWithPadTag("#poll_title", "!anketa-otazka:", lines);
       FillTextWithPadTag("#poll_option_text", "!anketa-moznosti:", lines);
       FillNumValWithPadTag("#poll_max_options", "!anketa-max-moznosti:", lines);
       FillNumValWithPadTag("#poll_length", "!anketa-delka-trvani:", lines);
       FillCheckboxWithPadTag("#poll_vote_change", "!anketa-povolit-zmenu-hlasu:", lines);
       FillCheckboxWithPadTag("#poll_show_results", "!anketa-zobrazit-vysledky:", lines);
       
       $("li#options-panel-tab.tab").removeClass("activetab");
       $("li#attach-panel-tab.tab").removeClass("activetab");
       $("li#poll-panel-tab.tab").addClass("activetab");
       $("#options-panel").css("display", "none");
       $("#attach-panel").css("display", "none");
       $("#poll-panel").css("display", "block");
     }
    
     FillValWithPadTag("#postingbox #subject", "!predmet:", lines);
     FillTextWithPadTag("#postingbox textarea", "!obsah:", lines);
  }
  else {
     $("#postingbox #subject").val(lines[0]); 
     $("#postingbox textarea").val(lines.join("\n"));
     Log("INFO", lines)
  }
}

function FillTextWithPadTag(element, tag, lines) {
  if(SearchStringInArray(tag, lines) > 0) {
    var tagClose = tag.replace("!", "").replace(":", "!");
    var openingLine = SearchStringInArray(tag, lines) +1;
    var closingLine = SearchStringInArray(tagClose, lines);
    Log("INFO", lines.slice(openingLine, closingLine).join("\n"));
    $(element).val(lines.slice(openingLine, closingLine).join("\n"));
  }
}

function FillValWithPadTag(element, tag, lines) {
  if(SearchStringInArray(tag, lines) > 0) {
    var value = lines[SearchStringInArray(tag, lines)].replace(tag, "");
    Log("INFO", value);
    $(element).val(value);
  }
}

function FillNumValWithPadTag(element, tag, lines) {
  if(SearchStringInArray(tag, lines) > 0) {
    var value = lines[SearchStringInArray(tag, lines)].replace(tag, "");
    if(value == "") {
      value = "0";
    }
    Log("INFO", value);
    $(element).val(value);
  }
}

function FillCheckboxWithPadTag(element, tag, lines) {
  if(SearchStringInArray(tag, lines) > 0) {
    var value = lines[SearchStringInArray(tag, lines)].replace(tag, "");
    Log("INFO", value);
    if(value == "ano") {
      $(element).prop('checked', true); 
    }
    else {
     $(element).prop('checked', false);
    }
  }  
}

function SearchStringInArray(str, strArray) {
    for (var j=0; j<strArray.length; j++) {
        if (strArray[j].match(str)) return j;
    }
    return -1;
}

// For todays date;
Date.prototype.today = function () { 
    return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
}

// For the time now
Date.prototype.timeNow = function () {
     return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}

function Log(level, message) {
  if(DEBUG) {
    var newDate = new Date();
    var datetime = newDate.today() + " " + newDate.timeNow();
    console.log(datetime + " [" + level + "] " + message);
  }
}
