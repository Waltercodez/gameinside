import type { StructureResolver } from 'sanity/structure'

/**
 * Splitst artikelen in Concepten en Gepubliceerd, zodat de redactie de
 * agent-concepten niet meer hoeft te onderscheiden tussen de gepubliceerde
 * artikelen in dezelfde lijst.
 *
 * Concept-documenten hebben een "drafts."-prefix op hun _id in Sanity. Er
 * bestaat geen apart schema-type voor concepten, dus filteren we op _id.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Concepten')
        .icon(() => '📝')
        .child(
          S.documentList()
            .title('Concepten')
            .filter('_type == "article" && _id in path("drafts.**")')
            .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
        ),

      S.listItem()
        .title('Gepubliceerd')
        .icon(() => '✅')
        .child(
          S.documentList()
            .title('Gepubliceerd')
            .filter('_type == "article" && !(_id in path("drafts.**"))')
            .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
        ),

      S.divider(),

      // De rest van de documenttypes op de standaardmanier, zodat nieuwe
      // schema's hier automatisch verschijnen zonder deze lijst te updaten.
      ...S.documentTypeListItems().filter((item) => item.getId() !== 'article'),
    ])
