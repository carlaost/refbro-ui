export interface ZoteroCollection {
  children: ZoteroCollection[];
  key: string;
  link: string;
  name: string;
  numCollections: number;
  numItems: number;
}

export interface ZoteroCollectionsResponse {
  message: string;
  zotero_collections: ZoteroCollection[];
}
