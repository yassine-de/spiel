# Samya's World 💖

Ein liebevolles 2D-Stadt-Lebenssimulationsspiel für Samya – gebaut mit **Phaser 3**, **TypeScript** und **Vite**,
optimiert für Smartphones im Querformat und bereit für **Netlify**.

> **Stand: Phase 5 (Inventar & Haus).** Avatar, Stadt, Läden, Münzen, Inventar, Tagesaufgaben und
> Samyas Haus mit drei Räumen sind spielbar. Alle Grafiken sind noch Platzhalter.
> Alle Grafiken sind derzeit **Platzhalter**, die im Code erzeugt werden (siehe unten).

## Schnellstart

```bash
npm install
npm run dev        # Entwicklungsserver auf http://localhost:5173 (auch im WLAN erreichbar)
npm test           # Unit-Tests (Vitest)
npm run typecheck  # TypeScript-Prüfung
npm run build      # Typprüfung + Produktionsbuild nach dist/
npm run preview    # Produktionsbuild lokal ansehen (http://localhost:4173)
```

Auf dem Handy testen: `npm run dev` starten und auf dem Handy (gleiches WLAN) die angezeigte
`Network:`-Adresse öffnen.

## Steuerung

| Gerät    | Bewegen                                   | Aktion (z. B. „Schild lesen“) | Pause      |
| -------- | ----------------------------------------- | ----------------------------- | ---------- |
| Touch    | Joystick unten links (folgt dem Daumen)   | Großer Button unten rechts    | Button ⏸   |
| Tastatur | Pfeiltasten oder WASD                     | Leertaste / Enter / E         | Esc oder P |

Der Aktionsbutton erscheint nur, wenn es in der Nähe tatsächlich etwas zu tun gibt.

## Die Stadt

Drei Häuserzeilen, jede mit ihrer Straße davor (Türen zeigen immer zur Straße darunter),
verbunden durch zwei Fußwege mit Zebrastreifen:

| Zeile  | Orte                                                                              |
| ------ | --------------------------------------------------------------------------------- |
| oben   | Adolf-Reichwein-Schule · Stadtpark („Samyas Lieblingspark 🌸“) · Friseursalon · Café |
| Mitte  | Samya's Boutique · Spielzeugladen · Stadtplatz mit Brunnen · REWE                 |
| unten  | Nachbarhaus · **Samyas Haus** („Hier wohnt Samya 🏠“) · Nachbarhaus                |

- **Betretbar:** Samyas Haus, Samya's Boutique, REWE, Spielzeugladen – vor der Tür erscheint
  „Haus betreten“ bzw. „Geschäft betreten“, drinnen unten „Hinausgehen“.
- **Noch geschlossen:** Café und Friseursalon („Bald geöffnet“ über der Tür), Schule („Heute schulfrei! 🎒“),
  Nachbarhäuser (Gartenzaun vor der Tür). Dort erscheint kein Button.
- Nach dem Hinausgehen steht Samya vor der Tür; der Eingang wird erst wieder angeboten,
  wenn sie sich einmal entfernt hat (kein versehentliches Wiederbetreten).
- Autos fahren auf den Straßen und halten an, wenn Samya vor ihnen steht.
- Neue Orte werden beim ersten Besuch „entdeckt“; die Position in der Stadt wird gespeichert.

## Läden, Münzen und Inventar

- **Samya's Boutique:** 23 Kleidungsstücke und Accessoires. Antippen → „Anprobieren“ zeigt das Teil im
  Spiegel (nur vorübergehend) → „Kaufen“. Gekauftes, das gerade anprobiert ist, wird gleich angezogen.
- **REWE:** 16 Lebensmittel in drei Abteilungen (Obst & Gemüse, Kühlregal, Vorratsregal). Antippen legt
  in den Warenkorb, Mengen mit − / +, **bezahlt wird an der Kasse**. Wer ohne Bezahlen geht, lässt den
  Warenkorb im Laden.
- **Spielzeugladen:** 10 Spielzeuge; bei Kuscheltieren kommt manchmal eine besondere Nachricht.
- **Münzen:** Start mit 1.000. Käufe werden komplett geprüft (alles oder nichts): nie negativ,
  einzigartige Dinge (Kleidung, Spielzeug) nur einmal. Bei zu wenig Münzen erscheint
  „Oh Samya, dafür fehlen dir noch ein paar Münzen! 💕“.
- **Inventar** (HUD oben rechts): Kleidung, Schuhe, Accessoires, Lebensmittel, Spielzeug – Kleidung lässt
  sich dort an- und ablegen.
