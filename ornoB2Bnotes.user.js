// ==UserScript==
// @name         Notatnik dla B2B Orno
// @namespace    http://tampermonkey.net/
// @author       Łukasz Kordos
// @version      1.1
// @description  Pływający notatnik na b2b.orno.pl z zapisywaną pozycją, rozmiarem i zawartością
// @match        https://b2b.orno.pl/*
// @require      https://pa-jong.github.io/OrnoB2BNotes/ornob2bnotes.user.js
// @updateURL    https://pa-jong.github.io/OrnoB2BNotes/update.json
// @downloadURL  https://pa-jong.github.io/OrnoB2BNotes/ornob2bnotes.user.js // URL to the actual userscript
// @grant        none
// ==/UserScript==


(function() {
    'use strict';

    // Funkcja do utworzenia notatnika, sprawdzająca dostępność document.body
    function createNote() {
        if (!document.body) {
            setTimeout(createNote, 100); // Czeka na załadowanie body
            return;
        }

        const note = document.createElement("div");
        note.id = "floatingNote";
        note.contentEditable = true; // Możesz też użyć setAttribute
        note.style.position = "fixed";
        note.style.backgroundColor = "#FFFBCC"; // Jasny pastelowy żółty
        note.style.border = "1px solid #ccc";
        note.style.padding = "10px";
        note.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.2)";
        note.style.resize = "both";
        note.style.overflow = "auto";
        note.style.minWidth = "200px";
        note.style.minHeight = "100px";
        note.style.zIndex = 9999; // Upewnij się, że to jest wystarczająco wysokie
        note.style.fontSize = "14px";
        note.style.color = "#333";
        note.style.cursor = "text";
        note.innerText = "Notatnik";

        document.body.appendChild(note);
        note.focus(); // Ustaw fokus na notatniku

        // Przywróć zawartość, pozycję i rozmiar z localStorage
        note.innerText = localStorage.getItem("noteContent") || "Notatnik";
        note.style.top = localStorage.getItem("noteTop") || "10px";
        note.style.left = localStorage.getItem("noteLeft") || "10px";
        note.style.width = localStorage.getItem("noteWidth") || "300px";
        note.style.height = localStorage.getItem("noteHeight") || "200px";

        // Utwórz uchwyt do przeciągania
        const dragHandle = document.createElement("div");
        dragHandle.style.width = "20px";
        dragHandle.style.height = "20px";
        dragHandle.style.position = "absolute";
        dragHandle.style.right = "5px";
        dragHandle.style.bottom = "5px";
        dragHandle.style.backgroundColor = "#ccc";
        dragHandle.style.cursor = "nwse-resize";
        dragHandle.style.borderRadius = "50%"; // Zaokrąglony uchwyt
        note.appendChild(dragHandle);

        // Funkcja zapisu pozycję, rozmiar i zawartość
        function saveNote() {
            localStorage.setItem("noteContent", note.innerText);
            localStorage.setItem("noteTop", note.style.top);
            localStorage.setItem("noteLeft", note.style.left);
            localStorage.setItem("noteWidth", note.style.width);
            localStorage.setItem("noteHeight", note.style.height);
        }

        // Obsługa przeciągania uchwytu
        dragHandle.addEventListener("mousedown", function(e) {
            e.preventDefault();
            let offsetX = e.clientX - note.getBoundingClientRect().left;
            let offsetY = e.clientY - note.getBoundingClientRect().top;

            function onMouseMove(e) {
                note.style.top = (e.clientY - offsetY) + "px";
                note.style.left = (e.clientX - offsetX) + "px";
                saveNote();
            }

            document.addEventListener("mousemove", onMouseMove);

            document.addEventListener("mouseup", function() {
                document.removeEventListener("mousemove", onMouseMove);
                saveNote();
            }, { once: true });
        });

        // Zapis zawartości przy każdej zmianie
        note.addEventListener("input", saveNote);

        // Nasłuchuj zmiany rozmiaru
        new ResizeObserver(saveNote).observe(note);
    }

    // Wywołaj funkcję createNote natychmiast po wczytaniu strony
    createNote();
})();
