# Entwicklungsplan – Samya's World

## Technische Entscheidungen

| Thema          | Entscheidung                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------------- |
| Engine         | Phaser **3.90** (letzte 3.x-Version; auf npm ist `latest` bereits Phaser 4 – bewusst nicht genutzt) |
| Sprache/Build  | TypeScript 5.9 (strict), Vite 8 (Rolldown), Vitest 5                                           |
| Darstellung    | Phaser-Canvas für die Welt, HTML/CSS-Ebene für alle Menüs/HUD                                  |
| Skalierung     | `Scale.EXPAND`, Basis 1280 × 720, Render-Auflösung 1×–2× je nach Gerät/Einstellung              |
| Kollision      | Eigener `CollisionManager` (Rechtecke, achsweise, Unterteilung großer Schritte)                 |
| Grafiken       | Asset-Manifest mit festen Schlüsseln; prozedurale **Platzhalter** bis echte Grafiken vorliegen   |
| Audio          | Web Audio, selbst erzeugte Effekte; Start erst nach Benutzerinteraktion                         |
| Speicherung    | LocalStorage, versioniert, fehlertolerant (IndexedDB nur falls später nötig)                    |
| Schrift        | Fredoka (OFL), lokal gebündelt über `@fontsource`                                               |

## Phasen

1. **Grundgerüst** ✅ – Projekt, Phaser, Hauptmenü, responsive Spielfläche, Touch-Steuerung, Testwelt, Testfigur
2. **Avatar** ✅ – Editor mit kombinierbaren Ebenen, Speicherung (SaveManager, versioniert), Laufanimation
3. **Stadt** ✅ – große Stadtkarte, Gebäude, Eingänge, Szenenwechsel mit Rückkehrposition
4. **Geschäfte** ✅ – Boutique, Supermarkt, Spielzeugladen, Produktkatalog, Einkauf, Münzen (+ Inventar-Grundfunktionen, Tagesaufgaben)
5. **Inventar & Haus** ✅ – Inventar, Kleidung wechseln, Haus mit Räumen, Gegenstände platzieren
6. NPCs – Figuren, Bewegungsmuster, Dialoge (teilweise ✅: Lina, Ben und Frau Sonnenschein in Salon, Café und Schule; Figuren in der Stadt fehlen noch)
7. Samya-Specials – MessageManager, Überraschungen, persönliche Schilder
8. Grafik & Audio – Grafiken, Musik, weitere Effekte, Optimierung
9. Qualitätssicherung – Mobile-Tests, Performance, Speicherstände
10. Deployment-Vorbereitung – Netlify, PWA/Offline (Service Worker), Doku, finaler Build

## Neues Design (zwischen Phase 5 und 6, Wunsch der Familie)

- **Figuren im weichen 3D-Look** (nach einer Bildvorlage, die selbst *nicht* im Spiel steckt – sie hat ein
  Wasserzeichen und ist nur Stilvorlage): plastische Verläufe statt dicker Konturen, etwas kleinerer Kopf
  (`HEAD_SCALE`), längere Arme und Beine, glänzende Haare, Augen mit Iris-Verlauf und Glanzpunkten, Nase.
- **Samyas Look** als Grundausstattung und Standard für neue Spiele: Haarfarbe „Schwarz-Weiß“
  (zweifarbig, an der Mittellinie geteilt), „Samyas Hoodie“ (Rosa/Schwarz, Kapuze, Kordeln, weiße
  Taschenschlitze), „Samyas Jogginghose“ (Rosa/Schwarz, Bündchen), „Dicke Sneaker“.
  Zweifarbige Teile: `color` = rechte Körperseite, `color2` = linke.
- **Realistischere Gebäude:** Materialien (`material`: Klinker, Putz, Holzverkleidung, Naturstein),
  Biberschwanz-Ziegel, Traufe mit Dachrinne, Fenster mit Laibung, Sprossen, Spiegelung und Fensterbank,
  lackierte Holztüren mit Kassetten und Oberlicht, Markisen mit Schatten, Sockel aus Naturstein.
- Bestehende Spielstände behalten ihren Avatar; der neue Look ist im Editor auswählbar.
- Die Stadt-Umgebung (Bäume, Straßen, Bänke) und die Innenräume haben den bisherigen Stil;
  sie können in Phase 8 (Grafik) angeglichen werden.

## Friseursalon, Café und Schule (Wunsch der Familie, vor Phase 6)

- Alle drei Gebäude sind jetzt betretbar (vorher „Bald geöffnet“ / „Heute schulfrei!“).
- Figuren in den Läden: Friseurin **Lina**, Café-Besitzer **Ben**, Lehrerin **Frau Sonnenschein** – aus
  denselben Avatar-Ebenen gezeichnet, gehen in Ruhezeiten umher, sprechen in Sprechblasen, lassen sich ansprechen.
  Sie sind keine Hindernisse.
- Szenarien: Frisieren auf 3 Stühlen; Café bestellen + am Tisch genießen, Kuchen verzieren;
  Rechen-Rätsel, Wörter-Spiel, Malecke mit Bild an der Wand, Xylophon mit Nachspiel-Modus, Bücherregal, Globus.
- Spielstand-Version 5: `activityCoins` (Tageslimit 30 Münzen aus Rätseln). Café-Bestellungen kosten 3–6 Münzen.
- Offen: Die Figuren haben noch keine eigene Berufskleidung (Schürze o. Ä.); im Café gibt es nur einen Gast-Platz
  pro Tisch; „Sprich mit drei Figuren“ als Tagesaufgabe kommt mit den Stadt-Figuren in Phase 6.

