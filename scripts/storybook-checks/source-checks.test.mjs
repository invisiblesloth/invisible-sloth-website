import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, unlinkSync } from 'node:fs';
import { validateSource } from './source-checks.mjs';
import { codes, makeRepository, write } from './test-helpers.mjs';

test('accepts the focused valid source fixture', () => {
  assert.deepEqual(validateSource({ root: makeRepository() }).diagnostics, []);
});

test('requires the installed Svelte CSF binding and static metadata structure', () => {
  const localCsf = `<script module>import Thing from '../components/Thing.svelte'; const defineMeta = (meta) => ({ Story: Thing }); const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />`;
  assert(validateSource({ root: makeRepository({ story: localCsf }) }).diagnostics.some((item) => item.code === 'SB_CSF_UNRESOLVED' && item.message.includes('runtime named import')));

  const spreadMeta = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const hidden = { title: 'Misc/Hidden' }; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } }, ...hidden });</script><Story name="Default" />`;
  assert(validateSource({ root: makeRepository({ story: spreadMeta }) }).diagnostics.some((item) => item.code === 'SB_CSF_UNRESOLVED' && item.message.includes('metadata cannot contain spreads')));

  const duplicateMeta = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', title: 'Misc/Hidden', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />`;
  assert(validateSource({ root: makeRepository({ story: duplicateMeta }) }).diagnostics.some((item) => item.code === 'SB_CSF_DUPLICATE' && item.message.includes('defineMeta key')));

  const typeOnlyComponent = `<script module lang="ts">import { defineMeta } from '@storybook/addon-svelte-csf'; import type Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />`;
  assert(codes(validateSource({ root: makeRepository({ story: typeOnlyComponent }) }).diagnostics).includes('SB_PRIMARY_METADATA'));

  const mixedTypeOnlyComponent = `<script module lang="ts">import { defineMeta } from '@storybook/addon-svelte-csf'; import { type default as Thing, ThingProps } from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />`;
  assert(codes(validateSource({ root: makeRepository({ story: mixedTypeOnlyComponent }) }).diagnostics).includes('SB_PRIMARY_METADATA'));
});

test('rejects dynamic and invalid Story identifiers before ID prediction', () => {
  const base = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; let runtime = 'Dynamic'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script>`;
  const dynamic = `${base}<Story name={runtime} />`;
  assert(codes(validateSource({ root: makeRepository({ story: dynamic }) }).diagnostics).includes('SB_CSF_UNRESOLVED'));
  const invalidExport = `${base}<Story name="Default" exportName="not-valid" />`;
  assert(codes(validateSource({ root: makeRepository({ story: invalidExport }) }).diagnostics).includes('SB_CSF_UNRESOLVED'));
});

test('rejects dynamic IDs, malformed controls, and non-static argTypes structure', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; let runtimeId = 'dynamic'; const common = { label: { description: 'Label' } }; const { Story } = defineMeta({ title: 'Atoms/Thing', id: runtimeId, component: Thing, tags: ['autodocs'], parameters: { controls: { include: 'label' } }, argTypes: { ...common, count: { description: 'Count' } } });</script><Story name="Default" />`;
  const diagnostics = validateSource({ root: makeRepository({ story }) }).diagnostics;
  assert(diagnostics.some((item) => item.code === 'SB_CSF_UNRESOLVED' && item.message.includes('defineMeta.id')));
  assert(diagnostics.some((item) => item.code === 'SB_CSF_UNRESOLVED' && item.message.includes('controls.include')));
  assert(diagnostics.some((item) => item.code === 'SB_CSF_UNRESOLVED' && item.message.includes('argTypes cannot contain spreads')));
});

test('requires descriptions for every retained argTypes entry', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { control: 'text' }, count: { description: 'Count' } } });</script><Story name="Default" />`;
  assert(validateSource({ root: makeRepository({ story }) }).diagnostics.some((item) => item.code === 'SB_ARGTYPE_EXPLANATION' && item.message.includes('label')));
});

test('reports missing explicit prop documentation independently of controls and args', () => {
  const root = makeRepository({ story: `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' } } });</script><Story name="Default" />` });
  assert(codes(validateSource({ root }).diagnostics).includes('SB_ARGTYPE_MISSING'));
});

test('recognizes snippet inputs inherited through imported composition types', () => {
  const component = `<script module lang="ts">import type { SharedProps } from '../lib/SharedProps.svelte'; export type ThingProps = SharedProps & { label: string };</script><script lang="ts">let { children, label }: ThingProps = $props();</script><p>{label}</p>`;
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' } } });</script><Story name="Default" />`;
  const shared = `<script module lang="ts">import type { Snippet } from 'svelte'; export type SharedProps = { children?: Snippet };</script>`;
  const diagnostics = validateSource({ root: makeRepository({ component, story, extras: { 'src/lib/SharedProps.svelte': shared } }) }).diagnostics;
  assert(!codes(diagnostics).includes('SB_ARGTYPE_MISSING'));
  const inherited = component.replace('export type ThingProps = SharedProps & { label: string };', 'export interface ThingProps extends SharedProps { label: string }');
  const inheritedDiagnostics = validateSource({ root: makeRepository({ component: inherited, story, extras: { 'src/lib/SharedProps.svelte': shared } }) }).diagnostics;
  assert(!codes(inheritedDiagnostics).includes('SB_ARGTYPE_MISSING'));
});

test('keeps template bindings unresolved when they shadow module constants or imports', () => {
  const moduleBindings = [
    "const args = { label: 'module' };",
    "import { args } from '../lib/defaultArgs.ts';",
  ];
  const storyFor = (moduleBinding, instanceBinding = '') => `<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';
    import Thing from '../components/Thing.svelte';
    ${moduleBinding}
    const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], args,
      argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });
  </script><script>${instanceBinding}</script><Story name="Default" args={args} />`;
  const check = (moduleBinding, instanceBinding) => validateSource({ root: makeRepository({
    story: storyFor(moduleBinding, instanceBinding),
    extras: { 'src/lib/defaultArgs.ts': "export const args = { label: 'module' };" },
  }) }).diagnostics;

  for (const moduleBinding of moduleBindings) {
    assert.deepEqual(check(moduleBinding, ''), []);
    assert.deepEqual(check(moduleBinding, "const args = { label: 'instance' };"), []);
    for (const instanceBinding of [
      "let args = { label: 'instance', typo: true };",
      "const args = { label: 'instance' }; args.typo = true;",
      "let { args } = { args: { label: 'instance', typo: true } };",
    ]) {
      const diagnostics = check(moduleBinding, instanceBinding);
      assert.deepEqual(codes(diagnostics), ['SB_ARGS_UNRESOLVED'], instanceBinding);
      assert.equal(diagnostics[0].file, 'src/stories/Thing.stories.svelte');
      assert.match(diagnostics[0].message, /Story "Default" args/);
    }
    assert.deepEqual(codes(check(moduleBinding, "const args = { label: 'instance', typo: true };")), ['SB_ARG_UNSUPPORTED']);
  }
});

test('requires union prop documentation regardless of snippet branch order', () => {
  const story = `<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';
    import Thing from '../components/Thing.svelte';
    const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'],
      argTypes: { label: { description: 'Label' } } });
  </script><Story name="Default" />`;
  const componentFor = (union) => `<script module lang="ts">
    import type { Snippet } from 'svelte';
    type Plain = { label: string; content?: string };
    type Rich = { label: string; content?: Snippet };
    type NullableRich = { label: string; content?: Snippet | null };
    export type ThingProps = ${union};
  </script><script lang="ts">let { label, content }: ThingProps = $props();</script><p>{label}</p>`;
  for (const union of ['Plain | Rich', 'Rich | Plain', 'Readonly<Plain> | Partial<Rich>', '(Rich | NullableRich) | Plain']) {
    const component = componentFor(union);
    const diagnostics = validateSource({ root: makeRepository({ component, story }) }).diagnostics;
    assert.deepEqual(codes(diagnostics), ['SB_ARGTYPE_MISSING'], union);
    assert.equal(diagnostics[0].file, 'src/stories/Thing.stories.svelte');
    assert.match(diagnostics[0].message, /Explicit prop "content"/);
    const documentedStory = story.replace("label: { description: 'Label' }", "label: { description: 'Label' }, content: { description: 'Text or snippet' }");
    assert.deepEqual(validateSource({ root: makeRepository({ component, story: documentedStory }) }).diagnostics, []);
  }
  for (const union of ['Rich | NullableRich', 'NullableRich | Rich', "Pick<Plain, 'label'> | Rich"]) {
    assert.deepEqual(validateSource({ root: makeRepository({ component: componentFor(union), story }) }).diagnostics, [], union);
  }
});

