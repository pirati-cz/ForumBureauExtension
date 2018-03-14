// ==UserScript==
// @name         Forum Bureau extension - Templates
// @namespace    http://pirati.cz/
// @version      1.3.1.1
// @description  Extention for Stylish script on forum.pirati.cz
// @author       Ondrej Kotas
// @match        https://forum.pirati.cz/posting.php?mode=post*
// @require      https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.5/js/select2.full.min.js
// @grant        none
// ==/UserScript==

var DEBUG = false; // nastav na true, pokud chceš v konzoli prohlížeče vidět debug hlášky

/* GLOBAL VARIABLES */
var inputRow = $("#postform #postingbox").find("dl:contains('Předmět:')").clone(); // vycházíme z řádku "předmět"

/* TRIGGER */
ComposeTemplateBlock();
$.get("https://pad.pirati.cz/p/bureau_template_list/export/txt", LoadTemplatesList); // stahni textový soubor z padu se seznamem šablon

/* FUNCTIONS */

// Poskládat blok s nabídkou šablon
function ComposeTemplateBlock() {
  var templateBox = inputRow.clone(); // naklonujeme si řádek "předmět"
  var templateListBox = $("<select></select>"); // vytvoříme nové objekty
  var helplink = $("<a></a>");
  var hrline = $("<hr />");

  // nastavíme obsah odkazu s nápovědou (link na wiki)
  helplink.attr("href", "https://github.com/pirati-cz/ForumBureauExtension/wiki");
  helplink.text("[?]");
  helplink.attr("title", "Nabídka šablon pro rutinní úlohy. Pro více informací klikněte.");
  helplink.attr("target", "_blank");
  helplink.attr("id", "bureau_helplink");

  templateBox.find("label").text("Šablona:"); // přepíšeme naklonované políčko "předmět" na "šablona"
  templateBox.find("label").append(helplink); // přidáme odkaz na wiki
  templateBox.find("input").remove(); // odstraníme z klonu textové pole pro název příspěvku
  templateListBox.append($("<option />").val("").text("bez šablony"));  // do nového objektu Select přidáme první možnost "bez šablony"
  templateListBox.attr("id", "bureau_select"); //nastavíme selectu ID

  // akce OnChange na Select menu - loaduje šablonu nebo resetuje formulář pro příspěvek
  templateListBox.on("change", function(){
     if(this.value != "") {
        var templateUrl = $($.parseHTML(this.value)).text(); // potlačíme XSS v URL šablony
        templateUrl = templateUrl + "/export/txt"; // šablonu berem z padu, takže doplníme link pro export do textového souboru

        // Načti XML šablonu
        $.get(templateUrl, FillPostingboxWithTemplate);
     }
     else {
        $("form#postform").trigger('reset'); // proveď úplný reset formuláře
        $("#bureau_templates_form").remove(); // odstraň blok se šablonou
        ResetForm(); // Odebereme anketu a resetujeme panely
     }
  });

  templateBox.append(templateListBox); // přidat Select objekt do řádku "šablona"
  templateBox.append(hrline); // přidat oddělovací čáru po "šablony"
  $("#postingbox dl:contains('Předmět:')").prepend(templateBox); // to celé přidat před řádek "předmět"
}
 
// Loaduje seznam všech šablon z textového souboru
function LoadTemplatesList(data) {
  data = $($.parseHTML(data)).text(); // potlačíme XSS
  var lines = data.split("\n"); // každý řádek souboru jako prvek seznamu
  
  for (i = 0; i < lines.length; i++) {
    // pokud řádek není prázdný (ty fungují jen jako vizuální oddělovače)
    if(lines[i] != "") {
      // pokud řádek začíná symbolem '#', použije se hodnota jako název kategorie
      if(lines[i].startsWith("#")) {
        var value = lines[i].replace("#", "");
        Log("INFO", value);
        $("#bureau_select").append($("<optgroup />").attr("label", value)); 
      }
      // jinak se použije jako option
      else {
        var pair = lines[i].split("|");  
        Log("INFO", pair);
        $("#bureau_select").append($("<option />").val(pair[1]).text(pair[0]));                              
      }
    }
  }

  // Dropdown select menu změň na vyhledávací pomocí knihovny Select2
  $(document).ready(function() {
    $("#bureau_select").select2();
  });
}

