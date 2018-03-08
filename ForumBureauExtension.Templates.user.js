// ==UserScript==
// @name         Forum Bureau extension - Templates
// @namespace    http://pirati.cz/
// @version      1.2.0
// @description  Extention for Stylish script on forum.pirati.cz
// @author       Ondrej Kotas
// @match        https://forum.pirati.cz/posting.php?mode=post*
// @require      https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.5/js/select2.full.min.js
// @grant        none
// ==/UserScript==

var DEBUG = true;

// TRIGGER
ComposeTemplateBlock();
$.get("https://pad.pirati.cz/p/bureau_template_list/export/txt", LoadTemplatesList);

// FUNCTIONS
function ComposeTemplateBlock() {
  var templateBox = $("#postform #postingbox").find("dl:contains('Předmět:')").clone();
  var templateListBox = $("<select></select>");
  var helplink = $("<a></a>");
  var hrline = $("<hr />");

  helplink.attr("href", "https://github.com/pirati-cz/ForumBureauExtension/wiki");
  helplink.text("[?]");
  helplink.attr("title", "Nabídka šablon pro rutinní úlohy. Pro více informací klikněte.");
  helplink.attr("target", "_blank");
  helplink.attr("id", "bureau_helplink");

  templateBox.find("label").text("Šablona:");
  templateBox.find("label").append(helplink);
  templateBox.find("input").remove();
  templateListBox.append($("<option />").val("").text("bez šablony"));  
  templateListBox.attr("id", "bureau_select");

  templateListBox.on("change", function(){
     if(this.value != "") {
        $.get(this.value + "/export/txt", FillPostingboxWithTemplate);
     }
     else {
        $("form#postform").trigger('reset');
        $("li#options-panel-tab.tab").addClass("activetab");
        $("li#attach-panel-tab.tab").removeClass("activetab");
        $("li#poll-panel-tab.tab").removeClass("activetab");
        $("#options-panel").css("display", "block");
        $("#attach-panel").css("display", "none");
        $("#poll-panel").css("display", "none");
     }
  });

  templateBox.append(templateListBox);
  templateBox.append(hrline);
  $("#postingbox dl:contains('Předmět:')").prepend(templateBox);
}
 
function LoadTemplatesList(data) {
  var lines = data.split("\n");
  
  for (i = 0; i < lines.length; i++) {
    if(lines[i] != "") {
      if(lines[i].startsWith("#")) {
        var value = lines[i].replace("#", "");
        Log("INFO", value);
        $("#bureau_select").append($("<optgroup />").attr("label", value)); 
      }
      else {
        var pair = lines[i].split("|");  
        Log("INFO", pair);
        $("#bureau_select").append($("<option />").val(pair[1]).text(pair[0]));                              
      }
    }
  }

  $(document).ready(function() {
    $("#bureau_select").select2();
  });
}

function FillPostingboxWithTemplate(data) {
  var lines = data.split("\n");
  if(lines[0] == "#šablona") {
     // TODO: syntax engine na formuláře
     // 
     if(SearchStringInArray("!anketa", lines) > 0) {
       FillWithText("#poll_title", "!anketa-otázka:", lines);
       FillWithMultilineText("#poll_option_text", "!anketa-možnosti:", lines);
       FillWithNumber("#poll_max_options", "!anketa-max-možností:", lines);
       FillWithNumber("#poll_length", "!anketa-délka-trvání:", lines);
       FillWithBool("#poll_vote_change", "!anketa-povolit-změnu-hlasu:", lines);
       FillWithBool("#poll_show_results", "!anketa-zobrazit-výsledky:", lines);
       
       $("li#options-panel-tab.tab").removeClass("activetab");
       $("li#attach-panel-tab.tab").removeClass("activetab");
       $("li#poll-panel-tab.tab").addClass("activetab");
       $("#options-panel").css("display", "none");
       $("#attach-panel").css("display", "none");
       $("#poll-panel").css("display", "block");
     }
    else {
       $("#poll_title").val("");
       $("#poll_option_text").val("");
       $("#poll_max_options").val("1");
       $("#poll_length").val("0");
       $("#poll_vote_change").prop('checked', false);
       $("#poll_show_results").prop('checked', false);
       
       $("li#options-panel-tab.tab").addClass("activetab");
       $("li#attach-panel-tab.tab").removeClass("activetab");
       $("li#poll-panel-tab.tab").removeClass("activetab");
       $("#options-panel").css("display", "block");
       $("#attach-panel").css("display", "none");
       $("#poll-panel").css("display", "none");
    }
    
     FillWithText("#postingbox #subject", "!předmět:", lines);
     FillWithMultilineText("#postingbox textarea", "!obsah:", lines);
  }
  else {
     $("#postingbox #subject").val(lines[0]); 
     $("#postingbox textarea").val(lines.join("\n"));
     Log("INFO", lines)
  }
}

function FillWithMultilineText(element, tag, lines) {
  if(SearchStringInArray(tag, lines) > 0) {
    var tagClose = tag.replace("!", "").replace(":", "!");
    var openingLine = SearchStringInArray(tag, lines) +1;
    var closingLine = SearchStringInArray(tagClose, lines);
    Log("INFO", lines.slice(openingLine, closingLine).join("\n"));
    $(element).val(lines.slice(openingLine, closingLine).join("\n"));
  }
}

function FillWithText(element, tag, lines) {
  if(SearchStringInArray(tag, lines) > 0) {
    var value = lines[SearchStringInArray(tag, lines)].replace(tag, "");
    Log("INFO", value);
    $(element).val(value);
  }
}

function FillWithNumber(element, tag, lines) {
  if(SearchStringInArray(tag, lines) > 0) {
    var value = lines[SearchStringInArray(tag, lines)].replace(tag, "");
    if(value == "") {
      value = "0";
    }
    Log("INFO", value);
    $(element).val(value);
  }
}

function FillWithBool(element, tag, lines) {
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


// internal functions
function SearchStringInArray(str, strArray) {
  for (var j=0; j<strArray.length; j++) {
      if (strArray[j].match(str)) return j;
  }
  return -1;
}

Date.prototype.today = function () { 
    return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
}

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
