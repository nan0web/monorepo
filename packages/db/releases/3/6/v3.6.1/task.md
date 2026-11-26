# Release v3.6.1 — In-Memory Caching Fix (DBDir, DBFetch, DBBase)

## Definition of Done
- [ ] `DBDir.getGlobals(path)` кешує за ключем `globals:${dir}` замість `globals:${normalizedPath}`.
- [ ] `DBBase._invalidateDirCache(uri)` інвалідує також `globals:${dir}` для батьківських директорій.
- [ ] `DBFetch.getInheritance(path)` кешує за ключем `path:${dir}` замість `path:${normalizedPath}`.
- [ ] `DBFetch.fetchMerged()` кешує розгорнуті документи у `this._fetchCache` з захистом від мутації (`clone`) та пропуском неповних циклічних `$ref`.
- [ ] `DBBase._invalidateDataCache(uri)` очищає `this._fetchCache` та `this._inheritanceCache` при `saveDocument`/`dropDocument`.
- [ ] Усі тести `release:spec` та `test:all` у `@nan0web/db` проходять.