// Vymaže obsah ankety a vrátí zobrazení panelů na default
function ResetForm() {
  // vrať pole ankety do původního stavu
  $("#poll_title").val(""); // předmět ankety = ""
  $("#poll_option_text").val(""); // možnosti ankety = ""
  $("#poll_max_options").val("1"); // maximální počet možností v anketě = 1
  $("#poll_length").val("0"); // délka ankety = 0
  $("#poll_vote_change").prop('checked', false); // odškrtni možnost změny hlasu
  $("#poll_show_results").prop('checked', false); // odškrtni zobrazení výsledků ankety
  
  // skryj panel ankety
  $("li#poll-panel-tab.tab").removeClass("activetab");
  $("#poll-panel").css("display", "none");
  
  // skryj panel přílohy
  $("li#attach-panel-tab.tab").removeClass("activetab");
  $("#attach-panel").css("display", "none");
  
  // zobraz panel "možnosti příspěvku"
  $("li#options-panel-tab.tab").addClass("activetab");
  $("#options-panel").css("display", "block");
}


// Naplň formulář pro nový příspěvek obsahem šablony
function FillPostingboxWithTemplate(data) {
  // Odebereme anketu a resetujeme panely
  ResetForm();

  // Textový soubor zparsujeme jako XML
  var xmlDoc = $.parseXML( data ),
  xml = $( xmlDoc );

  // pokud XML obsahuje element <sablona>, použijeme tuto logiku
  if(xml.find("sablona").length) {
    // inteligentní formuláře
    $("#bureau_templates_form").remove(); // skryj panel z minula
    if(xml.find("formular").length) { // pokud XML obsahuje element <formular>, přidej inteligentní formulář na stránku
      ComposeFormBlock(xml.find("formular")); // jako argument odešli pouze subset XML souboru v elementu <formular>
    }

     // pokud XML obsahuje element <anketa>, vyplň hodnoty ankety
    if(xml.find("anketa").length) {
      var anketa = xml.find("anketa");
      FillWithText("#poll_title", "otazka", anketa);
      FillWithMultilineText("#poll_option_text", "moznost", anketa);
      FillWithNumber("#poll_max_options", "max-pocet-moznosti", anketa);     
      FillWithNumber("#poll_length", "delka-trvani", anketa);
      FillWithBool("#poll_vote_change", "povolit-zmenu-hlasu", anketa);
      FillWithBool("#poll_show_results", "zobrazit-prubezne-vysledky", anketa);
       
      // zobraz panel ankety
      $("li#options-panel-tab.tab").removeClass("activetab");
      $("li#attach-panel-tab.tab").removeClass("activetab");
      $("li#poll-panel-tab.tab").addClass("activetab");
      $("#options-panel").css("display", "none");
      $("#attach-panel").css("display", "none");
      $("#poll-panel").css("display", "block");
     }
    // Pokud XML neobsahuje element <anketa>, odebereme anketu a resetujeme panely
    else {
      ResetForm();
    }
    
    // obsah
    FillWithText("#postingbox #subject", "predmet", xml); // vyplníme předmět hodnotou elementu <predmet> z XML
    FillWithText("#postingbox textarea", "obsah", xml); // vyplníme obsah příspěvku hodnotou elementu <obsah> z XML
  }
  // pokud soubor není XML nebo neobsahuje pole <sablona>
  else {
    data = $($.parseHTML(data)).text(); // potlačíme XSS
    var lines = data.split("\n"); // každý řádek souboru jako prvek seznamu

    $("#postingbox #subject").val(lines[0]);  // předmět příspěvku naplň prvním řádkem ze souboru
    $("#postingbox textarea").val(data); // obsah příspěvku naplň celým obsahem souboru
    Log("INFO", lines)
  }
}