## Offene Punkte nach Phase 5

- **Platzieren** geht für Spielzeug, und zwar dort, wo Samya steht (kein Ziehen mit dem Finger). Aufgestellte
  Spielzeuge sind keine Hindernisse – so kann sich Samya nie selbst den Weg versperren.
- **Möbel** im Haus sind fest; eigene Möbel kaufen/umstellen wäre eine spätere Erweiterung.
- **Spielstand-Version 4** (aufgestellte Spielzeuge); Migration von 1–3 ist getestet.
- Auf sehr schmalen Handys (unter 620 px Breite) wird der Name neben dem Avatar-Bild ausgeblendet,
  damit alle HUD-Buttons Platz haben.

## Offene Punkte nach Phase 4

- **Tagesaufgaben** wurden vorgezogen (Spielkonzept Abschnitt 12 „Münzen verdienen“), damit das Geld nicht
  ausgeht. „Sprich mit drei Figuren“ fehlt noch – das kommt mit den Figuren (Phase 6).
- **Inventar:** Lebensmittel und Spielzeug haben noch keine Aktion (Essen, im Haus aufstellen → Phase 5).
- **Grundausstattung:** Seit Phase 4 bietet der Editor nur noch eine kleine Grundausstattung; der Rest ist
  in der Boutique. Bereits getragene Teile wurden beim Update geschenkt.
- **Kuscheltier-Nachricht** erscheint per Zufall in etwa jedem zweiten Fall („gelegentlich“).
- **Verkäuferin** im Laden folgt mit den Figuren (Phase 6).
- **Spielstand-Version 3** (Inventar, Tagesaufgaben); Migration von 1 und 2 ist getestet.

## Offene Punkte nach Phase 3

- **Innenräume** sind eingerichtet, aber noch ohne Funktionen: Einkaufen (Phase 4), Kleiderschrank,
  weitere Räume und Gegenstände platzieren im Haus (Phase 5), Verkäuferin (Phase 6).
- **Café-Getränk „Samya-Spezial“** gehört zu den Samya-Specials (Phase 7); das Café ist bis dahin geschlossen.
- **Autos** halten für Samya an, man kann sie aber nicht „anstupsen“; sie haben keine Fahrer (NPCs folgen in Phase 6).
- **Speicherbedarf:** Die Gebäudegrafiken werden beim Start erzeugt (zusammen ca. 20–25 MB Grafikspeicher).
  Auf sehr alten Geräten kann das knapp werden – Messung auf echten Handys steht aus (Phase 9).
- **Entdeckte Orte** werden gespeichert, geben aber noch keine Münzen – das kommt mit den Aufgaben.

## Festlegungen für Phase 3 (Stadt)

- Der Supermarkt heißt **„REWE“**: rotes Ladenschild mit weißer Schrift (Wunsch der Familie).
  Die Schrift ist die Spielschrift „Fredoka“ – das Original-Logo wird nicht nachgezeichnet.
- Die Schule heißt **„Adolf-Reichwein-Schule“**.

## Offene Punkte nach Phase 2

- **Spielername** ist fest „Samya“ (im Spielstand gespeichert, alle Texte lesen ihn von dort).
  Eine Eingabe dafür gibt es bewusst nicht – bei Bedarf leicht ergänzbar.
- **Wechsel Mädchen/Junge** setzt Frisur und Kleidung auf passende Voreinstellungen zurück
  (Haut-, Haar- und Augenfarbe bleiben). Alle Optionen stehen beiden offen.
- **Position** in der Testwelt wird noch nicht gespeichert – das kommt mit der echten Stadt (Phase 3).
- **Kleidung im Editor** ist eine Grundausstattung. Gekaufte Kleidung (Phase 4) nutzt dieselben IDs;
  dann wird festgelegt, was frei verfügbar ist und was erst gekauft werden muss.

## Offene Punkte nach Phase 1

- **Alle Grafiken sind Platzhalter** (Canvas-Zeichnungen). Sie sind bewusst ansprechend gestaltet,
  sollen aber durch echte Illustrationen ersetzt werden.
- **Bewegung:** Die Figur bewegt sich analog (auch schräg), blickt aber immer in eine der vier Richtungen.
  Strikte 4-Wege-Bewegung ist per `SNAP_MOVEMENT_TO_FOUR_DIRECTIONS` in `constants.ts` umschaltbar.
- **Auf echten Geräten ungetestet:** Getestet wurde in einem Browser mit Geräte-Emulation (Touch,
  verschiedene Querformat-Größen, Hochformat). Echte iPhones/Android-Geräte stehen noch aus.
- **Vollbild auf dem iPhone:** Safari auf dem iPhone unterstützt kein Vollbild für Webseiten; der Button
  erscheint dort deshalb nicht. Abhilfe später über „Zum Home-Bildschirm“ (PWA).
- **App-Icon:** Nur als SVG vorhanden; iOS benötigt für den Home-Bildschirm PNG-Icons (Phase 10).
- **Offline:** Noch kein Service Worker – das Spiel braucht beim Laden eine Verbindung.
- **Münzen** werden in Phase 1 nur angezeigt (Startwert 1.000); das Münzsystem folgt in Phase 4.
- **Phaser-Bundle** ist ~1,2 MB (≈ 320 KB gzip) – üblich für Phaser 3; wird lange gecacht.