- **Grundausstattung:** Im Avatar-Editor gibt es immer eine kleine Grundausstattung; Boutique-Kleidung
  erscheint dort erst nach dem Kauf.
- **Tagesaufgaben** (HUD oben rechts): drei kleine Aufgaben pro Tag (z. B. „Besuche den Stadtpark“ +20).
  Jede Belohnung gibt es nur einmal pro Tag – auch Neuladen ändert daran nichts. Keine Kaufaufträge.

Die Produkte stehen in `src/game/shop/products.ts`, die Aufgaben in `src/game/tasks/dailyTasks.ts`.

## Samyas Haus

Drei Räume nebeneinander, verbunden durch offene Durchgänge: **Schlafzimmer | Wohnzimmer (Haustür) | Küche**.

| Möbel | Aktion |
| --- | --- |
| Kleiderschrank | „Kleiderschrank öffnen“ – Kleidung wechseln (Grundausstattung + Gekauftes) |
| Spiegel | „In den Spiegel schauen“ – ein Kompliment für Samya |
| Spielzeugkiste | „Spielzeugkiste öffnen“ – gekaufte Spielzeuge ansehen |
| Kühlschrank | „Kühlschrank öffnen“ – Lebensmittel essen |
| Bett, Fernseher | „Ausruhen“, „Fernsehen“ |

**Spielzeug aufstellen:** Zu Hause zeigt das Inventar bei Spielzeug „Hier aufstellen“ – es landet direkt vor
Samya. Daneben stehend erscheint „… wegräumen“. Aufgestellte Spielzeuge werden gespeichert.

**HUD oben links:** „Kleidung“ öffnet den Kleiderschrank von überall, „Nach Hause“ bringt Samya direkt nach
Hause (der Button fehlt, wenn sie schon dort ist).

## Avatar und Spielstand

- Beim ersten „Spielen“ öffnet sich der **Avatar-Editor** (Ich · Gesicht · Haare · Kleidung · Extras).
  Standard ist **Samyas Look**: schwarz-weiße Haare, Hoodie und Jogginghose in Rosa/Schwarz, dicke Sneaker.
  „Mein Abenteuer starten! ✨“ legt den Spielstand an.
- Später bearbeiten: im Hauptmenü „Avatar gestalten“ oder im Spiel auf das eigene Bild oben links tippen
  (die Spielwelt wartet pausiert, die Position bleibt erhalten).
- Der Spielstand (`samyas-world:save`) ist **versioniert** (`SAVE_VERSION` + `MIGRATIONS` in
  `src/storage/saveManager.ts`). Unlesbare Spielstände blockieren das Spiel nicht: Sie werden unter
  `samyas-world:save-backup` aufbewahrt und das Spiel beginnt neu.
- Zurücksetzen: Einstellungen → „Spielstand löschen“ (mit Sicherheitsabfrage).

## Projektstruktur

```
src/
  main.ts                 Einstieg: UI, Audio-Freigabe, Phaser-Spiel
  styles/main.css         Gesamte HTML-Oberfläche (Pastell, große Touch-Flächen, Safe-Areas)
  storage/                LocalStorage-Zugriff (fehlertolerant), versionierte Einstellungen und Spielstand
  game/
    config/               Konstanten, Phaser-Konfiguration
    scenes/               Boot → Preload → MainMenu → AvatarCreator → City ⇄ Interior (gemeinsame Basis: WorldScene)
    avatar/               Avatar-Typen, Katalog (alle Optionen und Kleidungs-IDs), Textur-Erzeugung
    entities/             Spielfigur, Animationen
    systems/              PlayerController, CollisionManager, InteractionManager, CarSystem
    shop/                 Produktkatalog, Münz-Logik (Warenkorb, Bezahlen)
    tasks/                Tagesaufgaben
    managers/             AudioManager (Web-Audio-Effekte), QualityManager (Auflösung, ruhige Animationen)
    input/                InputState (Joystick + Tastatur, Blockieren bei Menüs), KeyboardInput
    assets/               Textur-Schlüssel, Asset-Manifest, placeholders/ (prozedurale Platzhalter)
    world/                Gebäude-Katalog, Objektkatalog, Stadtplan, Innenräume, WorldBuilder
    ui/                   HTML-Oberfläche: Hauptmenü, HUD, Joystick, Fenster, Hinweise
    services.ts           Gemeinsame Dienste (Einstellungen, Audio, Eingabe)
tests/                    Unit-Tests
public/                   Manifest (PWA-Vorbereitung) und Icon
docs/                     Entwicklungsplan und offene Punkte
```