test('resolves module constant dependencies in their declaration scope', () => {
  const storyFor = (instanceBinding, storyArgs = 'defaults') => `<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';
    import Thing from '../components/Thing.svelte';
    const args = { label: 'module' };
    const defaults = args;
    const name = 'Default';
    const storyName = name;
    const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'],
      argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });
  </script><script>${instanceBinding}</script><Story name={storyName} args={${storyArgs}} />`;
  for (const binding of [
    "let args = { typo: true }; let name = 'Wrong';",
    "const args = { typo: true }; const name = 'Wrong';",
    "const args = {}; args.typo = true; const name = 'Wrong';",
  ]) {
    const result = validateSource({ root: makeRepository({ story: storyFor(binding) }) });
    assert.deepEqual(result.diagnostics, [], binding);
    assert.equal(result.model.stories[0].stories[0].name, 'Default');
  }
  // Reusing the dependency's name in the inner scope is not an alias cycle.
  assert.deepEqual(validateSource({ root: makeRepository({ story: storyFor('const args = defaults;', 'args') }) }).diagnostics, []);
  const cyclic = storyFor('').replace("const args = { label: 'module' };", 'const args = defaults;');
  assert.deepEqual(codes(validateSource({ root: makeRepository({ story: cyclic }) }).diagnostics), ['SB_ARGS_UNRESOLVED']);

  const assetStory = storyFor("const source = '/missing-instance.svg';")
    .replace('const defaults = args;', "const defaults = args; const source = '/present.svg'; const asset = source;")
    .replace('<Story name={storyName} args={defaults} />', '<Story name={storyName} args={defaults}><img src={asset} alt="Fixture" /></Story>');
  const extras = { 'public/present.svg': '<svg xmlns="http://www.w3.org/2000/svg" />' };
  assert.deepEqual(validateSource({ root: makeRepository({ story: assetStory, extras }) }).diagnostics, []);
  const missingModuleAsset = assetStory.replace("const source = '/present.svg';", "const source = '/missing-module.svg';")
    .replace("const source = '/missing-instance.svg';", "const source = '/present.svg';");
  assert.deepEqual(codes(validateSource({ root: makeRepository({ story: missingModuleAsset, extras }) }).diagnostics), ['SB_ASSET_MISSING']);
});

test('resolves native interface heritage and preserves projection restrictions', () => {
  const componentFor = (propsType) => `<script module lang="ts">
    import type { HTMLAttributes as NativeAttributes } from 'svelte/elements';
    interface NativeBase extends NativeAttributes<HTMLDivElement> {}
    ${propsType}
  </script><script lang="ts">let { label, ...rest }: ThingProps = $props();</script><div {...rest}>{label}</div>`;
  const story = `<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';
    import Thing from '../components/Thing.svelte';
    const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'],
      args: { label: 'Example', role: 'status' },
      argTypes: { label: { description: 'Label' }, role: { control: false, description: 'Native role', table: { category: 'Forwarded native attribute' } } } });
  </script><Story name="Default" />`;
  for (const base of ['NativeAttributes<HTMLDivElement>', 'NativeBase']) {
    const component = componentFor(`export interface ThingProps extends ${base} { label: string }`);
    assert.deepEqual(validateSource({ root: makeRepository({ component, story }) }).diagnostics, [], base);
    const missingLabel = story.replace("label: { description: 'Label' }, ", '').replace("label: 'Example', ", '');
    assert.deepEqual(codes(validateSource({ root: makeRepository({ component, story: missingLabel }) }).diagnostics), ['SB_ARGTYPE_MISSING']);
  }
  const omitted = componentFor("export interface ThingProps extends Omit<NativeBase, 'role'> { label: string }");
  assert.deepEqual(codes(validateSource({ root: makeRepository({ component: omitted, story }) }).diagnostics), ['SB_ARGTYPE_OBSOLETE']);
  const narrowed = componentFor("export type ThingProps = Pick<NativeBase, 'id'> & { label: string };");
  const minimalStory = story.replace("label: 'Example', role: 'status'", "label: 'Example'")
    .replace(", role: { control: false, description: 'Native role', table: { category: 'Forwarded native attribute' } }", '');
  assert.deepEqual(codes(validateSource({ root: makeRepository({ component: narrowed, story: minimalStory }) }).diagnostics), ['SB_PROP_UNRESOLVED']);

  const imported = componentFor('export interface ThingProps extends NativeBase { label: string }')
    .replace('interface NativeBase extends NativeAttributes<HTMLDivElement> {}', "import type { NativeBase } from '../types/native';");
  assert.deepEqual(validateSource({ root: makeRepository({ component: imported, story, extras: {
    'src/types/native.ts': "import type { HTMLAttributes } from 'svelte/elements'; export interface NativeBase extends HTMLAttributes<HTMLDivElement> {}",
  } }) }).diagnostics, []);
  const cyclic = componentFor('interface Loop extends NativeBase {} export interface ThingProps extends Loop { label: string }')
    .replace('interface NativeBase extends NativeAttributes<HTMLDivElement> {}', 'interface NativeBase extends Loop {}');
  assert.deepEqual(codes(validateSource({ root: makeRepository({ component: cyclic, story: minimalStory }) }).diagnostics), ['SB_PROP_UNRESOLVED']);
});

test('respects composed Pick and Omit prop surfaces', () => {
  const component = `<script module lang="ts">type Base = { hidden: string; kept: string; ignored: string }; export type ThingProps = Omit<Pick<Base, 'hidden' | 'kept'>, 'hidden'>;</script><script lang="ts">let { kept }: ThingProps = $props();</script><p>{kept}</p>`;
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { kept: { description: 'Kept value' } } });</script><Story name="Default" />`;
  const diagnostics = validateSource({ root: makeRepository({ component, story }) }).diagnostics;
  assert(!codes(diagnostics).includes('SB_ARGTYPE_MISSING'));

  const repeatedBase = `<script module lang="ts">type Base = { label: string; count: number; hidden: string }; export type ThingProps = Pick<Base, 'label'> & Pick<Base, 'count'>;</script><script lang="ts">let { label, count }: ThingProps = $props();</script><p>{label} {count}</p>`;
  const repeatedDiagnostics = validateSource({ root: makeRepository({ component: repeatedBase, story: story.replaceAll('kept', 'label') }) }).diagnostics;
  assert(repeatedDiagnostics.some((item) => item.code === 'SB_ARGTYPE_MISSING' && item.message.includes('count')));
});

test('fails closed on unsupported prop syntax without hiding project-owned Attributes types', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: {} });</script><Story name="Default" />`;
  const mapped = `<script module lang="ts">type Keys = 'label' | 'count'; export type ThingProps = { [Key in Keys]: string };</script><script lang="ts">let { label }: ThingProps = $props();</script><p>{label}</p>`;
  const mappedDiagnostics = validateSource({ root: makeRepository({ component: mapped, story }) }).diagnostics;
  assert(mappedDiagnostics.some((item) => item.code === 'SB_PROP_UNRESOLVED' && item.file === 'src/components/Thing.svelte'));

  const custom = `<script module lang="ts">type CustomAttributes = { secret: string }; export type ThingProps = CustomAttributes;</script><script lang="ts">let { secret }: ThingProps = $props();</script><p>{secret}</p>`;
  const customDiagnostics = validateSource({ root: makeRepository({ component: custom, story }) }).diagnostics;
  assert(customDiagnostics.some((item) => item.code === 'SB_ARGTYPE_MISSING' && item.message.includes('secret')));
  assert(!codes(customDiagnostics).includes('SB_PROP_UNRESOLVED'));

  const disconnected = `<script module lang="ts">export type OtherProps = { hidden: string };</script><script lang="ts">let { label }: { label: string } = $props();</script><p>{label}</p>`;
  assert(codes(validateSource({ root: makeRepository({ component: disconnected, story }) }).diagnostics).includes('SB_PROP_UNRESOLVED'));

  const computed = `<script module lang="ts">declare const key: unique symbol; export type ThingProps = { label: string; [key]: string };</script><script lang="ts">let { label }: ThingProps = $props();</script><p>{label}</p>`;
  assert(codes(validateSource({ root: makeRepository({ component: computed, story }) }).diagnostics).includes('SB_PROP_UNRESOLVED'));

  const cyclic = `<script module lang="ts">type A = B; type B = A; export type ThingProps = A;</script><script lang="ts">let { label }: ThingProps = $props();</script><p>{label}</p>`;
  assert(codes(validateSource({ root: makeRepository({ component: cyclic, story }) }).diagnostics).includes('SB_PROP_UNRESOLVED'));
});

test('resolves default-imported local prop contracts', () => {
  const component = `<script module lang="ts">import type SharedProps from '../types/shared'; export type ThingProps = SharedProps;</script><script lang="ts">let { label, count = 0 }: ThingProps = $props();</script><p>{label} {count}</p>`;
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' } } });</script><Story name="Default" />`;
  const diagnostics = validateSource({ root: makeRepository({ component, story, extras: { 'src/types/shared.ts': 'export default interface SharedProps { label: string; count?: number }' } }) }).diagnostics;
  assert(diagnostics.some((item) => item.code === 'SB_ARGTYPE_MISSING' && item.message.includes('count')));
  assert(!codes(diagnostics).includes('SB_PROP_UNRESOLVED'));
});