// Vytvoř blok s inteligentním formulářem
function ComposeFormBlock(formular) {
  // nové prvky
  var block = $("<div></div>");
  var button = $("<input />");

  // přidáme ID pro blok kvůli CSS stylům
  block.attr("id", "bureau_templates_form");

  // z XML souboru vyber všechny elementy <pole>
  formular.find("pole").each(function() {
    var formBox = inputRow.clone(); // naklonujeme si řádek "předmět"
    var formInput = formBox.find("input"); // uložíme si i referenci na textové pole klonovaného řádku
    
    formBox.find("label").text($( this ).text()); // Text "předmět" přepíšeme na hodnotu z XML souboru
    
    formInput.attr("type", $( this ).attr("typ")); // změníme typ textového pole na požadovaný typ definovaný v XML
    formInput.attr("name", $( this ).text()); // jako jméno input pole použijeme jeho název
    formInput.attr("id", "bureau_template_form_" + $( this ).text()); // přidáme i unikátní ID
    formInput.addClass("bureau_template_form_input"); // přidáme class pro styl v CSS
    formInput.val(""); // hodnotu input políčka nastavíme na prázdnou

    // pokud je v XML u elementu <pole> definován parametr format="", vyplň jej jako hodnotu input pole
    var attr = $( this ).attr("format");
    if (typeof attr !== typeof undefined && attr !== false) {
      formInput.val($( this ).attr("format"));
      formInput.attr("title", $( this ).attr("format")); // přidej formát i jako title pro pole
    }

    // připoj blok formuláře do nového bloku
    block.append(formBox);
  });

  // Přidáme čudlik na naplnění šablony hodnotami pomocí OnClick akce
  button.attr("type", "button");
  button.val("Naplnit šablonu hodnotami");
  button.on("click", function() {
    InjectTemplate()
  });

  // Do bloku pod inteligentní formulář přidáme tento čudlik
  block.append(button);
  block.append($("<hr />")); // a oddělíme čárou

  $("#bureau_select").parent().append(block); // celý block přidáme za dropdown se seznamem šablon
}

// Naplň šablonu hodnotami z inteligentního formuláře
function InjectTemplate() { 
  // projdi každý input prvek z inteligentního formuláře
  $("#bureau_templates_form input.bureau_template_form_input").each(function() {
    // pokud jeho hodnota není prázdná
    if($( this ).val() != "") {
      var postingTextarea = $("#postingbox textarea"); // element obsahu příspěvku
  
      // nahraď všechny placeholdery za hodnoty z formuláře
      $("#postingbox #subject").val($("#postingbox #subject").val().replaceAll("{" + $( this ).attr("name") + "}", $( this ).val()));
      postingTextarea.val(postingTextarea.val().replaceAll("{" + $( this ).attr("name") + "}", $( this ).val()));

      // nahraď všechny placeholdery s modifikátorem :rul za hodnoty z formuláře
      var sanitizedValue = $( this ).val().replace(/[^\w\s]/gi, '_'); // odfiltruj nebezpečné znaky
      postingTextarea.val(postingTextarea.val().replaceAll("{" + $( this ).attr("name") + ":url}", sanitizedValue));
    }
  });
}


/* HELPERS */
// Vyplň hodnotu elementu hodnotou z XML souboru (výsledný text je víceřádkový, skládá se z hodnot několika prvků z XML souboru spojených symbolem pro nový řádek)
function FillWithMultilineText(element, tag, lines) {
  if(lines.find(tag).length) {
    lines.find(tag).each(function() {
      var value = $( this ).text(); // .text() potlačí XSS
      $(element).val($(element).val() + value + "\n")
      Log("INFO", value);
    });
  }
}

// Vyplň hodnotu elementu hodnotou z XML souboru (text je jednořádkový)
function FillWithText(element, tag, lines) {
  if(lines.find(tag).length) {
    var value = lines.find(tag).text(); // .text() potlačí XSS
    $(element).val(value);
    Log("INFO", value);
  }
}

// Vyplň hodnotu elementu hodnotou z XML souboru (text je číslo, prázdný string nahraď 0)
function FillWithNumber(element, tag, lines) {
  if(lines.find(tag).length) {
    var value = lines.find(tag).text(); // .text() potlačí XSS
    $(element).val(value);

    if(value == "") {
      value = "0";
    }
    Log("INFO", value);
    $(element).val(value);
  }
}

// Zaškrtni/odškrtni element hodnotou z XML souboru (ano = checked, ne = unchecked)
function FillWithBool(element, tag, lines) {
  if(lines.find(tag).length) {
    var value = lines.find(tag).text(); // .text() potlačí XSS

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
// Nahraď všechny výskyty substringu ve stringu
String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

// Funkce pro korektní logování - DATUM
Date.prototype.today = function () { 
    return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
}

// Funkce pro korektní logování - ČAS
Date.prototype.timeNow = function () {
     return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}

// Funkce pro korektní logování do konzole prohlížeče
function Log(level, message) {
  if(DEBUG) {
    var newDate = new Date();
    var datetime = newDate.today() + " " + newDate.timeNow();
    console.log(datetime + " [" + level + "] " + message);
  }
}
