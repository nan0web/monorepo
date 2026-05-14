> 🌐 **Translations**: [Українська (Original)](../next.md)

# @nan0web/db-redis Plan

## Architecture 2.0 (New Adapter)

Implementation of **RedisDriver** following the Universal Data Architecture defined in [ARCHITECTURE_2_0.md](../../db/ARCHITECTURE_2_0.md).

### Objectives

1. Implement `RedisDriver` adhering to `DBDriverProtocol`.
2. Support key-value mapping (KV → JSON).
3. Support Hash mapping (Hash → JSON Object).
4. Implement `attach` as fallback (e.g., Redis → LocalFS).

### Dependencies

- `ioredis` (standard client).
- `@nan0web/db` (core).