test('resolves metadata constants only from the module lexical scope', () => {
  const moduleShadow = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const title = 'Misc/Wrong'; function unused() { const title = 'Atoms/Thing'; return title; } const { Story } = defineMeta({ title, component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />`;
  const nestedDiagnostics = validateSource({ root: makeRepository({ story: moduleShadow }) }).diagnostics;
  assert(nestedDiagnostics.some((item) => item.code === 'SB_TITLE_ORDER' && item.file === 'src/stories/Thing.stories.svelte'));

  const instanceShadow = moduleShadow.replace('</script><Story', '</script><script>const title = \'Atoms/Thing\';</script><Story');
  assert(codes(validateSource({ root: makeRepository({ story: instanceShadow }) }).diagnostics).includes('SB_TITLE_ORDER'));

  const shadowedMutation = moduleShadow.replace(
    "function unused() { const title = 'Atoms/Thing'; return title; }",
    "function unused(title) { title.value = 'not the module binding'; }"
  );
  const shadowedMutationCodes = codes(validateSource({ root: makeRepository({ story: shadowedMutation }) }).diagnostics);
  assert(!shadowedMutationCodes.includes('SB_CSF_UNRESOLVED'));
  assert(shadowedMutationCodes.includes('SB_TITLE_ORDER'));

  const loopShadow = moduleShadow.replace(
    "function unused() { const title = 'Atoms/Thing'; return title; }",
    "for (const title of []) { title.value = 'not the module binding'; }"
  );
  const loopShadowCodes = codes(validateSource({ root: makeRepository({ story: loopShadow }) }).diagnostics);
  assert(!loopShadowCodes.includes('SB_CSF_UNRESOLVED'));
  assert(loopShadowCodes.includes('SB_TITLE_ORDER'));
});

test('reports Atomic-title and Autodocs failures', () => {
  const root = makeRepository({ story: `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Misc', component: Thing, argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />` });
  const found = codes(validateSource({ root }).diagnostics);
  assert(found.includes('SB_TITLE_ORDER'));
  assert(found.includes('SB_AUTODOCS'));
});

test('reports duplicate generated Docs IDs even when story IDs differ', () => {
  const root = makeRepository();
  write(root, 'src/stories/Duplicate.stories.svelte', `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Different" />`);
  assert(validateSource({ root }).diagnostics.some((item) => item.code === 'SB_CSF_DUPLICATE' && item.message.includes('Docs ID')));
});

test('accepts a reasoned argTypes omission and rejects stale or fake directives', () => {
  const component = `<script module lang="ts">export type ThingProps = { label: string; count?: number; internal?: boolean };</script><script lang="ts">let { label, count = 0, internal = false }: ThingProps = $props();</script><p>{label} {count} {internal}</p>`;
  const validStory = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte';\n// storybook-check: omit-argtype internal -- Internal state is intentionally not part of the family documentation.\nconst { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />`;
  const valid = validateSource({ root: makeRepository({ component, story: validStory }) }).diagnostics;
  assert(!codes(valid).includes('SB_ARGTYPE_MISSING'));
  assert(!codes(valid).includes('SB_ARGTYPE_OMISSION_STALE'));

  const staleStory = validStory.replace("count: { description: 'Count' }", "count: { description: 'Count' }, internal: { description: 'Now documented' }");
  assert(codes(validateSource({ root: makeRepository({ component, story: staleStory }) }).diagnostics).includes('SB_ARGTYPE_OMISSION_STALE'));

  const fakeStory = validStory.replace('// storybook-check: omit-argtype internal -- Internal state is intentionally not part of the family documentation.', "const decoy = 'storybook-check: omit-argtype internal -- not a comment';");
  assert(codes(validateSource({ root: makeRepository({ component, story: fakeStory }) }).diagnostics).includes('SB_ARGTYPE_MISSING'));

  const templateDecoy = validStory.replace('// storybook-check: omit-argtype internal -- Internal state is intentionally not part of the family documentation.', "const decoy = `\n// storybook-check: omit-argtype internal -- not a comment\n`;");
  assert(codes(validateSource({ root: makeRepository({ component, story: templateDecoy }) }).diagnostics).includes('SB_ARGTYPE_MISSING'));

  const instanceDirective = validStory.replace('// storybook-check: omit-argtype internal -- Internal state is intentionally not part of the family documentation.\n', '').replace('</script><Story', '</script><script>// storybook-check: omit-argtype internal -- Wrong script context.</script><Story');
  assert(codes(validateSource({ root: makeRepository({ component, story: instanceDirective }) }).diagnostics).includes('SB_ARGTYPE_MISSING'));

  const malformedStory = validStory.replace('internal -- Internal state is intentionally not part of the family documentation.', 'internal --   ');
  assert(codes(validateSource({ root: makeRepository({ component, story: malformedStory }) }).diagnostics).includes('SB_ARGTYPE_OMISSION_INVALID'));

  const duplicateStory = validStory.replace('const { Story }', '// storybook-check: omit-argtype internal -- Duplicate reason.\nconst { Story }');
  assert(codes(validateSource({ root: makeRepository({ component, story: duplicateStory }) }).diagnostics).includes('SB_ARGTYPE_OMISSION_DUPLICATE'));
});

test('reports obsolete argTypes and missing eligible coverage', () => {
  const root = makeRepository({ story: `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' }, gone: { description: 'Old' } } });</script><Story name="Default" />`, extras: { 'src/components/Uncovered.svelte': `<p>uncovered</p>` } });
  const found = codes(validateSource({ root }).diagnostics);
  assert(found.includes('SB_ARGTYPE_OBSOLETE'));
  assert(found.includes('SB_COVERAGE_MISSING'));
});

test('checks per-story args and statically resolvable spreads', () => {
  const root = makeRepository({ story: `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const extra = { typo: true }; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" args={{ label: 'ok', ...extra }} />` });
  assert(codes(validateSource({ root }).diagnostics).includes('SB_ARG_UNSUPPORTED'));
  const mutated = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const args = { label: 'ok' }; args.typo = true; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], args, argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />`;
  assert(codes(validateSource({ root: makeRepository({ story: mutated }) }).diagnostics).includes('SB_ARGS_UNRESOLVED'));
});

test('requires forwarded native args to be explicitly documented', () => {
  const component = `<script module lang="ts">import type { SvelteHTMLElements } from 'svelte/elements'; type Native = Omit<SvelteHTMLElements['div'], 'children'>; export type ThingProps = Native & { label: string };</script><script lang="ts">let { label, ...restProps }: ThingProps = $props();</script><div {...restProps}>{label}</div>`;
  const undocumented = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' } } });</script><Story name="Default" args={{ label: 'ok', role: 'status' }} />`;
  assert(codes(validateSource({ root: makeRepository({ component, story: undocumented }) }).diagnostics).includes('SB_ARG_UNSUPPORTED'));
  const documented = undocumented.replace("label: { description: 'Label' }", "label: { description: 'Label' }, role: { control: false, description: 'Forwarded native role.', table: { category: 'Forwarded native attribute' } }");
  assert(!codes(validateSource({ root: makeRepository({ component, story: documented }) }).diagnostics).includes('SB_ARGTYPE_OBSOLETE'));
  const filtered = component.replace('</script><div {...restProps}>', 'const forwarded = $derived(filter(restProps));</script><div {...forwarded}>');
  assert(!codes(validateSource({ root: makeRepository({ component: filtered, story: documented }) }).diagnostics).includes('SB_ARGTYPE_OBSOLETE'));
  const unrelatedSpread = component.replace('</script><div {...restProps}>', 'const unrelated = {};</script><div {...unrelated}>');
  assert(codes(validateSource({ root: makeRepository({ component: unrelatedSpread, story: documented }) }).diagnostics).includes('SB_ARGTYPE_OBSOLETE'));

  const misleadingName = `<script module lang="ts">type HTMLAttributes = { label: string }; export type ThingProps = HTMLAttributes;</script><script lang="ts">let { label, ...restProps }: ThingProps = $props();</script><div {...restProps}>{label}</div>`;
  assert(codes(validateSource({ root: makeRepository({ component: misleadingName, story: documented }) }).diagnostics).includes('SB_ARGTYPE_OBSOLETE'));
  const unusedNativeImport = `<script module lang="ts">import type { HTMLAttributes } from 'svelte/elements'; export type ThingProps = { label: string };</script><script lang="ts">let { label, ...restProps }: ThingProps = $props();</script><div {...restProps}>{label}</div>`;
  assert(codes(validateSource({ root: makeRepository({ component: unusedNativeImport, story: documented }) }).diagnostics).includes('SB_ARGTYPE_OBSOLETE'));
  const misleadingDerivation = component.replace('</script><div {...restProps}>', 'const forwarded = { restProps: true };</script><div {...forwarded}>');
  assert(codes(validateSource({ root: makeRepository({ component: misleadingDerivation, story: documented }) }).diagnostics).includes('SB_ARGTYPE_OBSOLETE'));

  const narrowedNative = component.replace("Omit<SvelteHTMLElements['div'], 'children'>", "Pick<SvelteHTMLElements['div'], 'id'>");
  assert(codes(validateSource({ root: makeRepository({ component: narrowedNative, story: documented }) }).diagnostics).includes('SB_PROP_UNRESOLVED'));

  const excludedNative = component.replace("Omit<SvelteHTMLElements['div'], 'children'>", "Omit<SvelteHTMLElements['div'], 'children' | 'role'>");
  assert(codes(validateSource({ root: makeRepository({ component: excludedNative, story: documented }) }).diagnostics).includes('SB_ARGTYPE_OBSOLETE'));
});

test('rejects forwarded-native claims when the component does not forward attributes', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], args: { label: 'ok', role: 'status' }, argTypes: { label: { description: 'Label' }, count: { description: 'Count' }, role: { control: false, description: 'Forwarded native role.', table: { category: 'Forwarded native attribute' } } } });</script><Story name="Default" />`;
  const found = codes(validateSource({ root: makeRepository({ story }) }).diagnostics);
  assert(found.includes('SB_ARGTYPE_OBSOLETE'));
});

test('validates static per-story controls.include independently of args', () => {
  const obsolete = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" parameters={{ controls: { include: ['ghost'] } }} />`;
  assert(codes(validateSource({ root: makeRepository({ story: obsolete }) }).diagnostics).includes('SB_CONTROL_OBSOLETE'));
  const malformed = obsolete.replace("include: ['ghost']", "include: 'label'");
  assert(codes(validateSource({ root: makeRepository({ story: malformed }) }).diagnostics).includes('SB_CSF_UNRESOLVED'));
  const unrelatedDynamicParameter = obsolete.replace("parameters={{ controls: { include: ['ghost'] } }}", "parameters={{ docs: { transform: () => 'source' } }}");
  assert(!codes(validateSource({ root: makeRepository({ story: unrelatedDynamicParameter }) }).diagnostics).includes('SB_CSF_UNRESOLVED'));
});

