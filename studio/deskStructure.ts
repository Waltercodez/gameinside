import type { StructureResolver } from 'sanity/structure'

/**
 * Splitst artikelen in Concepten en Gepubliceerd, zodat de redactie de
 * agent-concepten niet tussen de gepubliceerde artikelen hoeft te zoeken.
 *
 * Let op het gebruik van `_originalId` in plaats van `_id`. De Studio draait
 * deze lijsten onder het "drafts"-perspectief, en daar is de "drafts."-prefix
 * al van `_id` afgehaald. Filteren op `_id in path("drafts.**")` levert dan
 * nul resultaten op en de concepten belanden in de gepubliceerd-lijst.
 * `_originalId` houdt de echte document-id vast, inclusief prefix.
 */
const DRAFT = '_originalId in path("drafts.**")'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Concepten')
        .icon(() => '\u{1F4DD}')
        .child(
          S.documentList()
            .title('Concepten')
            .filter(`_type == "article" && ${DRAFT}`)
            .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
        ),

      S.listItem()
        .title('Gepubliceerd')
        .icon(() => '\u{2705}')
        .child(
          S.documentList()
            .title('Gepubliceerd')
            .filter(`_type == "article" && !(${DRAFT})`)
            .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
        ),

      S.divider(),

      // De rest van de documenttypes op de standaardmanier, zodat nieuwe
      // schema's hier automatisch verschijnen zonder deze lijst te updaten.
      ...S.documentTypeListItems().filter((item) => item.getId() !== 'article'),
    ])
