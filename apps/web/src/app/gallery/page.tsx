import Image, { getImageProps } from 'next/image';
import { gradientPlaceholder } from '@/lib/image-utils';

const images = [
  {
    id: 'mountain',
    src: 'https://picsum.photos/seed/mountain/800/600',
    alt: 'Mountain landscape',
    blurDataURL: gradientPlaceholder([104, 122, 138], [178, 190, 200]),
  },
  {
    id: 'ocean',
    src: 'https://picsum.photos/seed/ocean/800/600',
    alt: 'Ocean sunset',
    blurDataURL: gradientPlaceholder([201, 122, 78], [64, 78, 116]),
  },
  {
    id: 'forest',
    src: 'https://picsum.photos/seed/forest/800/600',
    alt: 'Forest path',
    blurDataURL: gradientPlaceholder([62, 88, 58], [140, 156, 106]),
  },
  {
    id: 'city',
    src: 'https://picsum.photos/seed/city/800/600',
    alt: 'City skyline',
    blurDataURL: gradientPlaceholder([70, 78, 94], [168, 176, 190]),
  },
];

/**
 * Art direction, which is a different problem from responsive sizing.
 *
 * Responsive sizing serves the same picture at the width it will be drawn at.
 * Art direction serves a *different* picture: a wide landscape crop reads as a
 * letterbox strip on a phone, so narrow viewports get a portrait crop of the
 * same scene instead.
 *
 * `getImageProps` gives the srcset the optimiser would have produced, which is
 * then attached to <source> elements the browser chooses between. Each source
 * carries its own width and height so the box is reserved at that source's
 * aspect ratio — without them the reserved space would come from the <img>
 * fallback alone, and the crop that did not match it would shift the page.
 *
 * `preload` belongs to the Image component, which is not what renders here, so
 * the hero asks for priority the platform way instead. Both halves are needed:
 * fetchPriority raises it in the queue, and loading="eager" is what stops it
 * being deferred at all — getImageProps hands back loading="lazy" by default,
 * which on the LCP element cancels out the priority it was just given.
 */
function HeroWithArtDirection() {
  const common = { alt: 'Featured landscape', sizes: '100vw', quality: 85 };

  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({
    ...common,
    src: 'https://picsum.photos/seed/gallery-hero-wide/1440/600',
    width: 1440,
    height: 600,
  });

  const {
    props: { srcSet: portraitSrcSet, ...fallback },
  } = getImageProps({
    ...common,
    src: 'https://picsum.photos/seed/gallery-hero-tall/750/900',
    width: 750,
    height: 900,
  });

  return (
    <picture>
      <source
        height={600}
        media="(min-width: 1024px)"
        srcSet={desktopSrcSet}
        width={1440}
      />
      <source
        height={900}
        media="(max-width: 1023px)"
        srcSet={portraitSrcSet}
        width={750}
      />
      {/* biome-ignore lint/performance/noImgElement: art direction needs <picture>, which next/image does not render */}
      <img
        {...fallback}
        alt={common.alt}
        className="w-full rounded-lg"
        fetchPriority="high"
        loading="eager"
        style={{ height: 'auto' }}
      />
    </picture>
  );
}

export default function GalleryPage() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-8 font-bold text-3xl">Photo Gallery</h1>

      <section className="mb-8">
        <HeroWithArtDirection />
      </section>

      {/*
        Below the fold, so these stay lazy.

        Two columns with a 1rem gap inside the 832px content box means 408px
        each. Each one now paints its placeholder immediately instead of
        holding an empty box: the aspect-ratio wrapper already reserved the
        space, and the blur fills it.
      */}
      <div className="grid grid-cols-2 gap-4">
        {images.map((image) => (
          <div className="relative aspect-[4/3]" key={image.id}>
            <Image
              alt={image.alt}
              blurDataURL={image.blurDataURL}
              className="rounded-lg object-cover"
              fill
              placeholder="blur"
              quality={75}
              sizes="(min-width: 896px) 408px, calc((100vw - 5rem) / 2)"
              src={image.src}
            />
          </div>
        ))}
      </div>

      <section className="mt-8 rounded bg-gray-100 p-4">
        <h2 className="mb-2 font-semibold">What next/image does here</h2>
        <ul className="list-inside list-disc text-gray-600 text-sm">
          <li>Serves AVIF or WebP, falling back to the original format</li>
          <li>Gives the hero a landscape crop and phones a portrait one</li>
          <li>Fills each box with a blur until the photograph arrives</li>
          <li>Picks a width from `sizes` instead of shipping the full file</li>
          <li>Reserves space through the aspect-ratio wrapper, so no shift</li>
        </ul>
      </section>
    </main>
  );
}