test('resolves metadata controls through static parameter bindings', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const parameters = { controls: { include: ['ghost'] } }; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], parameters, argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />`;
  assert(codes(validateSource({ root: makeRepository({ story }) }).diagnostics).includes('SB_CONTROL_OBSOLETE'));
});

test('rejects wholly dynamic story args even when no keys can be recovered', () => {
  const root = makeRepository({ story: `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; let runtimeArgs; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" args={runtimeArgs} />` });
  assert(codes(validateSource({ root }).diagnostics).includes('SB_ARGS_UNRESOLVED'));
});

test('resolves named imported object constants used as args', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; import { DEFAULT_ARGS } from '../lib/defaultArgs'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], args: DEFAULT_ARGS, argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />`;
  const root = makeRepository({ story, extras: { 'src/lib/defaultArgs.ts': `export const DEFAULT_ARGS = { label: 'imported', count: 2 } as const;` } });
  assert(!codes(validateSource({ root }).diagnostics).includes('SB_ARGS_UNRESOLVED'));
  const moduleRoot = makeRepository({ story: story.replace("../lib/defaultArgs", "../lib/defaultArgs.mjs"), extras: { 'src/lib/defaultArgs.mjs': `export const DEFAULT_ARGS = { label: 'imported', count: 2 };` } });
  assert(!codes(validateSource({ root: moduleRoot }).diagnostics).includes('SB_ARGS_UNRESOLVED'));
  const mutableRoot = makeRepository({ story, extras: { 'src/lib/defaultArgs.ts': `export let DEFAULT_ARGS = { label: 'mutable', count: 2 };` } });
  assert(codes(validateSource({ root: mutableRoot }).diagnostics).includes('SB_ARGS_UNRESOLVED'));
  const privateRoot = makeRepository({ story, extras: { 'src/lib/defaultArgs.ts': `const DEFAULT_ARGS = { label: 'private', count: 2 };` } });
  assert(codes(validateSource({ root: privateRoot }).diagnostics).includes('SB_ARGS_UNRESOLVED'));
  const mutatedRoot = makeRepository({ story, extras: { 'src/lib/defaultArgs.ts': `export const DEFAULT_ARGS = { label: 'mutable object', count: 2 }; DEFAULT_ARGS.typo = true;` } });
  assert(codes(validateSource({ root: mutatedRoot }).diagnostics).includes('SB_ARGS_UNRESOLVED'));
  const shadowedMutationRoot = makeRepository({ story, extras: { 'src/lib/defaultArgs.ts': `export const DEFAULT_ARGS = { label: 'imported', count: 2 } as const; function update(DEFAULT_ARGS: Record<string, unknown>) { DEFAULT_ARGS.typo = true; }` } });
  assert(!codes(validateSource({ root: shadowedMutationRoot }).diagnostics).includes('SB_ARGS_UNRESOLVED'));
  const loopShadowRoot = makeRepository({ story, extras: { 'src/lib/defaultArgs.ts': `export const DEFAULT_ARGS = { label: 'imported', count: 2 } as const; for (const DEFAULT_ARGS of []) { DEFAULT_ARGS.typo = true; }` } });
  assert(!codes(validateSource({ root: loopShadowRoot }).diagnostics).includes('SB_ARGS_UNRESOLVED'));
});

test('allows ordinary story helpers but rejects CSF markers outside discovery', () => {
  const root = makeRepository({ extras: { 'src/stories/Helper.svelte': `<script>const examples = ['defineMeta({})', '<Story name="Decoy" />', "from '@storybook/addon-svelte-csf'"];</script><p>{examples.length}</p>` } });
  assert(!codes(validateSource({ root }).diagnostics).includes('SB_DISCOVERY_EXCLUDED'));
  write(root, 'src/stories/Misnamed.svelte', `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; defineMeta({ title: 'Atoms/Misnamed' });</script>`);
  assert(codes(validateSource({ root }).diagnostics).includes('SB_DISCOVERY_EXCLUDED'));
});

test('rejects misplaced CSF across module extensions and default-exported metadata bindings', () => {
  const root = makeRepository();
  write(root, 'src/misplaced/Inline.stories.mjs', `export default { title: 'Atoms/Inline' }; export const Default = {};`);
  write(root, 'src/misplaced/Bound.stories.ts', `const meta = { title: 'Atoms/Bound' }; export default meta; export const Default = {};`);
  write(root, 'src/misplaced/Auto.stories.ts', `import Thing from '../components/Thing.svelte'; export default { component: Thing }; export const Default = {};`);
  const excluded = validateSource({ root }).diagnostics.filter((item) => item.code === 'SB_DISCOVERY_EXCLUDED');
  assert(excluded.some((item) => item.file.endsWith('Inline.stories.mjs')));
  assert(excluded.some((item) => item.file.endsWith('Bound.stories.ts')));
  assert(excluded.some((item) => item.file.endsWith('Auto.stories.ts')));
});

test('rejects prohibited imports through a story helper while ignoring type-only edges', () => {
  const root = makeRepository({ story: `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from './Helper.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />`, extras: { 'src/stories/Helper.svelte': `<script lang="ts">import fs from 'node:fs'; import { type CollectionEntry } from 'astro:content';</script><p>helper</p>` } });
  const found = codes(validateSource({ root }).diagnostics);
  assert(found.includes('SB_IMPORT_PROHIBITED'));
  assert(!found.includes('SB_IMPORT_APPROVAL_REQUIRED'));
});

test('does not allow browser approvals to waive Astro server-only imports', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import { getCollection } from 'astro:content'; import Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />`;
  const approval = { id: 'bad-approval', kind: 'browser-safe-import', target: 'astro:content', scope: 'src/stories/Thing.stories.svelte', reason: 'Invalid fixture approval.', reviewTrigger: 'Import changes.' };
  const registry = { schemaVersion: 1, exceptions: [], judgmentApprovals: [approval], protectedIds: [] };
  const found = codes(validateSource({ root: makeRepository({ story, registry }) }).diagnostics);
  assert(found.includes('SB_IMPORT_PROHIBITED'));
  assert(found.includes('SB_REGISTRY_STALE'));
});

test('reports one dependency diagnostic when multiple stories share the same helper', () => {
  const root = makeRepository({ story: `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from './Helper.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />`, extras: { 'src/stories/Helper.svelte': `<script>import fs from 'node:fs';</script><p>helper</p>` } });
  write(root, 'src/stories/Second.stories.svelte', `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from './Helper.svelte'; const { Story } = defineMeta({ title: 'Atoms/Second', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />`);
  const helperDiagnostics = validateSource({ root }).diagnostics.filter((item) => item.code === 'SB_IMPORT_PROHIBITED' && item.file === 'src/stories/Helper.svelte');
  assert.equal(helperDiagnostics.length, 1);
});

