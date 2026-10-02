---
title: Why Payload CMS and NaN0Web are the Perfect Match
description: Architectural overview of integrating Model-as-Schema domain models with modern headless Payload CMS.
tags:
  - architecture
  - payload
  - nan0web
date: '2026-09-23'
---

# Why Payload CMS and NaN0Web are the Perfect Match

The **NaN0Web** platform is built around the **Model-as-Schema** paradigm and the **OLMUI** (One Logic, Multiple User Interfaces) principle. This allows declaring the business domain model once and generating any interface: CLI, web forms, mobile screens, and admin panels.

## Key Integration Benefits:

1. **Single Source of Truth:**
   Domain models are declared via declarative `Model` schemas. The `@nan0web/payload-cms.app` generator automatically transforms them into `CollectionConfig` and `GlobalConfig` for Payload CMS.

2. **Zero Procedural Code:**
   With native `SeedApp` and injected `this.$db` and `this.$payload`, data is seeded directly from local storage (YAML, NAN0, Markdown) into the CMS database.

3. **Multi-language Out of the Box:**
   Native localization at the collection and field levels aligned with the platform language registry.
