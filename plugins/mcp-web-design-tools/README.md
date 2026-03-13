# MCP Web Design Tools

MCP-palvelimet verkkosivujen suunnitteluun, tuottavuuteen ja automaatioihin.

## Sisaltyvat MCP-palvelimet

### Notion (`@notionhq/notion-mcp-server`)
Notion-sivujen, tietokantojen ja tehtavien hallinta suoraan Claudesta.
- Sivujen luonti, muokkaus ja haku
- Tietokantojen kyselyt (Data Sources API v2)
- Tehtavien ja projektien hallinta
- Kommentit ja lohkojen hallinta

**Vaatii:** `NOTION_API_KEY` - [Luo integraatio Notion Developer -portaalissa](https://www.notion.so/my-integrations)

### Figma (`figma-developer-mcp`)
Figma-designtiedostojen lukeminen ja analysointi (Framelink Community Server).
- Tiedostojen ja komponenttien haku
- Layout- ja tyylitietojen poiminta
- Design-to-code -tyonkulut
- Yksinkertaistaa Figma-dataa ennen mallille syottoa

**Vaatii:** `FIGMA_ACCESS_TOKEN` - [Luo Personal Access Token Figman asetuksissa](https://www.figma.com/developers/api#access-tokens)

### Playwright (`@playwright/mcp`)
Microsoftin Playwright-pohjainen selainautomaatio (28k+ GitHub-tahtea).
- Verkkosivujen navigointi ja kuvakaappaukset
- Klikkaukset, lomakkeiden taytto, vuorovaikutus
- Accessibility snapshot -pohjainen elementtien tunnistus
- Tuki Chromium, Firefox ja WebKit -selaimille
- Mukautetun Playwright-koodin suoritus

**Ei vaadi API-avainta** - toimii paikallisesti.

### GitHub (`@modelcontextprotocol/server-github`)
GitHub-repojen, PR:ien ja issueiden hallinta.
- Koodihaku ja tiedostojen selaus
- Pull requestien ja issueiden kasittely
- Repojen hallinta

**Vaatii:** `GITHUB_TOKEN` - [Luo Personal Access Token](https://github.com/settings/tokens)

### Filesystem (`@modelcontextprotocol/server-filesystem`)
Turvallinen tiedostojärjestelmän käyttö sallituissa hakemistoissa.
- Tiedostojen luku ja kirjoitus
- Hakemistojen selaus
- Rajattu sallittuihin polkuihin

**Ei vaadi API-avainta.**

## Asennus

1. Aseta tarvittavat ymparistomuuttujat:

```bash
export NOTION_API_KEY="ntn_xxxxxxxxxxxx"
export FIGMA_ACCESS_TOKEN="figd_xxxxxxxxxxxx"
export GITHUB_TOKEN="ghp_xxxxxxxxxxxx"
```

2. Plugin aktivoituu automaattisesti kun se on marketplace.json:ssa.

3. Tarkista palvelimien tila: `/mcp`

## Kayttoesimerkkeja

- "Hae Notionista kaikki avoimet tehtavat"
- "Ota kuvakaappaus sivusta https://example.com mobiili- ja desktop-koossa"
- "Analysoi Figma-tiedoston komponenttirakenne ja luo React-komponentit"
- "Luo uusi GitHub issue bugiraportille"
- "Listaa projektin tiedostot ja etsi konfiguraatiot"

## Lisapalvelimia harkittavaksi

Naita voi lisata `.mcp.json`-tiedostoon tarpeen mukaan:

| Palvelin | Paketti | Kayttotarkoitus |
|----------|---------|-----------------|
| PostgreSQL | `@modelcontextprotocol/server-postgres` | Tietokantakyselyt |
| Slack | Slack MCP | Viestinta ja ilmoitukset |
| Stripe | Stripe MCP | Maksut ja tilaukset |
| Firecrawl | `firecrawl` MCP | Web scraping |
| Chrome DevTools | `chrome-devtools-mcp` | Selaimen debuggaus |