test('rejects prohibited dynamic imports in a root story', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><script>async function load() { return import('node:fs'); }</script><Story name="Default" />`;
  assert(codes(validateSource({ root: makeRepository({ story }) }).diagnostics).includes('SB_IMPORT_PROHIBITED'));
});

test('rejects static and computed CommonJS runtime imports', () => {
  const staticStory = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><script>const fs = require('node:fs');</script><Story name="Default" />`;
  assert(codes(validateSource({ root: makeRepository({ story: staticStory }) }).diagnostics).includes('SB_IMPORT_PROHIBITED'));
  const computedStory = staticStory.replace("require('node:fs')", 'require(runtimeModule)');
  assert(validateSource({ root: makeRepository({ story: computedStory }) }).diagnostics.some((item) => item.code === 'SB_IMPORT_PROHIBITED' && item.message.includes('static string literals')));
});

test('traverses runtime re-exports while ignoring type-only re-exports', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; import '../lib/reexport'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />`;
  const runtime = makeRepository({ story, extras: { 'src/lib/reexport.ts': `export * from 'node:fs';` } });
  assert(codes(validateSource({ root: runtime }).diagnostics).includes('SB_IMPORT_PROHIBITED'));
  const typeOnly = makeRepository({ story, extras: { 'src/lib/reexport.ts': `export type { CollectionEntry } from 'astro:content';` } });
  assert(!codes(validateSource({ root: typeOnly }).diagnostics).includes('SB_IMPORT_APPROVAL_REQUIRED'));
});

test('validates preview dependencies and root-relative project imports', () => {
  const previewRoot = makeRepository();
  const preview = readFileSync(`${previewRoot}/.storybook/preview.ts`, 'utf8');
  write(previewRoot, '.storybook/preview.ts', `import fs from 'node:fs';\n${preview}`);
  assert(validateSource({ root: previewRoot }).diagnostics.some((item) => item.code === 'SB_IMPORT_PROHIBITED' && item.file === '.storybook/preview.ts'));

  const absoluteStory = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; import '/src/content.config.ts'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />`;
  const absoluteRoot = makeRepository({ story: absoluteStory, extras: { 'src/content.config.ts': 'export const collections = {};' } });
  assert(codes(validateSource({ root: absoluteRoot }).diagnostics).includes('SB_IMPORT_PROHIBITED'));
});

test('detects live network calls from syntax without matching comments or strings', () => {
  const decoy = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const text = 'fetch('; // fetch('/not-real')\nconst { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />`;
  assert(!validateSource({ root: makeRepository({ story: decoy }) }).diagnostics.some((item) => item.code === 'SB_IMPORT_PROHIBITED' && item.message.includes('network')));
  const live = decoy.replace("const text = 'fetch(';", "const text = 'safe'; window.fetch('/api');");
  assert(validateSource({ root: makeRepository({ story: live }) }).diagnostics.some((item) => item.code === 'SB_IMPORT_PROHIBITED' && item.message.includes('network')));
  const computed = decoy.replace("const text = 'fetch(';", "const text = 'safe'; window['fetch']('/api');");
  assert(validateSource({ root: makeRepository({ story: computed }) }).diagnostics.some((item) => item.code === 'SB_IMPORT_PROHIBITED' && item.message.includes('network')));
  const localMethod = decoy.replace("const text = 'fetch(';", "const text = 'safe'; const client = { fetch() {} }; client.fetch();");
  assert(!validateSource({ root: makeRepository({ story: localMethod }) }).diagnostics.some((item) => item.code === 'SB_IMPORT_PROHIBITED' && item.message.includes('network')));
  const shadowed = decoy.replace("const text = 'fetch(';", "const text = 'safe'; const fetch = () => 'local'; fetch();");
  assert(!validateSource({ root: makeRepository({ story: shadowed }) }).diagnostics.some((item) => item.code === 'SB_IMPORT_PROHIBITED' && item.message.includes('network')));
  const parameterShadow = decoy.replace("const text = 'fetch(';", "const text = 'safe'; function run(fetch) { fetch('/fixture'); }");
  assert(!validateSource({ root: makeRepository({ story: parameterShadow }) }).diagnostics.some((item) => item.code === 'SB_IMPORT_PROHIBITED' && item.message.includes('network')));
  const destructuredShadow = decoy.replace("const text = 'fetch(';", "const text = 'safe'; function run(client) { const { WebSocket } = client; new WebSocket('/fixture'); }");
  assert(!validateSource({ root: makeRepository({ story: destructuredShadow }) }).diagnostics.some((item) => item.code === 'SB_IMPORT_PROHIBITED' && item.message.includes('network')));
  const templateLive = decoy.replace('<Story name="Default" />', '<Story name="Default"><button onclick={() => fetch(\'/api\')}>Load</button></Story>');
  assert(validateSource({ root: makeRepository({ story: templateLive }) }).diagnostics.some((item) => item.code === 'SB_IMPORT_PROHIBITED' && item.message.includes('network')));
  const templateShadow = templateLive.replace("const text = 'fetch(';", "const text = 'safe'; const fetch = () => 'local';");
  assert(!validateSource({ root: makeRepository({ story: templateShadow }) }).diagnostics.some((item) => item.code === 'SB_IMPORT_PROHIBITED' && item.message.includes('network')));
  const eachShadow = decoy.replace('<Story name="Default" />', '<Story name="Default">{#each fetch() as fetch}{fetch()}{/each}</Story>');
  assert.equal(validateSource({ root: makeRepository({ story: eachShadow }) }).diagnostics.filter((item) => item.code === 'SB_IMPORT_PROHIBITED' && item.message.includes('network')).length, 1);
});

test('uses narrow browser-safe import approvals and reports them when stale', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; import 'browser-helper'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />`;
  assert(codes(validateSource({ root: makeRepository({ story }) }).diagnostics).includes('SB_IMPORT_APPROVAL_REQUIRED'));
  const approval = { id: 'browser-helper', kind: 'browser-safe-import', target: 'browser-helper', scope: 'src/stories/Thing.stories.svelte', reason: 'Browser-only fixture package.', reviewTrigger: 'Import changes.' };
  const registry = { schemaVersion: 1, exceptions: [], judgmentApprovals: [approval], protectedIds: [] };
  assert(!codes(validateSource({ root: makeRepository({ story, registry }) }).diagnostics).includes('SB_IMPORT_APPROVAL_REQUIRED'));
  const staleStory = story.replace(" import 'browser-helper';", '');
  assert(validateSource({ root: makeRepository({ story: staleStory, registry }) }).diagnostics.some((item) => item.code === 'SB_REGISTRY_STALE' && item.message.includes('browser-helper')));
});

test('rejects a runtime-computed dynamic import specifier', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><script>let moduleName = $state('node:fs'); async function load() { return import(moduleName); }</script><Story name="Default" />`;
  assert(validateSource({ root: makeRepository({ story }) }).diagnostics.some((item) => item.code === 'SB_IMPORT_PROHIBITED' && item.message.includes('static string literals')));
});

