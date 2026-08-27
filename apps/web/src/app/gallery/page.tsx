import Image, { getImageProps } from 'next/image';
import dusk from '../../../public/gallery/dusk.png';
import ember from '../../../public/gallery/ember.png';
import heroTall from '../../../public/gallery/hero-tall.png';
import heroWide from '../../../public/gallery/hero-wide.png';
import moss from '../../../public/gallery/moss.png';
import slate from '../../../public/gallery/slate.png';

/**
 * Static imports rather than remote URLs.
 *
 * A remote image makes the page depend on another host being reachable, and
 * its blur placeholder has to be supplied by hand because there is no file to
 * read. Importing the file gives Next its intrinsic width and height and lets
 * it generate `blurDataURL` from the image itself — the placeholder becomes a
 * real low-resolution preview rather than a stand-in.
 *
 * These are generated gradients, not photographs;
 * scripts/generate-gallery-images.mjs rebuilds them.
 */

const images = [
  { id: 'slate', src: slate, alt: 'Gradient in slate blue and pale grey' },
  { id: 'ember', src: ember, alt: 'Gradient from ember orange into deep blue' },
  { id: 'moss', src: moss, alt: 'Gradient in moss green' },
  { id: 'dusk', src: dusk, alt: 'Gradient from dusk blue into pale violet' },
];

/**
 * Art direction, which is a different problem from responsive sizing.
 *
 * Responsive sizing serves the same picture at the width it will be drawn at.
 * Art direction serves a *different* picture: a wide crop reads as a letterbox
 * strip on a phone, so narrow viewports get a tall crop instead.
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
  const common = { alt: 'Gradient from deep blue into warm sand', quality: 85 };

  const {
    props: { srcSet: wideSrcSet },
  } = getImageProps({ ...common, src: heroWide, sizes: '100vw' });

  const {
    props: { srcSet: tallSrcSet, ...fallback },
  } = getImageProps({ ...common, src: heroTall, sizes: '100vw' });

  return (
    <picture>
      <source
        height={heroWide.height}
        media="(min-width: 1024px)"
        srcSet={wideSrcSet}
        width={heroWide.width}
      />
      <source
        height={heroTall.height}
        media="(max-width: 1023px)"
        srcSet={tallSrcSet}
        width={heroTall.width}
      />
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
        each. Each one paints its blur preview immediately instead of holding
        an empty box: the aspect-ratio wrapper already reserved the space.
      */}
      <div className="grid grid-cols-2 gap-4">
        {images.map((image) => (
          <div className="relative aspect-[4/3]" key={image.id}>
            <Image
              alt={image.alt}
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
          <li>Gives the hero a wide crop and narrow viewports a tall one</li>
          <li>Fills each box with a blur preview built from the file itself</li>
          <li>Picks a width from `sizes` instead of shipping the full file</li>
          <li>Reserves space through the aspect-ratio wrapper, so no shift</li>
        </ul>
      </section>
    </main>
  );
}
