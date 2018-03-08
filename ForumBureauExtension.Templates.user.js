// ==UserScript==
// @name         Forum Bureau extension - Templates
// @namespace    http://pirati.cz/
// @version      1.3.0.4
// @description  Extention for Stylish script on forum.pirati.cz
// @author       Ondrej Kotas
// @match        https://forum.pirati.cz/posting.php?mode=post*
// @require      https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.5/js/select2.full.min.js
// @grant        none
// ==/UserScript==

var DEBUG = true;

/* GLOBAL VARIABLES */
var inputRow = $("#postform #postingbox").find("dl:contains('Předmět:')").clone();

/* TRIGGER */
ComposeTemplateBlock();
$.get("https://pad.pirati.cz/p/bureau_template_list/export/txt", LoadTemplatesList);

/* FUNCTIONS */
function ComposeTemplateBlock() {
  var templateBox = inputRow.clone();
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
        ResetForm();
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

function ResetForm() {
  $("form#postform").trigger('reset');
  $("li#options-panel-tab.tab").addClass("activetab");
  $("li#attach-panel-tab.tab").removeClass("activetab");
  $("li#poll-panel-tab.tab").removeClass("activetab");
  $("#options-panel").css("display", "block");
  $("#attach-panel").css("display", "none");
  $("#poll-panel").css("display", "none");
}

function FillPostingboxWithTemplate(data) {
  ResetForm();

  var xmlDoc = $.parseXML( data ),
  xml = $( xmlDoc );
  $title = xml.find("title" );
  
  var lines = data.split("\n");


  if(xml.find("sablona").length) {
     // formulare
     $("#bureau_templates_form").remove();

     if(xml.find("formular").length) {
      ComposeFormBlock(xml.find("formular"));
     }

     // anketa
     if(xml.find("anketa").length) {
       var anketa = xml.find("anketa");
       FillWithText("#poll_title", "otazka", anketa);
       FillWithMultilineText("#poll_option_text", "moznost", anketa);
       FillWithNumber("#poll_max_options", "max-pocet-moznosti", anketa);     
       FillWithNumber("#poll_length", "delka-trvani", anketa);
       FillWithBool("#poll_vote_change", "povolit-zmenu-hlasu", anketa);
       FillWithBool("#poll_show_results", "zobrazit-prubezne-vysledky", anketa);
       
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
    
    // obsah
     FillWithText("#postingbox #subject", "predmet", xml);
     FillWithText("#postingbox textarea", "obsah", xml);
  }
  else {
     $("#postingbox #subject").val(lines[0]); 
     $("#postingbox textarea").val(lines.join("\n"));
     Log("INFO", lines)
  }
}

function ComposeFormBlock(formular) {
  var block = $("<div></div>");
  var button = $("<input />");

  block.attr("id", "bureau_templates_form");

  formular.find("pole").each(function() {
    var formBox = inputRow.clone();
    var formInput = formBox.find("input");
    
    formBox.find("label").text($( this ).text());
    
    formInput.attr("type", $( this ).attr("typ"));
    formInput.attr("name", $( this ).text());
    formInput.attr("id", "bureau_template_form_" + $( this ).text());
    formInput.addClass("bureau_template_form_input");
    formInput.val("");

    var attr = $( this ).attr("format");
    if (typeof attr !== typeof undefined && attr !== false) {
      formInput.attr("pattern", $( this ).attr("format"));
      formInput.attr("title", $( this ).attr("format"));
    }

    button.attr("type", "button");
    button.val("Naplnit šablonu hodnotami");
    button.on("click", function() {
      InjectTemplate()
    });

    block.append(formBox);
  });

  block.append(button);
  block.append($("<hr />"));

  $("#bureau_select").parent().append(block);
}

function InjectTemplate() {
  $("#bureau_templates_form input.bureau_template_form_input").each(function() {
    $("#postingbox #subject").val($("#postingbox #subject").val().replaceAll("{" + $( this ).attr("name") + "}", $( this ).val())); 
    $("#postingbox textarea").val($("#postingbox textarea").val().replaceAll("{" + $( this ).attr("name") + "}", $( this ).val())); 
  });
}


/* HELPERS */
function FillWithMultilineText(element, tag, lines) {
  if(lines.find(tag).length) {
    lines.find(tag).each(function() {
      $(element).val($(element).val() + $( this ).text() + "\n")
      Log("INFO", $( this ).text());
    });
  }
}

function FillWithText(element, tag, lines) {
  if(lines.find(tag).length) {
    $(element).val(lines.find(tag).text());
    Log("INFO", lines.find(tag).text());
  }
}

function FillWithNumber(element, tag, lines) {
  if(lines.find(tag).length) {
    var value = lines.find(tag).text();
    $(element).val(lines.find(tag).text());

    if(value == "") {
      value = "0";
    }
    Log("INFO", value);
    $(element).val(value);
  }
}

function FillWithBool(element, tag, lines) {
  if(lines.find(tag).length) {
    var value = lines.find(tag).text();

    Log("INFO", value);

    if(value == "ano") {
      $(element).prop('checked', true); 
    }
    else {
     $(element).prop('checked', false);
    }
  }  
}


/* INTERNAL FUNCTIONS */
function SearchStringInArray(str, strArray) {
  for (var j=0; j<strArray.length; j++) {
      if (strArray[j].match(str)) return j;
  }
  return -1;
}

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

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