**Architekturprinzipien**

- **Spielwelt in Phaser, Oberfläche in HTML/CSS.** Texte bleiben scharf, iPhone-Notch/Home-Indicator
  werden per `safe-area-inset` berücksichtigt, Menüs fangen Berührungen ab.
- **Zentrale Eingabe (`InputState`).** Sobald ein Fenster oder der Dreh-Hinweis offen ist, liefert sie
  keine Bewegung – die Figur läuft nie unbeabsichtigt weiter.
- **Skalierung:** `Scale.EXPAND` mit 720 Welt-Einheiten sichtbarer Höhe; jedes Seitenverhältnis wird
  ohne schwarze Ränder gefüllt. Die Render-Auflösung passt sich dem Gerät an (Einstellung „Grafik“).
- **Eigene Rechteck-Kollisionen** an den Füßen der Figur (2,5D), Tiefensortierung nach y-Position.

## Grafiken austauschen (Platzhalter → echte Grafiken)

Alle Texturen laufen über feste Schlüssel (`src/game/assets/assetKeys.ts`). In
`src/game/assets/assetManifest.ts` steht für jeden Schlüssel, woher die Grafik kommt:

1. Grafik im Format **@2x** nach `public/assets/...` legen (z. B. `public/assets/env/tree-green.png`).
2. Im Manifest beim passenden Eintrag `file: 'assets/env/tree-green.png'` ergänzen.
3. Fertig – die Spiellogik bleibt unverändert. Fehlt eine Datei, wird automatisch wieder der Platzhalter genutzt.

Figuren-Spritesheets folgen dem Raster aus `CHARACTER_SHEET` (144 × 224 px pro Bild, Zeilen =
unten/links/rechts/oben, Spalte 0 = Stehen, Spalten 1–4 = Laufen). Der Avatar wird aus Ebenen
zusammengesetzt (`AVATAR_LAYERS` in `placeholders/avatar/avatarPainter.ts`: Haare hinten, Beine, Schuhe,
ferner Arm, Unterteil, Oberteil, Arme, Tasche, Kopf, Gesicht, Brille, Haare vorne, Haarschmuck, Hut).
Die Kopf-Ebenen werden mit `HEAD_SCALE` etwas kleiner gezeichnet; zweifarbige Frisuren werden je Farbe
gezeichnet und an der Mittellinie zusammengesetzt. Gebäude beschreiben ihr Aussehen in `BuildingVisual`
(`src/game/world/buildings.ts`), u. a. mit dem Fassadenmaterial `material`. Echte Grafiken ersetzen
diese Ebenen später durch Spritesheets im selben Raster und in derselben Reihenfolge. Beim Start listet die Browser-Konsole
alle aktiven Platzhalter auf: `[Assets] PLATZHALTER-Grafiken aktiv …`.

## Debug-Modus

- `?debug` – zeigt FPS, Ort, Position und Kollisionsflächen und stellt `window.__samya` für Tests bereit
  (u. a. `teleport(x, y)` und `overview(true)` für eine Gesamtansicht der Karte).
- `?debug=timer` – zusätzlich Spielschleife per Timer statt `requestAnimationFrame`
  (nur für automatisierte Tests in ausgeblendeten Browserfenstern).

## Deployment auf Netlify

`netlify.toml` ist vorbereitet: Build-Befehl `npm run build`, Veröffentlichungsordner `dist`, Node 22.
Alle Pfade sind relativ, das Spiel braucht kein Backend und keine kostenpflichtigen Dienste.
**Es wird nichts automatisch veröffentlicht** – Deployment erfolgt erst nach ausdrücklicher Freigabe.

## Wichtige Hinweise

- Einstellungen und Spielstand liegen **nur lokal im Browser**. Beim Löschen der Browserdaten
  gehen sie verloren; es gibt **keine** geräteübergreifende Synchronisierung.
- Eine PWA-Struktur (Manifest, Icon) ist vorbereitet. **Offline-Betrieb ist noch nicht umgesetzt**
  (kein Service Worker) – das folgt in Phase 10 und wird erst nach Test als fertig bezeichnet.
- Alle Grafiken und Soundeffekte sind selbst erzeugt (Canvas bzw. Web Audio); die Schrift
  „Fredoka“ steht unter der SIL Open Font License und wird lokal mitgeliefert.