test('reports a deleted tracked runtime dependency', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; import '../lib/runtime.js'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />`;
  const root = makeRepository({ story, extras: { 'src/lib/runtime.js': 'export const runtime = true;' } });
  unlinkSync(`${root}/src/lib/runtime.js`);
  assert(validateSource({ root }).diagnostics.some((item) => item.code === 'SB_SOURCE_MISSING' && item.file === 'src/lib/runtime.js'));
});

test('validates the exported Storybook configs rather than unused decoy values', () => {
  const root = makeRepository();
  write(root, '.storybook/main.ts', `const decoy = { stories: ['../src/stories/**/*.stories.svelte'], addons: ['@storybook/addon-svelte-csf', '@storybook/addon-docs', '@storybook/addon-a11y'], framework: { name: '@storybook/svelte-vite', options: { docgen: false } } }; export default {};`);
  write(root, '.storybook/preview.ts', `const decoy = { parameters: { options: { storySort: { order: ['Brand','Foundations','Atoms','Molecules','Organisms','Templates'] } }, viewport: { options: { compact: { name: 'Compact', styles: { width: '430px', height: '932px' } }, medium: { name: 'Medium', styles: { width: '744px', height: '1133px' } }, extended: { name: 'Extended', styles: { width: '1024px', height: '1366px' } }, large: { name: 'Large', styles: { width: '1512px', height: '982px' } } } } }, initialGlobals: { viewport: { value: 'large', isRotated: false } } }; export default {};`);
  assert(codes(validateSource({ root }).diagnostics).includes('SB_CFG_VALUE'));

  const mutable = makeRepository();
  write(mutable, '.storybook/main.ts', `let config = { stories: ['../src/stories/**/*.stories.svelte'], addons: ['@storybook/addon-svelte-csf','@storybook/addon-docs','@storybook/addon-a11y'], framework: { name: '@storybook/svelte-vite', options: { docgen: false } } }; export default config;`);
  assert(codes(validateSource({ root: mutable }).diagnostics).includes('SB_CFG_VALUE'));
  const mutated = makeRepository();
  write(mutated, '.storybook/main.ts', `const config = { stories: ['../src/stories/**/*.stories.svelte'], addons: ['@storybook/addon-svelte-csf','@storybook/addon-docs','@storybook/addon-a11y'], framework: { name: '@storybook/svelte-vite', options: { docgen: false } } }; config.stories = []; export default config;`);
  assert(codes(validateSource({ root: mutated }).diagnostics).includes('SB_CFG_VALUE'));

  const mutatedDependency = makeRepository();
  write(mutatedDependency, '.storybook/main.ts', `const stories = ['../src/stories/**/*.stories.svelte']; const config = { stories, addons: ['@storybook/addon-svelte-csf','@storybook/addon-docs','@storybook/addon-a11y'], framework: { name: '@storybook/svelte-vite', options: { docgen: false } } }; stories.pop(); export default config;`);
  assert(codes(validateSource({ root: mutatedDependency }).diagnostics).includes('SB_CFG_VALUE'));

  const mutatedPreviewDependency = makeRepository();
  const preview = readFileSync(`${mutatedPreviewDependency}/.storybook/preview.ts`, 'utf8');
  write(mutatedPreviewDependency, '.storybook/preview.ts', preview.replace('export default {', 'const order = [\'Brand\',\'Foundations\',\'Atoms\',\'Molecules\',\'Organisms\',\'Templates\']; const preview = {').replace("order: ['Brand','Foundations','Atoms','Molecules','Organisms','Templates']", 'order').replace(' };', ' }; order.pop(); export default preview;'));
  assert(codes(validateSource({ root: mutatedPreviewDependency }).diagnostics).includes('SB_CFG_VALUE'));
});

test('rejects unresolved configuration spreads and duplicate keys', () => {
  const root = makeRepository();
  write(root, '.storybook/main.ts', `declare const runtime: object; export default { stories: ['../src/stories/**/*.stories.svelte'], addons: ['@storybook/addon-svelte-csf','@storybook/addon-docs','@storybook/addon-a11y'], framework: { name: '@storybook/svelte-vite', options: { docgen: false, docgen: false } }, ...runtime };`);
  const diagnostics = validateSource({ root }).diagnostics;
  assert(diagnostics.some((item) => item.code === 'SB_CFG_VALUE' && item.message.includes('duplicate key')));
  assert(diagnostics.some((item) => item.code === 'SB_CFG_VALUE' && item.message.includes('spreads must resolve')));
});

test('reports a deleted tracked story as a source diagnostic without throwing', () => {
  const root = makeRepository();
  unlinkSync(`${root}/src/stories/Thing.stories.svelte`);
  const diagnostics = validateSource({ root }).diagnostics;
  assert(diagnostics.some((item) => item.code === 'SB_SOURCE_MISSING' && item.file === 'src/stories/Thing.stories.svelte'));
});

test('reports malformed configuration and Svelte parse failures distinctly', () => {
  const root = makeRepository();
  write(root, '.storybook/main.ts', `export default { stories: ['../src/stories/**/*.stories.svelte'], addons: ['@storybook/addon-svelte-csf','@storybook/addon-docs','@storybook/addon-a11y'], framework: { name: '@storybook/svelte-vite', options: { docgen: false } } BROKEN`);
  write(root, 'src/stories/Thing.stories.svelte', '<script>');
  const found = codes(validateSource({ root }).diagnostics);
  assert(found.includes('SB_CFG_PARSE'));
  assert(found.includes('SB_SOURCE_PARSE'));
});

test('reports missing configuration, imports, primary metadata, controls, and ID capture', () => {
  const missingConfig = makeRepository();
  unlinkSync(`${missingConfig}/.storybook/main.ts`);
  assert(codes(validateSource({ root: missingConfig }).diagnostics).includes('SB_CFG_MISSING'));

  const missingImportStory = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; import '../lib/missing'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], parameters: { controls: { include: ['ghost'] } }, argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />`;
  const missingImport = validateSource({ root: makeRepository({ story: missingImportStory }) }).diagnostics;
  assert(codes(missingImport).includes('SB_IMPORT_MISSING'));
  assert(codes(missingImport).includes('SB_CONTROL_OBSOLETE'));

  const noPrimary = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; const { Story } = defineMeta({ title: 'Atoms/Thing', tags: ['autodocs'] });</script><Story name="Default" />`;
  assert(codes(validateSource({ root: makeRepository({ story: noPrimary }) }).diagnostics).includes('SB_PRIMARY_METADATA'));

  const missingCapture = makeRepository({ extras: { 'package.json': '{}' } });
  assert(codes(validateSource({ root: missingCapture }).diagnostics).includes('SB_ID_FIXTURE_VERSION'));
});

test('rejects an ID capture made by a different installed toolchain', () => {
  const packages = ['storybook', '@storybook/addon-svelte-csf', '@storybook/svelte-vite', '@storybook/csf'];
  const extras = {
    'package.json': '{}',
    'scripts/storybook-checks/fixtures/index/explicit-ids.storybook-10.5.0.json': JSON.stringify({ toolchain: Object.fromEntries(packages.map((name) => [name, '1.0.0'])) }),
  };
  for (const packageName of packages) extras[`node_modules/${packageName}/package.json`] = JSON.stringify({ version: packageName === 'storybook' ? '2.0.0' : '1.0.0' });
  const diagnostics = validateSource({ root: makeRepository({ extras }) }).diagnostics;
  assert(diagnostics.some((item) => item.code === 'SB_ID_FIXTURE_VERSION' && item.message.includes('storybook version')));
});

test('missing-asset directive is occurrence-local in script objects and Story args', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const image = {\n// storybook-check: allow-missing-asset -- fixture\nsrc: '/missing-a.png'\n}; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" args={{ label: 'ok',\n// storybook-check: allow-missing-asset -- fixture\nsrc: '/missing-b.png',\nfallbackSrc: '/missing-c.png' }} />`;
  const result = validateSource({ root: makeRepository({ story }) });
  const missing = result.diagnostics.filter((item) => item.code === 'SB_ASSET_MISSING');
  assert.equal(missing.length, 1);
  assert.match(missing[0].message, /missing-c/);
});

test('checks static asset literals in named imported args objects', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; import { DEFAULT_ARGS } from '../lib/defaultArgs'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], args: DEFAULT_ARGS, argTypes: { label: { description: 'Label' }, count: { description: 'Count' }, src: { control: false, description: 'Fixture asset.', table: { category: 'Story-only' } } } });</script><Story name="Default" />`;
  const root = makeRepository({ story, extras: { 'src/lib/defaultArgs.ts': `export const DEFAULT_ARGS = { label: 'imported', src: '/missing-imported.png' } as const;` } });
  assert(validateSource({ root }).diagnostics.some((item) => item.code === 'SB_ASSET_MISSING' && item.file === 'src/lib/defaultArgs.ts' && item.message.includes('missing-imported')));
});

test('resolves named imported scalar constants used by asset attributes', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; import { IMAGE_SRC } from '../lib/image'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default"><img src={IMAGE_SRC} alt="fixture" /></Story>`;
  const helper = `export const IMAGE_SRC = '/missing-imported-scalar.png';`;
  const diagnostics = validateSource({ root: makeRepository({ story, extras: { 'src/lib/image.ts': helper } }) }).diagnostics;
  assert(diagnostics.some((item) => item.code === 'SB_ASSET_MISSING' && item.file === 'src/lib/image.ts' && item.message.includes('missing-imported-scalar')));
});

test('checks static asset literals in imported Svelte helpers', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from './VisualHelper.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: {} });</script><Story name="Default" />`;
  const helper = `<img src="/missing-helper-image.png" alt="fixture" />`;
  const diagnostics = validateSource({ root: makeRepository({ story, extras: { 'src/stories/VisualHelper.svelte': helper } }) }).diagnostics;
  assert(diagnostics.some((item) => item.code === 'SB_ASSET_MISSING' && item.file === 'src/stories/VisualHelper.svelte' && item.message.includes('missing-helper-image')));
});

test('accepts an occurrence-local asset directive in a named imported args object', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; import { DEFAULT_ARGS } from '../lib/defaultArgs'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], args: DEFAULT_ARGS, argTypes: { label: { description: 'Label' }, count: { description: 'Count' }, src: { control: false, description: 'Fixture asset.', table: { category: 'Story-only' } } } });</script><Story name="Default" />`;
  const helper = `export const DEFAULT_ARGS = { label: 'imported',\n// storybook-check: allow-missing-asset -- deliberately absent fixture\nsrc: '/missing-imported.png' } as const;`;
  const diagnostics = validateSource({ root: makeRepository({ story, extras: { 'src/lib/defaultArgs.ts': helper } }) }).diagnostics;
  assert(!codes(diagnostics).includes('SB_ASSET_MISSING'));
  assert(!codes(diagnostics).includes('SB_ASSET_DIRECTIVE_STALE'));
});

test('one directive covers one imported asset literal reused by multiple consumers and keys', () => {
  const helper = `// storybook-check: allow-missing-asset -- deliberately absent reused fixture\nexport const MISSING = '/missing-reused.png';`;
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; import { MISSING } from './asset-helper.js'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default"><img src={MISSING} alt="One" /><video poster={MISSING}></video></Story>`;
  const diagnostics = validateSource({ root: makeRepository({ story, extras: { 'src/stories/asset-helper.js': helper } }) }).diagnostics;
  assert(!codes(diagnostics).includes('SB_ASSET_MISSING'));
  assert(!codes(diagnostics).includes('SB_ASSET_DIRECTIVE_STALE'));
});

