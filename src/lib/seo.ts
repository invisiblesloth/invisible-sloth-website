export type SocialImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type JsonLdIdReference = {
  '@id': string;
};

export type WebSiteJsonLdNode = {
  '@type': 'WebSite';
  '@id': string;
  url: string;
  name: string;
  alternateName: string;
  publisher: JsonLdIdReference;
};

export type OrganizationJsonLdNode = {
  '@type': 'Organization';
  '@id': string;
  name: string;
  legalName: string;
  url: string;
  sameAs: string[];
  logo: JsonLdIdReference;
};

export type ImageObjectJsonLdNode = {
  '@type': 'ImageObject';
  '@id': string;
  url: string;
  contentUrl: string;
  width: number;
  height: number;
};

export type WebPageJsonLdNode = {
  '@type': 'WebPage';
  '@id': string;
  url: string;
  name: string;
  description: string;
  isPartOf: JsonLdIdReference;
  mainEntity: JsonLdIdReference;
};

export type MobileApplicationJsonLdNode = {
  '@type': 'MobileApplication';
  '@id': string;
  url: string;
  name: string;
  description: string;
  operatingSystem: string;
  applicationCategory: string;
  publisher: JsonLdIdReference;
};

export type JsonLdNode =
  | WebSiteJsonLdNode
  | OrganizationJsonLdNode
  | ImageObjectJsonLdNode
  | WebPageJsonLdNode
  | MobileApplicationJsonLdNode;

export type JsonLdGraph = {
  '@context': 'https://schema.org';
  '@graph': JsonLdNode[];
};

export const SITE_URL = 'https://invisiblesloth.com/';
export const TRACER_URL = `${SITE_URL}tracer/`;
export const WEBSITE_ID = `${SITE_URL}#website`;
export const ORGANIZATION_ID = `${SITE_URL}#organization`;
export const LOGO_ID = `${SITE_URL}#logo`;
export const TRACER_WEBPAGE_ID = `${TRACER_URL}#webpage`;
export const TRACER_APP_ID = `${TRACER_URL}#app`;

export const DEFAULT_SOCIAL_IMAGE: SocialImage = {
  src: '/social-card.png',
  alt: 'Invisible Sloth social card featuring the Invisible Sloth name, “Imaginative Games & Apps,” and Sloth-Luc, the ghost sloth logo.',
  width: 1200,
  height: 630,
};

function idReference(id: string): JsonLdIdReference {
  return { '@id': id };
}

function createIdentityNodes(): [
  WebSiteJsonLdNode,
  OrganizationJsonLdNode,
  ImageObjectJsonLdNode,
] {
  const logoUrl = `${SITE_URL}apple-touch-icon.png`;

  return [
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: SITE_URL,
      name: 'Invisible Sloth',
      alternateName: 'invisiblesloth.com',
      publisher: idReference(ORGANIZATION_ID),
    },
    {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: 'Invisible Sloth',
      legalName: 'Invisible Sloth, LLC',
      url: SITE_URL,
      sameAs: ['https://github.com/invisiblesloth'],
      logo: idReference(LOGO_ID),
    },
    {
      '@type': 'ImageObject',
      '@id': LOGO_ID,
      url: logoUrl,
      contentUrl: logoUrl,
      width: 180,
      height: 180,
    },
  ];
}

export function createHomepageJsonLd(): JsonLdGraph {
  return {
    '@context': 'https://schema.org',
    '@graph': createIdentityNodes(),
  };
}

export function createTracerJsonLd(
  pageTitle: string,
  pageDescription: string,
): JsonLdGraph {
  const identityNodes = createIdentityNodes();

  return {
    '@context': 'https://schema.org',
    '@graph': [
      ...identityNodes,
      {
        '@type': 'WebPage',
        '@id': TRACER_WEBPAGE_ID,
        url: TRACER_URL,
        name: pageTitle,
        description: pageDescription,
        isPartOf: idReference(WEBSITE_ID),
        mainEntity: idReference(TRACER_APP_ID),
      },
      {
        '@type': 'MobileApplication',
        '@id': TRACER_APP_ID,
        url: TRACER_URL,
        name: 'Tracer',
        description:
          'Tracer is currently in private beta. It is an on-device time tracker for iPhone with no account or cloud service.',
        operatingSystem: 'iOS 18 or later',
        applicationCategory: 'UtilitiesApplication',
        publisher: idReference(ORGANIZATION_ID),
      },
    ],
  };
}

export function serializeJsonLd(graph: JsonLdGraph): string {
  return JSON.stringify(graph)
    .replace(/&/g, '\\u0026')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
