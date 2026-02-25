<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import FigureCaption from '../components/FigureCaption.svelte';

  const { Story } = defineMeta({
    title: 'Atoms/FigureCaption',
    component: FigureCaption,
    tags: ['autodocs'],
    parameters: {
      controls: {
        include: ['captionText', 'creditText'],
      },
      docs: {
        description: {
          component:
            'Figure caption and credit text for image/illustration figures. When both caption and credit are empty, the component renders no DOM output.',
        },
      },
    },
    argTypes: {
      captionText: {
        control: 'text',
        description: 'Plain-text caption fallback when no caption snippet is supplied.',
      },
      creditText: {
        control: 'text',
        description: 'Plain-text credit fallback when no credit snippet is supplied.',
      },
    },
  });
</script>

<style>
  .figure-caption-story {
    margin-inline: auto;
    width: 100%;
    max-width: var(--size-rail-md);
  }
</style>

<Story
  name="Basic Caption and Credit"
  args={{
    captionText: 'A scenic view of the mountains at sunrise.',
    creditText: 'Photo by Travis Touchdown / Unsplash',
  }}
>
  {#snippet template(args)}
    <figure class="figure-caption-story">
      <FigureCaption {...args} />
    </figure>
  {/snippet}
</Story>

<Story
  name="Credit Only"
  asChild
  parameters={{ controls: { disable: true } }}
>
  {#snippet children()}
    <figure class="figure-caption-story">
      <FigureCaption
        creditText="Photo by Travis Touchdown / Unsplash"
      />
    </figure>
  {/snippet}
</Story>

<Story
  name="Multiple Linked Credits"
  asChild
  parameters={{ controls: { disable: true } }}
>
  {#snippet children()}
    {#snippet credit()}
      <span>Photo by </span>
      <a class="text-link" href="https://unsplash.com/@maeborowski">Mae Borowski</a>
      <span>, </span>
      <a class="text-link" href="https://unsplash.com/@razaquato">Raz Aquato</a>
      <span> / </span>
      <a class="text-link" href="https://unsplash.com">Unsplash</a>
    {/snippet}
    <figure class="figure-caption-story">
      <FigureCaption {credit} />
    </figure>
  {/snippet}
</Story>

<Story
  name="Rich Caption and Linked Credit"
  asChild
  parameters={{ controls: { disable: true } }}
>
  {#snippet children()}
    {#snippet caption()}
      <span>showcasing </span>
      <strong>modern art</strong>
      <span> </span>
      <em>styles</em>
    {/snippet}
    {#snippet credit()}
      <span>Illustration by </span>
      <a class="text-link" href="https://unsplash.com/@kaineparker">Kaine Parker</a>
    {/snippet}
    <figure class="figure-caption-story">
      <FigureCaption {caption} {credit} />
    </figure>
  {/snippet}
</Story>

<Story
  name="Illustration Credit"
  asChild
  parameters={{ controls: { disable: true } }}
>
  {#snippet children()}
    {#snippet credit()}
      <span>Illustration by </span>
      <a class="text-link" href="https://unsplash.com/@lucca">Lucca</a>
    {/snippet}
    <figure class="figure-caption-story">
      <FigureCaption {credit} />
    </figure>
  {/snippet}
</Story>

<Story
  name="Snippet Overrides Text"
  asChild
  parameters={{ controls: { disable: true } }}
>
  {#snippet children()}
    {#snippet caption()}
      <span>Snippet caption </span>
      <strong>wins</strong>
    {/snippet}
    {#snippet credit()}
      <span>Snippet credit </span>
      <em>wins</em>
    {/snippet}
    <figure class="figure-caption-story">
      <FigureCaption
        captionText="This text caption should not appear"
        creditText="This text credit should not appear"
        {caption}
        {credit}
      />
    </figure>
  {/snippet}
</Story>