test('reports a stale asset directive in an imported source helper', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; import '../lib/helper'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />`;
  const helper = `// storybook-check: allow-missing-asset -- obsolete\nexport const value = true;`;
  assert(validateSource({ root: makeRepository({ story, extras: { 'src/lib/helper.ts': helper } }) }).diagnostics.some((item) => item.code === 'SB_ASSET_DIRECTIVE_STALE' && item.file === 'src/lib/helper.ts'));
});

test('does not treat directive text inside a string as an asset approval', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const decoy = 'storybook-check: allow-missing-asset -- not a comment';\nconst image = { src: '/missing-after-decoy.png' }; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />`;
  assert(validateSource({ root: makeRepository({ story }) }).diagnostics.some((item) => item.code === 'SB_ASSET_MISSING' && item.message.includes('missing-after-decoy')));
});

test('does not treat directive text inside a multiline template as an asset approval', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const decoy = \`
// storybook-check: allow-missing-asset -- not a comment
\`; const image = {
src: '/missing-template-decoy.png'
}; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />`;
  assert(validateSource({ root: makeRepository({ story }) }).diagnostics.some((item) => item.code === 'SB_ASSET_MISSING' && item.message.includes('missing-template-decoy')));
});

test('rejects remote asset fixtures, including protocol-relative srcset candidates', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default"><img src="https://example.com/live.png" srcset="//cdn.example.com/one.png 1x, /local.png 2x" alt="fixture" /></Story>`;
  const remote = validateSource({ root: makeRepository({ story }) }).diagnostics.filter((item) => item.code === 'SB_ASSET_REMOTE');
  assert.equal(remote.length, 2);
  assert(remote.some((item) => item.message.includes('example.com/live.png')));
  assert(remote.some((item) => item.message.includes('cdn.example.com/one.png')));
});

test('checks CSS and static style-attribute asset URLs with parsed directives', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default"><div style="background-image: url('/missing-style.png')">fixture</div></Story><style>
/* storybook-check: allow-missing-asset -- deliberate CSS fallback fixture */
.fixture { background-image: url('/missing-css-approved.png'); }
.other { background-image: url('/missing-css.png'); }
</style>`;
  const diagnostics = validateSource({ root: makeRepository({ story }) }).diagnostics;
  assert(diagnostics.some((item) => item.code === 'SB_ASSET_MISSING' && item.message.includes('missing-style')));
  assert(diagnostics.some((item) => item.code === 'SB_ASSET_MISSING' && item.message.includes('missing-css.png')));
  assert(!diagnostics.some((item) => item.code === 'SB_ASSET_MISSING' && item.message.includes('missing-css-approved')));
  assert(!codes(diagnostics).includes('SB_ASSET_DIRECTIVE_STALE'));
});

test('resolves static asset constants and requires approval for unresolved asset bindings', () => {
  const staticStory = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const missing = \`/missing-static.png\`; const image = { src: missing }; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' }, src: { control: false, description: 'Forwarded native attribute', table: { category: 'Forwarded native attribute' } } } });</script><Story name="Default" args={{ label: 'ok', ...image }} />`;
  assert(validateSource({ root: makeRepository({ story: staticStory }) }).diagnostics.some((item) => item.code === 'SB_ASSET_MISSING' && item.message.includes('missing-static')));
  const dynamicStory = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><script>let runtimeSrc = $state('');</script><Story name="Default"><img src={runtimeSrc} alt="fixture" /></Story>`;
  assert(codes(validateSource({ root: makeRepository({ story: dynamicStory }) }).diagnostics).includes('SB_ASSET_APPROVAL_REQUIRED'));
  const cyclicStory = dynamicStory.replace("let runtimeSrc = $state('');", 'const runtimeSrc = alternateSrc; const alternateSrc = runtimeSrc;');
  assert(codes(validateSource({ root: makeRepository({ story: cyclicStory }) }).diagnostics).includes('SB_ASSET_APPROVAL_REQUIRED'));
});

test('requires approval for an unresolved native asset spread', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><script>let runtimeImage = $state({});</script><Story name="Default"><img {...runtimeImage} alt="fixture" /></Story>`;
  assert(validateSource({ root: makeRepository({ story }) }).diagnostics.some((item) => item.code === 'SB_ASSET_APPROVAL_REQUIRED' && item.message.includes('binding.runtimeImage.*')));
});

test('does not turn a previously scanned unresolved asset object into a resolved spread', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><script>let runtime = $state({}); const image = { ...runtime };</script><Story name="Default"><img {...image} alt="fixture" /></Story>`;
  assert(validateSource({ root: makeRepository({ story }) }).diagnostics.some((item) => item.code === 'SB_ASSET_APPROVAL_REQUIRED' && item.message.includes('binding.image.*')));
});

test('checks markup asset literals and lets one directive suppress only one occurrence', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default">\n<!-- storybook-check: allow-missing-asset -- first fixture only -->\n<img src="/first.png" poster="/second.png" alt="fixture" />\n</Story>`;
  const missing = validateSource({ root: makeRepository({ story }) }).diagnostics.filter((item) => item.code === 'SB_ASSET_MISSING');
  assert.equal(missing.length, 1);
  assert.match(missing[0].message, /second/);
});

test('reports a stale missing-asset directive', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default">\n<!-- storybook-check: allow-missing-asset -- no longer needed -->\n<p>nothing to approve</p>\n</Story>`;
  assert(codes(validateSource({ root: makeRepository({ story }) }).diagnostics).includes('SB_ASSET_DIRECTIVE_STALE'));
});

test('rejects a missing-asset directive without a reason', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const image = {\n// storybook-check: allow-missing-asset --\nsrc: '/missing.png'\n}; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />`;
  const found = codes(validateSource({ root: makeRepository({ story }) }).diagnostics);
  assert(found.includes('SB_ASSET_DIRECTIVE_INVALID'));
  assert(found.includes('SB_ASSET_MISSING'));
});

test('multi-component exception defines both documentation subjects', () => {
  const registry = { schemaVersion: 1, exceptions: [{ id: 'family', rule: 'component-coverage', storyTitle: 'Brand/Thing', source: 'src/stories/Thing.stories.svelte', components: ['src/components/Thing.svelte', 'src/components/Other.svelte'], reason: 'Family owns both.', reviewTrigger: 'When split.' }], judgmentApprovals: [], protectedIds: [] };
  const root = makeRepository({ registry, extras: { 'src/components/Other.svelte': `<script module lang="ts">export type OtherProps = { href: string };</script><script lang="ts">let { href }: OtherProps = $props();</script><a {href}>x</a>` }, story: `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; const { Story } = defineMeta({ title: 'Brand/Thing', tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />` });
  assert(validateSource({ root }).diagnostics.some((item) => item.code === 'SB_ARGTYPE_MISSING' && item.message.includes('href')));
});

test('multi-component subjects may omit a shared prop only when every contract treats it as a snippet', () => {
  const component = `<script module lang="ts">export type ThingProps = { label: string; shared: string };</script><script lang="ts">let { label, shared }: ThingProps = $props();</script><p>{label} {shared}</p>`;
  const snippetComponent = `<script module lang="ts">import type { Snippet } from 'svelte'; export type OtherProps = { shared?: Snippet };</script><script lang="ts">let { shared }: OtherProps = $props();</script>`;
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; import Other from '../components/Other.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', tags: ['autodocs'], argTypes: { label: { description: 'Label' } } });</script><Story name="Default" />`;
  const exception = { id: 'multi', rule: 'component-coverage', storyTitle: 'Atoms/Thing', source: 'src/stories/Thing.stories.svelte', components: ['src/components/Thing.svelte', 'src/components/Other.svelte'], reason: 'Fixture family.', reviewTrigger: 'Subjects change.' };
  const registry = { schemaVersion: 1, exceptions: [exception], judgmentApprovals: [], protectedIds: [] };
  const diagnostics = validateSource({ root: makeRepository({ component, story, registry, extras: { 'src/components/Other.svelte': snippetComponent } }) }).diagnostics;
  assert(diagnostics.some((item) => item.code === 'SB_ARGTYPE_MISSING' && item.message.includes('shared')));
});

test('component-coverage exception becomes stale when a listed subject is not imported', () => {
  const registry = { schemaVersion: 1, exceptions: [{ id: 'family', rule: 'component-coverage', storyTitle: 'Brand/Thing', source: 'src/stories/Thing.stories.svelte', components: ['src/components/Thing.svelte'], reason: 'Family coverage.', reviewTrigger: 'When imports change.' }], judgmentApprovals: [], protectedIds: [] };
  const root = makeRepository({ registry, story: `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; const { Story } = defineMeta({ title: 'Brand/Thing', tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />` });
  assert(validateSource({ root }).diagnostics.some((item) => item.code === 'SB_REGISTRY_STALE' && item.message.includes('direct runtime import')));
});

test('an exception is stale when its source is not a discovered family even if its title exists elsewhere', () => {
  const registry = { schemaVersion: 1, exceptions: [{ id: 'unused', rule: 'primary-component-metadata', storyTitle: 'Atoms/Thing', source: 'src/stories/Unused.stories.svelte', reason: 'Fixture.', reviewTrigger: 'Source changes.' }], judgmentApprovals: [], protectedIds: [] };
  const extra = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; const { Story } = defineMeta({ title: 'Atoms/Broken', tags: ['autodocs'] });</script><div>`;
  const diagnostics = validateSource({ root: makeRepository({ registry, extras: { 'src/stories/Unused.stories.svelte': extra } }) }).diagnostics;
  assert(diagnostics.some((item) => item.code === 'SB_REGISTRY_STALE' && item.message.includes('unused') && item.message.includes('does not resolve')));
});

