# Design token reconciliation

The Invisible Sloth Figma design-system file is the design source for these
tokens. Production CSS remains the implementation source used by the site.

- Figma file: [Invisible Sloth Design System](https://www.figma.com/design/fPZa0wKLb2IqzuvCsq55Ej/Invisible-Sloth-Design-System)
- Figma document color profile: `DISPLAY_P3`
- Current reconciliation record: `figma-reconciliation.json`
- Token aggregator: `../tokens.css`

Figma JSON exports are local working files under `support/`, which is ignored by
Git. The tracked reconciliation record stores the export filename, SHA-256
checksum, Figma file key, color profile, date, and generated token counts.

## Updating color tokens

Export variables from Figma and name the file with its export date, for example:

```text
support/design-tokens-from-figma-YYYY-MM-DD.json
```

Reconcile the export into the code-facing color tokens:

```sh
npm run tokens:reconcile -- support/design-tokens-from-figma-YYYY-MM-DD.json
```

The reconciler updates:

- `colors.css` from the Figma `Colors` collection.
- The existing code-facing scheme, state-layer, and link-underline values in
  `semantic.css` from the Figma `Theme` collection.
- `figma-reconciliation.json` with the source export identity and scope.

The Figma file uses Display P3. The generated CSS keeps color-managed sRGB
fallbacks and adds `color(display-p3 ...)` overrides without changing public
CSS variable names. Only state layers and underlines already exposed by the code
are generated; Figma-only or unused theme variables are not added automatically.
The public `@theme` block in `semantic.css` defines that exposed scope, so a
missing generated declaration cannot silently shrink the contract on a later
reconciliation. The reconciler validates collection, mode, token, color, and
alias shapes before writing any generated file.

Check that generated color files still match a specific export:

```sh
npm run tokens:check -- support/design-tokens-from-figma-YYYY-MM-DD.json
```

## Other collections

The reconciler intentionally does not rewrite non-color files. Review these
collections when an export changes and update their established owners:

| Figma collection | Code owner |
| --- | --- |
| `Spacing` | `spacing.css` |
| `Responsive` | `responsive.css` |
| `Size` | `size.css` |
| `Typeface` | `typeface.css` |
| `Typescale` | `typescale.css`, `heading.css`, and `../typography.css` |
| `Effect` styles | `../effects.css` |
| Grid styles | `../layout.css` when they represent production layout rules |

`Content`, composed font/style records, and unused Figma variables are reference
data rather than automatic production tokens.

## Validation

After reconciling an export:

```sh
npm run tokens:check -- support/design-tokens-from-figma-YYYY-MM-DD.json
npm run test:tokens
npm run check
npm run build
npm run build-storybook
```

Inspect light, dark, and system themes in Storybook. Restart running Astro or
Storybook development servers after token changes so Tailwind utilities are
rebuilt from the updated `@theme` declarations.
