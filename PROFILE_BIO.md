# Bio und Profil-Vorlagen für Emin Girimhanov

## 1. Kurze Bio für die GitHub-Seitenleiste (Unter 160 Zeichen)

Füge eine dieser Optionen in deinen Profil-Einstellungen unter `Settings > Profile > Bio` ein:

### Option A (Deutsch, Fokus Beruf & Studium)
> B.Sc. Wirtschaftsinformatik @OVGU | Werkstudent im Public Sector @Falcos GmbH | FOSS, Web & Python

### Option B (Englisch, International)
> Business Informatics Student @OVGU Magdeburg | Working Student @Falcos GmbH | FOSS, Web & Python

---

## 2. Änderungen auf GitHub veröffentlichen

Führe diese drei Befehle in deiner PowerShell aus:

```powershell
Set-Location C:\Users\eming\Documents\Code\Privat_Code\egirimhanov-github-profile
git add .
git commit -m "Update profile and portfolio with resume data"
git push all main --force
```

Der Befehl `git push all main --force` lädt deine Daten auf beide GitHub-Konten gleichzeitig hoch.