test('primary-metadata exception requires the component field to remain absent', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: MissingComponent, tags: ['autodocs'] });</script><Story name="Default" />`;
  const exception = { id: 'missing-primary', rule: 'primary-component-metadata', storyTitle: 'Atoms/Thing', source: 'src/stories/Thing.stories.svelte', reason: 'Fixture foundation.', reviewTrigger: 'Metadata changes.' };
  const registry = { schemaVersion: 1, exceptions: [exception], judgmentApprovals: [], protectedIds: [] };
  assert(validateSource({ root: makeRepository({ story, registry }) }).diagnostics.some((item) => item.code === 'SB_REGISTRY_STALE' && item.message.includes('missing-primary')));
});

test('typing approvals target a current named double assertion through unknown', () => {
  const assertion = `const malformed = 'diagonal' as unknown as string;`;
  const story = `<script module lang="ts">import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; ${assertion} const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], args: { label: malformed }, argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />`;
  const approval = { id: 'typing-malformed', kind: 'typing-limitation', target: 'binding.malformed', scope: 'src/stories/Thing.stories.svelte', reason: 'Intentional runtime fixture.', reviewTrigger: 'Assertion changes.' };
  const registry = { schemaVersion: 1, exceptions: [], judgmentApprovals: [approval], protectedIds: [] };
  const root = makeRepository({ registry, story });
  assert(!codes(validateSource({ root }).diagnostics).includes('SB_REGISTRY_STALE'));
  write(root, 'src/stories/Thing.stories.svelte', story.replace(assertion, `const malformed = 'diagonal';`));
  assert(validateSource({ root }).diagnostics.some((item) => item.code === 'SB_REGISTRY_STALE' && item.message.includes('typing-malformed')));
  write(root, 'src/stories/Thing.stories.svelte', story.replace('args: { label: malformed }, ', ''));
  assert(validateSource({ root }).diagnostics.some((item) => item.code === 'SB_REGISTRY_STALE' && item.message.includes('typing-malformed')));

  const propertyKeyOnly = story.replace('args: { label: malformed }', "args: { malformed: 'ordinary', label: 'valid' }");
  write(root, 'src/stories/Thing.stories.svelte', propertyKeyOnly);
  assert(validateSource({ root }).diagnostics.some((item) => item.code === 'SB_REGISTRY_STALE' && item.message.includes('typing-malformed')));

  const displayOnly = story.replace('args: { label: malformed }, ', '').replace('<Story name="Default" />', '<Story name="Default"><p>{malformed}</p></Story>');
  write(root, 'src/stories/Thing.stories.svelte', displayOnly);
  assert(validateSource({ root }).diagnostics.some((item) => item.code === 'SB_REGISTRY_STALE' && item.message.includes('typing-malformed')));

  const renderedInput = story.replace('args: { label: malformed }, ', '').replace('<Story name="Default" />', '<Story name="Default"><Thing label={malformed} /></Story>');
  write(root, 'src/stories/Thing.stories.svelte', renderedInput);
  assert(!validateSource({ root }).diagnostics.some((item) => item.code === 'SB_REGISTRY_STALE' && item.message.includes('typing-malformed')));
});

test('dynamic approvals require the named Image update-to-spread dataflow', () => {
  const imageStory = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Image from '../components/Image.svelte'; const { Story } = defineMeta({ title: 'Atoms/Image Debug', component: Image, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><script>let debugImageProps = $state({ src: '' }); const setDebugScenario = (scenario, props) => { debugImageProps = { ...debugImageProps, ...props }; };</script><Story name="Default"><Image {...debugImageProps} /><button onclick={() => setDebugScenario('all', { src: '', srcset: '', fallbackSrc: '', fallbackSrcset: '' })}>Update</button></Story>`;
  const approvals = ['src', 'srcset', 'fallbackSrc', 'fallbackSrcset'].map((field) => ({ id: `asset-${field}`, kind: 'dynamic-asset', target: `binding.debugImageProps.${field}`, scope: 'src/stories/Image.stories.svelte', reason: 'Runtime fixture dataflow.', reviewTrigger: 'Binding changes.' }));
  const root = makeRepository({ registry: { schemaVersion: 1, exceptions: [], judgmentApprovals: approvals, protectedIds: [] }, extras: { 'src/components/Image.svelte': `<script module lang="ts">export type ImageProps = { label: string; count?: number };</script><script lang="ts">let { label, count = 0 }: ImageProps = $props();</script><p>{label} {count}</p>`, 'src/stories/Image.stories.svelte': imageStory } });
  assert(!codes(validateSource({ root }).diagnostics).includes('SB_REGISTRY_STALE'));
  write(root, 'src/stories/Image.stories.svelte', imageStory.replace("fallbackSrcset: ''", "fallbackSizes: ''"));
  assert(validateSource({ root }).diagnostics.some((item) => item.code === 'SB_REGISTRY_STALE' && item.message.includes('asset-fallbackSrcset')));
  const deadUpdate = imageStory
    .replace("fallbackSrcset: ''", "fallbackSizes: ''")
    .replace('</script><Story', " function unused() { setDebugScenario('dead', { fallbackSrcset: '' }); }</script><Story");
  write(root, 'src/stories/Image.stories.svelte', deadUpdate);
  assert(validateSource({ root }).diagnostics.some((item) => item.code === 'SB_REGISTRY_STALE' && item.message.includes('asset-fallbackSrcset')));
  const nestedSetterUpdate = imageStory.replace(
    'debugImageProps = { ...debugImageProps, ...props };',
    'function unused() { debugImageProps = { ...debugImageProps, ...props }; }'
  );
  write(root, 'src/stories/Image.stories.svelte', nestedSetterUpdate);
  assert(codes(validateSource({ root }).diagnostics).includes('SB_REGISTRY_STALE'));
  write(root, 'src/stories/Image.stories.svelte', imageStory.replaceAll('debugImageProps', 'renamedProps'));
  assert(codes(validateSource({ root }).diagnostics).includes('SB_REGISTRY_STALE'));
  const commentSpoof = imageStory
    .replace("let debugImageProps = $state({ src: '' });", "let displayProps = { src: '' }; let debugImageProps = $state({ src: '' });")
    .replace('<Image {...debugImageProps} />', '<Image {...displayProps} /><!-- <Image {...debugImageProps} /> -->');
  write(root, 'src/stories/Image.stories.svelte', commentSpoof);
  assert(codes(validateSource({ root }).diagnostics).includes('SB_REGISTRY_STALE'));
  write(root, 'src/stories/Image.stories.svelte', imageStory.replace('<Image {...debugImageProps} />', '<Image {...debugImageProps} /><Image {...debugImageProps} />'));
  assert(codes(validateSource({ root }).diagnostics).includes('SB_REGISTRY_STALE'));
  write(root, 'src/stories/Image.stories.svelte', imageStory.replace("../components/Image.svelte", "../components/Thing.svelte"));
  assert(codes(validateSource({ root }).diagnostics).includes('SB_REGISTRY_STALE'));
});

test('requires narrow approval for unresolved assets in imported Svelte helpers', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from './Helper.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />`;
  const helper = `<script>export let runtimeSrc;</script><img src={runtimeSrc} alt="Runtime fixture" />`;
  const root = makeRepository({ story, extras: { 'src/stories/Helper.svelte': helper } });
  assert(validateSource({ root }).diagnostics.some((item) => item.code === 'SB_ASSET_APPROVAL_REQUIRED' && item.file === 'src/stories/Helper.svelte'));
});

test('resolves extensionless JavaScript module variants in the browser graph', () => {
  const story = `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; import '../lib/runtime-helper'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="Default" />`;
  const root = makeRepository({ story, extras: { 'src/lib/runtime-helper.mjs': `export const browserValue = true;`, 'src/lib/runtime-helper.js': `import fs from 'node:fs';` } });
  assert(!codes(validateSource({ root }).diagnostics).includes('SB_IMPORT_MISSING'));
  assert(!codes(validateSource({ root }).diagnostics).includes('SB_IMPORT_PROHIBITED'));
});
